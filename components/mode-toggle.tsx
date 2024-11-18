'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { IoMoon, IoSunny } from 'react-icons/io5';

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // useEffect only runs on the client, so now we can safely show the UI
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Button
      variant="ghost" 
      size="icon"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className="h-9 w-9 bg-transparent dark:bg-transparent"
      aria-label="Toggle theme"
    >
      {mounted && theme === 'light' ? (
        <IoMoon className="h-4 w-4 stroke-2" />
      ) : (
        <IoSunny className="h-4 w-4 stroke-2" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
