import { useEffect, useState } from 'react';
import { LANGUAGE_NAMES } from '@/types/language';

const languages = Object.values(LANGUAGE_NAMES);

export const LanguageScroll = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % languages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="inline-flex relative min-w-[160px] h-12 overflow-hidden rounded-lg">
      {/* Gradient background with glass effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/95 to-white/90 backdrop-blur-sm" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.8)_0%,rgba(255,255,255,0.2)_100%)]" />
      {/* Inner shadow and border */}
      <div className="absolute inset-0 rounded-lg shadow-[inset_0_0_8px_rgba(0,0,0,0.1)] border border-white/40" />
      
      <div
        className="absolute w-full transition-transform duration-500 ease-in-out px-6 z-10"
        style={{
          transform: `translateY(-${currentIndex * 48}px)`,
        }}
      >
        {languages.map((language) => (
          <div
            key={language}
            className="h-12 flex items-center justify-center font-['Lobster'] text-2xl tracking-wide whitespace-nowrap text-blue-600 font-semibold"
          >
            {language}
          </div>
        ))}
        {/* Duplicate first item to make the loop seamless */}
        <div 
          className="h-12 flex items-center justify-center font-['Lobster'] text-2xl tracking-wide whitespace-nowrap text-blue-300 font-semibold"
        >
          {languages[0]}
        </div>
      </div>
    </div>
  );
};
