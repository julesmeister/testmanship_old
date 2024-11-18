import { useEffect } from 'react';
import NProgress from 'nprogress';
import { usePathname, useSearchParams } from 'next/navigation';

// Configure NProgress once
NProgress.configure({ 
  showSpinner: false,
  trickleSpeed: 100,
  minimum: 0.3,
  easing: 'ease',
  speed: 500,
});

export function startProgress() {
  NProgress.start();
}

export function stopProgress() {
  NProgress.done();
}

export function ProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Start progress when route changes
    startProgress();
    
    const timer = setTimeout(() => {
      stopProgress();
    }, 300);

    return () => {
      clearTimeout(timer);
      stopProgress();
    };
  }, [pathname, searchParams]);

  return null;
}
