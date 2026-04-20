import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import * as THREE from 'three';
import fs from 'fs';
import { ArrayBuffer } from 'buffer';

// This is a bit complex for a quick script because GLTFLoader usually works in a browser.
// I'll try a simpler approach: read the file as JSON if it's GLTF, but it's GLB.
// I'll use a simplified GLB parser to find strings like 'morphTarget'.

const buffer = fs.readFileSync('c:/Users/vikas/OneDrive/Desktop/M.O.M/frontend/src/assets/kawaii__cute_flying_robot.glb');
const decoder = new TextDecoder('utf-8');
const content = decoder.decode(buffer);

// Check for common morph target names or animation names in the binary string
const commonMorphs = ['blink', 'smile', 'happy', 'sad', 'mouth', 'eye', 'expression'];
const foundMorphs = commonMorphs.filter(m => content.toLowerCase().includes(m.toLowerCase()));

console.log('Potential Morph/Animation keywords found:', foundMorphs);

// Check animations
const animKeywords = ['animation', 'clip', 'track'];
const foundAnims = animKeywords.filter(k => content.toLowerCase().includes(k.toLowerCase()));
console.log('Animation keywords found:', foundAnims);
