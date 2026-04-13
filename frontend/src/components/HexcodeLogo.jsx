const HexcodeLogo = ({ className = "w-9 h-9" }) => {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* The most subtle gradient possible: daisyUI info to daisyUI primary */}
        <linearGradient id="minimalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3abff8" /> {/* daisyUI info (Cyan) */}
          <stop offset="100%" stopColor="#818cf8" /> {/* daisyUI primary (Indigo) */}
        </linearGradient>
      </defs>

      {/* A single, continuous thin line path (strokeWidth 3.5) */}
      <path 
        d="M50 10 L88 32 V68 M88 68 L50 90 L12 68 V32 L50 10 M12 32 M32 40 L22 50 L32 60 M68 40 L78 50 L68 60 M50 35 V65" 
        stroke="url(#minimalGradient)" 
        strokeWidth="3.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />

    </svg>
  );
};

export default HexcodeLogo;