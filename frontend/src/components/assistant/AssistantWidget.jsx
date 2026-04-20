import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment, Stage } from '@react-three/drei';
import AssistantModel from './AssistantModel';
import ChatInterface from './ChatInterface';
import { Sparkles } from 'lucide-react';

const AssistantWidget = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-4 pointer-events-none">
      {/* Chat Window */}
      {isOpen && (
        <div className="pointer-events-auto">
          <ChatInterface 
            onClose={() => setIsOpen(false)} 
          />
        </div>
      )}

      {/* 3D Model Trigger */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-40 h-40 group cursor-pointer pointer-events-auto transition-transform hover:scale-110 active:scale-95 translate-y-4 md:translate-y-0"
      >
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-[var(--accent)] rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
        
        {/* Interaction Indicator */}
        {!isOpen && (
           <div className="absolute -top-6 right-0 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl border border-white flex items-center gap-2 animate-bounce whitespace-nowrap">
             <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]"></div>
             <span className="text-[10px] font-black text-[var(--accent)] uppercase tracking-[0.15em]">Talk to M.O.M</span>
           </div>
        )}

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
              minPolarAngle={Math.PI / 2} 
              maxPolarAngle={Math.PI / 2} 
            />
          </Canvas>
        </div>
      </div>
    </div>
  );
};


export default AssistantWidget;
