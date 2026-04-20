import fs from 'fs';

const buffer = fs.readFileSync('c:/Users/vikas/OneDrive/Desktop/M.O.M/frontend/src/assets/kawaii__cute_flying_robot.glb');
const chunk0Length = buffer.readUInt32LE(12);
const jsonContent = buffer.toString('utf8', 20, 20 + chunk0Length);
const gltf = JSON.parse(jsonContent);

console.log('--- GLTF Node & Mesh Info ---');

if (gltf.nodes) {
  console.log('Nodes:', gltf.nodes.map(n => n.name));
}

if (gltf.meshes) {
  gltf.meshes.forEach(mesh => {
    console.log(`Mesh: "${mesh.name}"`);
    if (mesh.primitives[0].targets) {
        console.log(`  - Morph Targets Found!`);
        // Check for target names in extras or other places
        if (mesh.extras && mesh.extras.targetNames) {
            console.log(`  - Names: ${mesh.extras.targetNames.join(', ')}`);
        }
    }
  });
}
