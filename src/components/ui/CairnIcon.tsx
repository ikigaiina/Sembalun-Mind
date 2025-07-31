interface CairnIconProps {
  size?: number;
  progress?: number; // 0-100
  className?: string;
}

export const CairnIcon: React.FC<CairnIconProps> = ({ 
  size = 24, 
  progress = 100, 
  className = '' 
}) => {
  const stones = [
    { x: 12, y: 20, width: 8, height: 4, rx: 2, opacity: progress >= 20 ? 1 : 0.3 },
    { x: 10, y: 16, width: 12, height: 4, rx: 2, opacity: progress >= 40 ? 1 : 0.3 },
    { x: 8, y: 11, width: 16, height: 5, rx: 2.5, opacity: progress >= 60 ? 1 : 0.3 },
    { x: 10, y: 7, width: 12, height: 4, rx: 2, opacity: progress >= 80 ? 1 : 0.3 },
    { x: 12, y: 4, width: 8, height: 3, rx: 1.5, opacity: progress >= 100 ? 1 : 0.3 },
  ];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {stones.map((stone, index) => (
        <rect
          key={index}
          x={stone.x}
          y={stone.y}
          width={stone.width}
          height={stone.height}
          rx={stone.rx}
          fill="currentColor"
          opacity={stone.opacity}
          className="transition-opacity duration-500 ease-in-out"
        />
      ))}
    </svg>
  );
};