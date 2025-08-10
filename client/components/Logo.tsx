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
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20'
  };

  const [src, setSrc] = React.useState('/logo.png');
  const [error, setError] = React.useState(false);

  if (error) {
    // عرض نص بديل مع تصميم جميل عند عدم وجود اللوغو
    return (
      <div className={`${sizeClasses[size]} bg-green-primary rounded-full flex items-center justify-center text-white font-bold ${size === 'lg' ? 'text-2xl' : size === 'md' ? 'text-lg' : 'text-sm'} ${className}`}>
        BH
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} flex items-center justify-center ${className}`}>
      <img
        src={src}
        alt="Bursa Hilal Logo"
        className="max-w-full max-h-full object-contain"
        onError={() => {
          if (src === '/logo.png') {
            setSrc('/LOGO2.avif');
          } else if (src === '/LOGO2.avif') {
            setSrc('/company-logo.png');
          } else {
            setError(true);
          }
        }}
      />
    </div>
  );
};

export default Logo; 