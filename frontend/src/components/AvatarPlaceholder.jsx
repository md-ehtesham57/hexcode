const AvatarPlaceholder = ({ className = "w-10 h-10" }) => (
  <svg 
    viewBox="0 0 100 100" 
    xmlns="http://www.w3.org/2000/svg"
    className={`${className} rounded-full bg-black/30 border border-gray-200/10 p-1.5`}
  >
    <defs>
      <linearGradient id="hexcodeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" /> {/* Primary */}
        <stop offset="100%" style="stop-color:#f43f5e;stop-opacity:1" /> {/* Secondary */}
      </linearGradient>
    </defs>
    
    <circle cx="50" cy="50" r="48" fill="none" stroke="url(#hexcodeGradient)" stroke-width="1.5" stroke-opacity="0.1" />
    <circle cx="50" cy="40" r="16" fill="url(#hexcodeGradient)" />
    <path d="M26 80 C26 62, 74 62, 74 80 Z" fill="url(#hexcodeGradient)" />
  </svg>
);

export default AvatarPlaceholder;