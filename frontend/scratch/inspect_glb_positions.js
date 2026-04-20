import fs from 'fs';

const buffer = fs.readFileSync('c:/Users/vikas/OneDrive/Desktop/M.O.M/frontend/src/assets/kawaii__cute_flying_robot.glb');
const chunk0Length = buffer.readUInt32LE(12);
const jsonContent = buffer.toString('utf8', 20, 20 + chunk0Length);
const gltf = JSON.parse(jsonContent);

console.log('--- GLTF Node Positions ---');

if (gltf.nodes) {
  gltf.nodes.forEach((node, index) => {
    console.log(`Node ${index}: "${node.name}" | Position: ${JSON.stringify(node.translation || [0,0,0])} | Rotation: ${JSON.stringify(node.rotation || [0,0,0,1])}`);
  });
}
