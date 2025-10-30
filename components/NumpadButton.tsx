
import React from 'react';

interface NumpadButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

const NumpadButton: React.FC<NumpadButtonProps> = ({ onClick, children, className = '', disabled = false }) => {
  const baseClasses = `
    h-20 w-full rounded-2xl 
    bg-gray-700/50 
    text-3xl font-medium 
    flex items-center justify-center 
    transition-all duration-150 ease-in-out 
    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50
  `;
  
  const stateClasses = disabled 
    ? 'cursor-not-allowed opacity-50' 
    : 'hover:bg-gray-600/70 active:bg-gray-800 active:scale-95';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${stateClasses} ${className}`}
    >
      {children}
    </button>
  );
};

export default NumpadButton;
