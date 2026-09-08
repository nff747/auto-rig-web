import * as ort from 'onnxruntime-web';
import { SkeletonRig, JointType, Joint } from '../types';

let session: ort.InferenceSession | null = null;

function constructSkeleton(keypoints: Float32Array, confidences: Float32Array): SkeletonRig {
  const joints = {} as Record<JointType, Joint>;
  const types = Object.values(JointType);
  
  for (let i = 0; i < types.length; i++) {
    joints[types[i]] = {
      type: types[i],
      position: {
        x: keypoints[i * 3 + 0],
        y: keypoints[i * 3 + 1],
        z: keypoints[i * 3 + 2]
      },
      confidence: confidences[i]
    };
  }

  const hierarchy: Record<JointType, JointType[]> = {
    [JointType.Hips]: [JointType.Spine, JointType.LeftUpLeg, JointType.RightUpLeg],
    [JointType.Spine]: [JointType.Chest],
    [JointType.Chest]: [JointType.Neck, JointType.LeftShoulder, JointType.RightShoulder],
    [JointType.Neck]: [JointType.Head],
    [JointType.Head]: [],
    [JointType.LeftShoulder]: [JointType.LeftArm],
    [JointType.LeftArm]: [JointType.LeftForeArm],
    [JointType.LeftForeArm]: [JointType.LeftHand],
    [JointType.LeftHand]: [],
    [JointType.RightShoulder]: [JointType.RightArm],
    [JointType.RightArm]: [JointType.RightForeArm],
    [JointType.RightForeArm]: [JointType.RightHand],
    [JointType.RightHand]: [],
    [JointType.LeftUpLeg]: [JointType.LeftLeg],
    [JointType.LeftLeg]: [JointType.LeftFoot],
    [JointType.LeftFoot]: [],
    [JointType.RightUpLeg]: [JointType.RightLeg],
    [JointType.RightLeg]: [JointType.RightFoot],
    [JointType.RightFoot]: []
  };

  return { joints, hierarchy };
}

function meshToTensor(positions: Float32Array, resolution: number): ort.Tensor {
  const grid = new Float32Array(1 * 1 * resolution * resolution * resolution);
  const vertexCount = positions.length / 3;

  if (vertexCount === 0) {
    return new ort.Tensor('float32', grid, [1, 1, resolution, resolution, resolution]);
  }

  // 1. Compute Axis-Aligned Bounding Box (AABB)
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

  for (let i = 0; i < vertexCount; i++) {
    const x = positions[i * 3 + 0];
    const y = positions[i * 3 + 1];
    const z = positions[i * 3 + 2];
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
    if (z < minZ) minZ = z;
    if (z > maxZ) maxZ = z;
  }

  const rangeX = Math.max(maxX - minX, 1e-5);
  const rangeY = Math.max(maxY - minY, 1e-5);
  const rangeZ = Math.max(maxZ - minZ, 1e-5);
  const maxRange = Math.max(rangeX, rangeY, rangeZ);
  const scale = (resolution - 2) / maxRange;

  // 2. Voxelize mesh surface into 3D density grid
  for (let i = 0; i < vertexCount; i++) {
    const x = positions[i * 3 + 0];
    const y = positions[i * 3 + 1];
    const z = positions[i * 3 + 2];

    const vx = Math.floor((x - minX) * scale) + 1;
    const vy = Math.floor((y - minY) * scale) + 1;
    const vz = Math.floor((z - minZ) * scale) + 1;

    if (vx >= 0 && vx < resolution && vy >= 0 && vy < resolution && vz >= 0 && vz < resolution) {
      const idx = vx + vy * resolution + vz * resolution * resolution;
      grid[idx] = Math.min(1.0, grid[idx] + 0.25);
    }
  }

  return new ort.Tensor('float32', grid, [1, 1, resolution, resolution, resolution]);
}

async function detectJoints(positions: Float32Array): Promise<SkeletonRig> {
  if (!session) throw new Error('Model not initialized.');
  const tensor = meshToTensor(positions, 64);
  const feeds: Record<string, ort.Tensor> = { input_tensor: tensor };
  const results = await session.run(feeds);
  const keypoints = results.output_keypoints.data as Float32Array;
  const confidences = results.output_confidences.data as Float32Array;
  return constructSkeleton(keypoints, confidences);
}

function distToSegment(px: number, py: number, pz: number, ax: number, ay: number, az: number, bx: number, by: number, bz: number): number {
  const abx = bx - ax;
  const aby = by - ay;
  const abz = bz - az;
  const apx = px - ax;
  const apy = py - ay;
  const apz = pz - az;

  const abLenSq = abx * abx + aby * aby + abz * abz;
  if (abLenSq < 1e-8) {
    return Math.sqrt(apx * apx + apy * apy + apz * apz);
  }

  const t = Math.max(0, Math.min(1, (apx * abx + apy * aby + apz * abz) / abLenSq));
  const projX = ax + t * abx;
  const projY = ay + t * aby;
  const projZ = az + t * abz;

  const dx = px - projX;
  const dy = py - projY;
  const dz = pz - projZ;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function calculateBoneWeights(
  positions: Float32Array,
  rig: SkeletonRig,
  falloff: number,
  skinIndices: Uint16Array,
  skinWeights: Float32Array
): void {
  const vertexCount = positions.length / 3;
  const boneTypes = Object.keys(rig.joints) as JointType[];
  const bonePositions = boneTypes.map(type => rig.joints[type].position);

  // Build bone segments from hierarchy
  const segments: { boneIdx: number; ax: number; ay: number; az: number; bx: number; by: number; bz: number }[] = [];
  for (let b = 0; b < boneTypes.length; b++) {
    const parentType = boneTypes[b];
    const parentPos = rig.joints[parentType].position;
    const children = rig.hierarchy[parentType] || [];
    
    if (children.length > 0) {
      for (const childType of children) {
        const childPos = rig.joints[childType].position;
        segments.push({
          boneIdx: b,
          ax: parentPos.x, ay: parentPos.y, az: parentPos.z,
          bx: childPos.x, by: childPos.y, bz: childPos.z,
        });
      }
    } else {
      // Leaf joint: point capsule
      segments.push({
        boneIdx: b,
        ax: parentPos.x, ay: parentPos.y, az: parentPos.z,
        bx: parentPos.x, by: parentPos.y, bz: parentPos.z,
      });
    }
  }

  for (let i = 0; i < vertexCount; i++) {
    const vx = positions[i * 3 + 0];
    const vy = positions[i * 3 + 1];
    const vz = positions[i * 3 + 2];
    
    const distances: { index: number, weight: number }[] = [];
    
    for (const seg of segments) {
      const dist = distToSegment(vx, vy, vz, seg.ax, seg.ay, seg.az, seg.bx, seg.by, seg.bz);
      const weight = 1.0 / Math.pow(dist + 0.001, falloff);
      distances.push({ index: seg.boneIdx, weight });
    }
    
    distances.sort((a, b) => b.weight - a.weight);
    const top4 = distances.slice(0, 4);
    const totalWeight = top4.reduce((sum, d) => sum + d.weight, 0);
    
    skinIndices[i * 4 + 0] = top4[0]?.index ?? 0;
    skinIndices[i * 4 + 1] = top4[1]?.index ?? 0;
    skinIndices[i * 4 + 2] = top4[2]?.index ?? 0;
    skinIndices[i * 4 + 3] = top4[3]?.index ?? 0;
    
    skinWeights[i * 4 + 0] = (top4[0]?.weight ?? 0) / totalWeight;
    skinWeights[i * 4 + 1] = (top4[1]?.weight ?? 0) / totalWeight;
    skinWeights[i * 4 + 2] = (top4[2]?.weight ?? 0) / totalWeight;
    skinWeights[i * 4 + 3] = (top4[3]?.weight ?? 0) / totalWeight;
  }
}

self.onmessage = async (e: MessageEvent) => {
  const { type, payload, msgId } = e.data;

  try {
    if (type === 'INIT') {
      const { modelPath } = payload;
      ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/';
      session = await ort.InferenceSession.create(modelPath, {
        executionProviders: ['webgpu', 'webgl', 'wasm']
      });
      self.postMessage({ type: 'INIT_DONE', msgId });
    } 
    else if (type === 'RIG') {
      const { mode, posBuffer, indicesBuffer, weightsBuffer, falloff } = payload;
      const positions = new Float32Array(posBuffer);
      const skinIndices = new Uint16Array(indicesBuffer);
      const skinWeights = new Float32Array(weightsBuffer);

      const rig = await detectJoints(positions);
      calculateBoneWeights(positions, rig, falloff, skinIndices, skinWeights);

      if (mode === 'TRANSFERABLE') {
        self.postMessage({
          type: 'RIG_DONE',
          payload: { rig, indicesBuffer, weightsBuffer },
          msgId
        }, [indicesBuffer, weightsBuffer]);
      } else {
        self.postMessage({ type: 'RIG_DONE', payload: { rig }, msgId });
      }
    }
  } catch (err: any) {
    self.postMessage({ type: 'ERROR', payload: err.message, msgId });
  }
};
