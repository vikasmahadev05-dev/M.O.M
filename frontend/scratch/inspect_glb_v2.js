import fs from 'fs';

const buffer = fs.readFileSync('c:/Users/vikas/OneDrive/Desktop/M.O.M/frontend/src/assets/kawaii__cute_flying_robot.glb');

// GLB Header: magic (4), version (4), length (4)
// Chunk 0: length (4), type (4), data (length)
const chunk0Length = buffer.readUInt32LE(12);
const chunk0Type = buffer.readUInt32LE(16); // Should be 0x4E4F534A (JSON)

if (chunk0Type === 0x4E4F534A) {
  const jsonContent = buffer.toString('utf8', 20, 20 + chunk0Length);
  const gltf = JSON.parse(jsonContent);
  
  console.log('--- GLTF JSON Chunk Found ---');
  
  if (gltf.animations) {
    console.log('Animations:', gltf.animations.map(a => a.name));
  } else {
    console.log('No animations found.');
  }
  
  if (gltf.meshes) {
    gltf.meshes.forEach(mesh => {
      if (mesh.primitives[0].targets) {
        console.log(`Mesh "${mesh.name}" has morph targets:`, mesh.extras?.targetNames || 'Unnamed targets');
      }
    });
  }
} else {
  console.log('Could not find JSON chunk in GLB.');
}
