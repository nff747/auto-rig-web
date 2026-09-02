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

  for (let i = 0; i < vertexCount; i++) {
    const vx = positions[i * 3 + 0];
    const vy = positions[i * 3 + 1];
    const vz = positions[i * 3 + 2];
    
    const distances: { index: number, weight: number }[] = [];
    
    for (let b = 0; b < bonePositions.length; b++) {
      const bPos = bonePositions[b];
      const dx = vx - bPos.x;
      const dy = vy - bPos.y;
      const dz = vz - bPos.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      
      const weight = 1.0 / Math.pow(dist + 0.001, falloff);
      distances.push({ index: b, weight });
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
      const { posBuffer, indicesBuffer, weightsBuffer, falloff } = payload;
      const positions = new Float32Array(posBuffer);
      const skinIndices = new Uint16Array(indicesBuffer);
      const skinWeights = new Float32Array(weightsBuffer);

      const rig = await detectJoints(positions);
      calculateBoneWeights(positions, rig, falloff, skinIndices, skinWeights);

      self.postMessage({ type: 'RIG_DONE', payload: { rig }, msgId });
    }
  } catch (err: any) {
    self.postMessage({ type: 'ERROR', payload: err.message, msgId });
  }
};
