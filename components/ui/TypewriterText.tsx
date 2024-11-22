import { useEffect, useState } from 'react';

interface TypewriterTextProps {
  text: string;
  delay?: number;
  className?: string;
}

export const TypewriterText = ({ text, delay = 50, className = '' }: TypewriterTextProps) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

  // Blinking cursor effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530); // Slightly longer than typical cursor blink for better effect

    return () => clearInterval(cursorInterval);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isDeleting && currentIndex === text.length) {
        // Finished typing, wait before deleting
        setTimeout(() => setIsDeleting(true), 2000);
        return;
      }

      if (isDeleting && currentIndex === 0) {
        // Finished deleting, start typing again
        setIsDeleting(false);
        return;
      }

      const nextIndex = isDeleting ? currentIndex - 1 : currentIndex + 1;
      setCurrentIndex(nextIndex);
      setDisplayText(text.substring(0, nextIndex));
    }, delay);

    return () => clearTimeout(timer);
  }, [currentIndex, delay, isDeleting, text]);

  return (
    <span className={className}>
      {displayText}
      <span 
        className="ml-[1px] -mr-[1px] inline-block w-[2px] h-[1.1em] align-middle"
        style={{ 
          backgroundColor: showCursor ? 'currentColor' : 'transparent',
          transition: 'background-color 0.1s ease-in-out'
        }}
      />
    </span>
  );
};
