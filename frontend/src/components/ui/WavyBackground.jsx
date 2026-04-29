import React from 'react';

const WavyBackground = () => {
  return (
    <div className="bg-wrapper">
      {/* 1. Base Gradient */}
      <div className="bg-base" />

      {/* 2. Color Blobs (Scale with viewport) */}
      <div className="bg-blob-left" />
      <div className="bg-blob-right" />

      {/* 3. Dotted Pattern (Right side focus) */}
      <div className="bg-dots" />

      {/* 4. THE MULTI-LAYER WAVE STACK (Responsive) */}
      <div className="wave-container !-bottom-20 md:!-bottom-24">
        {/* LIGHT WAVE (TOP - 1:3 Distribution) */}
        <svg 
          viewBox="0 0 1440 320" 
          className="wave wave-light"
          preserveAspectRatio="none"
        >
          <path 
            fill="rgba(255,255,255,0.6)"
            d="M0,180 C200,120 400,120 600,180 C750,240 850,150 950,190 C1050,230 1150,140 1250,180 C1350,220 1440,160 1440,160 L1440,320 L0,320 Z"
          />
        </svg>

        {/* DARK MAIN WAVE (Bottom - 2:4 Uneven Distribution) */}
        <svg 
          viewBox="0 0 1440 320" 
          className="wave wave-dark"
          preserveAspectRatio="none"
        >
          <path 
            fill="#F8F6F1"
            d="M0,240 C150,160 250,160 350,240 C450,300 550,200 650,260 C750,320 850,220 950,260 C1030,300 1110,210 1190,260 C1270,310 1350,220 1430,260 C1440,270 1440,240 1440,240 L1440,320 L0,320 Z"
          />
        </svg>

        {/* ACCENT DARK BLUE WAVE (Specific Bottom-Right Focus) */}
        <svg 
          viewBox="0 0 1440 320" 
          className="wave wave-accent-blue"
          preserveAspectRatio="none"
        >
          <path 
            fill="rgba(191, 219, 254, 0.4)"
            d="M720,320 C800,280 900,180 1000,240 C1100,300 1200,200 1300,260 C1400,320 1440,280 1440,280 L1440,320 L720,320 Z"
          />
        </svg>
      </div>
    </div>
  );
};

export default WavyBackground;
