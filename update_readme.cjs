const fs = require('fs');
let readme = fs.readFileSync('README.md', 'utf8');

const demoSection = `
## Live Demo

Try the interactive demo directly in your browser:
[![Edit auto-rig-web Demo](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/auto-rig-web-demo-placeholder)

<iframe src="https://codesandbox.io/embed/auto-rig-web-demo-placeholder?fontsize=14&hidenavigation=1&theme=dark"
  style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
  title="auto-rig-web-demo"
  allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
  sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
></iframe>
`;

const apiRefSection = `
## API Reference

The primary export of \`auto-rig-web\` is the \`AutoRigger\` class.

### \`AutoRigger\`

\`\`\`typescript
import { AutoRigger } from 'auto-rig-web';

const rigger = new AutoRigger({ skinningFalloff: 2.5 });
await rigger.init();
\`\`\`

#### \`AutoRigger.rig(mesh: THREE.Mesh): Promise<THREE.SkinnedMesh>\`
Analyzes the input static mesh, predicts joint locations, constructs a skeleton, and calculates procedural skin weights. Returns an IK-ready \`SkinnedMesh\`.

#### \`AutoRigger.setIKTarget(target: IKTarget): void\`
Assigns a 3D target for a specific joint to pull towards.
\`\`\`typescript
rigger.setIKTarget({ joint: JointType.LeftHand, position: new THREE.Vector3(1, 2, 0), influence: 1.0 });
\`\`\`

#### \`AutoRigger.animate(): void\`
Solves the Inverse Kinematics chains for the current frame. Call this inside your requestAnimationFrame loop.
`;

const frameworkSection = `
## Framework Integration

### React + Three.js (@react-three/fiber)
\`\`\`jsx
import { useFrame } from '@react-three/fiber';
import { AutoRigger } from 'auto-rig-web';

const rigger = new AutoRigger();
// ... inside component ...
const riggedMesh = await rigger.rig(staticMesh);
useFrame(() => rigger.animate());
\`\`\`

### Vue + Three.js (TresJS)
\`\`\`vue
<script setup>
import { useRenderLoop } from '@tresjs/core';
import { AutoRigger } from 'auto-rig-web';

const rigger = new AutoRigger();
const riggedMesh = await rigger.rig(staticMesh);
useRenderLoop().onLoop(() => rigger.animate());
</script>
\`\`\`

### Vanilla JS
\`\`\`javascript
import { AutoRigger } from 'auto-rig-web';

const rigger = new AutoRigger();
await rigger.init();
const riggedMesh = await rigger.rig(mesh);

function animate() {
  requestAnimationFrame(animate);
  rigger.animate();
  renderer.render(scene, camera);
}
animate();
\`\`\`
`;

const asciiDiagram = `
### Skeleton Layout (19-Bones)

\`\`\`text
       [Head]
         |
       [Neck]
         |
    --[Chest]--
   /     |     \\
[L.Sh] [Spine] [R.Sh]
  |      |       |
[L.Arm] [Hips] [R.Arm]
  |     /    \\    |
[L.FA] /      \\ [R.FA]
  | [L.UpLeg] [R.UpLeg] |
[L.Hnd]  |      |   [R.Hnd]
      [L.Leg] [R.Leg]
         |      |
     [L.Foot] [R.Foot]
\`\`\`
`;

// Insert the diagram under Architecture
readme = readme.replace('## Tech Stack', asciiDiagram + '\n## Tech Stack');

// Insert Demo right before Architecture
readme = readme.replace('## Architecture', demoSection + '\n## Architecture');

// Replace API Usage section with API Reference and Framework Integration
readme = readme.replace(/## API Usage[\s\S]*?(?=---)/, apiRefSection + '\n' + frameworkSection + '\n');

fs.writeFileSync('README.md', readme);
