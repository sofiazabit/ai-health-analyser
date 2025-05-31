import React from 'react';

interface TabButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  ariaControls: string;
}

const TabButton: React.FC<TabButtonProps> = ({ label, isActive, onClick, ariaControls }) => {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-controls={ariaControls}
      onClick={onClick}
      className={`
        px-2 sm:px-3 py-2 font-medium text-xs sm:text-sm rounded-t-md whitespace-nowrap
        focus:outline-none focus:ring-2 focus:ring-accent focus:z-10
        ${isActive 
          ? 'border-primary border-b-2 text-primary' 
          : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent'
        }
      `}
    >
      {label}
    </button>
  );
};

export default TabButton;
