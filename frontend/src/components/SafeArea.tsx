import React from 'react';

interface SafeAreaProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

const SafeArea: React.FC<SafeAreaProps> = ({ 
  children, 
  className = '', 
  style = {},
  edges = ['top', 'bottom', 'left', 'right']
}) => {
  const getSafeAreaStyle = () => {
    const safeAreaStyle: React.CSSProperties = {};
    
    if (edges.includes('top')) {
      safeAreaStyle.paddingTop = 'var(--safe-area-inset-top)';
    }
    if (edges.includes('bottom')) {
      safeAreaStyle.paddingBottom = 'var(--safe-area-inset-bottom)';
    }
    if (edges.includes('left')) {
      safeAreaStyle.paddingLeft = 'var(--safe-area-inset-left)';
    }
    if (edges.includes('right')) {
      safeAreaStyle.paddingRight = 'var(--safe-area-inset-right)';
    }
    
    return { ...safeAreaStyle, ...style };
  };

  return (
    <div 
      className={`safe-area ${className}`}
      style={getSafeAreaStyle()}
    >
      {children}
    </div>
  );
};

export default SafeArea;
