import React, { useState, Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment } from '@react-three/drei';
import { motion } from 'framer-motion';
import AssistantModel from './AssistantModel';
import ChatInterface from './ChatInterface';

const AssistantWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const lastTap = useRef(0);

  const handleTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTap.current < DOUBLE_TAP_DELAY) {
      setIsOpen(!isOpen);
    }
    lastTap.current = now;
  };

  return (
    <motion.div 
      drag
      dragMomentum={false}
      className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-4"
      style={{ touchAction: 'none' }}
    >
      {/* Chat Window */}
      {isOpen && (
        <div 
          className="pointer-events-auto"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <ChatInterface 
            onClose={() => setIsOpen(false)} 
          />
        </div>
      )}

      {/* 3D Model Trigger - Draggable Container */}
      <motion.div 
        onTap={handleTap}
        className="relative w-40 h-40 group cursor-grab active:cursor-grabbing transition-transform hover:scale-105 active:scale-95"
      >
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-[var(--accent)] rounded-full blur-3xl opacity-10 group-hover:opacity-30 transition-opacity"></div>
        
        {/* Hidden Indicator on Hover */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
           <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap bg-white/50 backdrop-blur-sm px-2 py-1 rounded-full">Double tap to talk</span>
        </div>

        <div className="w-full h-full relative z-10">
          <Canvas 
            shadows 
            camera={{ position: [0, 0, 4], fov: 40 }}
            style={{ width: '100%', height: '100%' }}
          >
            <ambientLight intensity={1.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2.5} />
            <pointLight position={[-10, -10, -10]} intensity={1.5} />
            
            <Suspense fallback={null}>
               <AssistantModel />
               <ContactShadows 
                 position={[0, -1, 0]} 
                 opacity={0.4} 
                 scale={10} 
                 blur={2} 
                 far={4.5} 
               />
               <Environment preset="city" />
            </Suspense>
            
            <OrbitControls 
              enableZoom={false} 
              enablePan={false} 
              enableRotate={true}
              minPolarAngle={Math.PI / 2.5} 
              maxPolarAngle={Math.PI / 1.5} 
            />
          </Canvas>
        </div>
      </motion.div>
    </motion.div>
  );
};
export default AssistantWidget;
