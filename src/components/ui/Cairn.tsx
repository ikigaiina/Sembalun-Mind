
interface CairnProps {
  progress: number; // 0-100
  size?: 'small' | 'medium' | 'large';
}

export const Cairn: React.FC<CairnProps> = ({ progress, size = 'medium' }) => {
  const sizeClasses = {
    small: 'w-12 h-16',
    medium: 'w-16 h-20',
    large: 'w-20 h-24'
  };

  const stones = [
    { opacity: progress >= 20 ? 1 : 0.3, size: 'w-3 h-2' },
    { opacity: progress >= 40 ? 1 : 0.3, size: 'w-4 h-2' },
    { opacity: progress >= 60 ? 1 : 0.3, size: 'w-5 h-3' },
    { opacity: progress >= 80 ? 1 : 0.3, size: 'w-4 h-2' },
    { opacity: progress >= 100 ? 1 : 0.3, size: 'w-3 h-2' }
  ];

  return (
    <div className={`${sizeClasses[size]} flex flex-col items-center justify-end space-y-0.5`}>
      {stones.reverse().map((stone, index) => (
        <div
          key={index}
          className={`${stone.size} bg-gradient-to-r from-gray-500 to-gray-600 rounded-full transition-opacity duration-500`}
          style={{ opacity: stone.opacity }}
        />
      ))}
    </div>
  );
};