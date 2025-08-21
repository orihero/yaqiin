import React from 'react';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

// Telegram-style background colors
const avatarColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2',
  '#F9E79F', '#A9DFBF', '#FAD7A0', '#D5A6BD', '#A3E4D7'
];

// Generate consistent color based on name
const getColorFromName = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % avatarColors.length;
  return avatarColors[index];
};

// Generate initials from name
const getInitials = (name: string): string => {
  if (!name) return '?';
  
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-sm',
  lg: 'w-16 h-16 text-lg',
  xl: 'w-24 h-24 text-2xl'
};

const Avatar: React.FC<AvatarProps> = ({ 
  src, 
  alt = 'Avatar', 
  name = 'User', 
  size = 'lg',
  className = ''
}) => {
  const hasImage = src && src.trim() !== '';
  const initials = getInitials(name);
  const backgroundColor = getColorFromName(name);

  if (hasImage) {
    return (
      <img
        src={src}
        alt={alt}
        className={`rounded-full object-cover ${sizeClasses[size]} ${className}`}
        onError={(e) => {
          // If image fails to load, hide it and show initials
          e.currentTarget.style.display = 'none';
          const parent = e.currentTarget.parentElement;
          if (parent) {
            const initialsElement = parent.querySelector('.avatar-initials') as HTMLElement;
            if (initialsElement) {
              initialsElement.style.display = 'flex';
            }
          }
        }}
      />
    );
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold text-white ${sizeClasses[size]} ${className}`}
      style={{ backgroundColor }}
    >
      {initials}
    </div>
  );
};

export default Avatar;
