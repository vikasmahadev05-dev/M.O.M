import React, { useRef } from 'react';
import { useGLTF, Float } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import AssistantFace from './AssistantFace';

const AssistantModel = ({ expression = 'happy' }) => {
  // Load the new kawaii model from the assets folder
  const { scene } = useGLTF('/src/assets/kawaii__cute_flying_robot.glb');
  const robotRef = useRef();

  useFrame((state) => {
    // Front-facing position
  });

  return (
    <group ref={robotRef} dispose={null}>
      <Float
        speed={2} // Balanced speed
        rotationIntensity={0.3} // Subtle rotation
        floatIntensity={2} // Sufficient floating without being excessive
      >
        <primitive object={scene} scale={0.56} />
      </Float>
    </group>
  );
};


export default AssistantModel;
