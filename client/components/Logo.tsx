import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const [src, setSrc] = React.useState('/logo.png');
  const [error, setError] = React.useState(false);

  if (error) {
    return null;
  }

  return (
    <img
      src={src}
      alt="Logo"
      className={`${sizeClasses[size]} object-contain ${className}`}
      onError={() => {
        if (src === '/logo.png') {
          setSrc('/LOGO2.avif');
        } else {
          setError(true);
        }
      }}
    />
  );
};

export default Logo; 