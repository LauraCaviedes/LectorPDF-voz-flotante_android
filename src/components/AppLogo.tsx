import React from 'react';

interface AppLogoProps {
  className?: string;
  size?: number;
}

/**
 * Logotipo oficial de la aplicación basado en el diseño enviado por el usuario:
 * Anillo exterior verde (#76CA49), círculo interior blanco y corazón magenta (#A21D8D).
 */
export const AppLogo: React.FC<AppLogoProps> = ({ className = "w-8 h-8", size = 40 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Círculo exterior Verde */}
      <circle cx="100" cy="100" r="94" stroke="#76CA49" strokeWidth="18" fill="white" />
      
      {/* Corazón Magenta en el centro */}
      <path
        d="M100 156C100 156 42 120 42 78C42 56 58 40 78 40C90 40 97 47 100 52C103 47 110 40 122 40C142 40 158 56 158 78C158 120 100 156 100 156Z"
        fill="#A21D8D"
      />
    </svg>
  );
};
