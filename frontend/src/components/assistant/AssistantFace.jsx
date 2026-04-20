import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';

const AssistantFace = ({ expression = 'happy' }) => {
  const canvasRef = useRef(document.createElement('canvas'));

  const texture = useMemo(() => {
    const canvas = canvasRef.current;
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    const drawExpression = () => {
      ctx.clearRect(0, 0, 512, 512);
      
      // Face styling - Transparent background (removed rect)
      ctx.strokeStyle = '#818cf8'; // Accent color for features
      ctx.lineWidth = 25; // Thicker lines for visibility
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';


      switch (expression) {
        case 'happy':
          // Cute inverted V eyes
          ctx.beginPath();
          ctx.moveTo(150, 250); ctx.lineTo(190, 210); ctx.lineTo(230, 250);
          ctx.moveTo(280, 250); ctx.lineTo(320, 210); ctx.lineTo(360, 250);
          ctx.stroke();
          // Small smile
          ctx.beginPath();
          ctx.moveTo(230, 320); ctx.quadraticCurveTo(256, 350, 282, 320);
          ctx.stroke();
          break;
        
        case 'strict':
          // Narrowed, serious eyes
          ctx.beginPath();
          ctx.moveTo(140, 230); ctx.lineTo(240, 230);
          ctx.moveTo(270, 230); ctx.lineTo(370, 230);
          ctx.stroke();
          // Straight mouth
          ctx.beginPath();
          ctx.moveTo(230, 330); ctx.lineTo(282, 330);
          ctx.stroke();
          break;

        case 'thinking':
          // Scanning lines / dots
          ctx.fillStyle = '#818cf8';
          ctx.beginPath();
          ctx.arc(160, 230, 15, 0, Math.PI * 2);
          ctx.arc(256, 230, 15, 0, Math.PI * 2);
          ctx.arc(352, 230, 15, 0, Math.PI * 2);
          ctx.fill();
          // Long scan line
          ctx.beginPath();
          ctx.moveTo(150, 300); ctx.lineTo(360, 300);
          ctx.stroke();
          break;

        case 'proud':
          // Heart eyes or starry eyes
          ctx.fillStyle = '#f472b6';
          ctx.font = 'bold 120px serif';
          ctx.fillText('❤', 130, 280);
          ctx.fillText('❤', 270, 280);
          // Big smile
          ctx.strokeStyle = '#f472b6';
          ctx.beginPath();
          ctx.arc(256, 320, 40, 0, Math.PI, false);
          ctx.stroke();
          break;

        default:
          // Default neutral
          ctx.beginPath();
          ctx.arc(190, 230, 15, 0, Math.PI * 2);
          ctx.arc(320, 230, 15, 0, Math.PI * 2);
          ctx.fill();
      }
    };

    drawExpression();
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, [expression]);

  return (
    <meshBasicMaterial 
      map={texture} 
      transparent 
      opacity={1.0} 
      depthTest={false} // Ensure it's always drawn on top of the model
      polygonOffset 
      polygonOffsetFactor={-1} 
    />
  );
};

export default AssistantFace;
