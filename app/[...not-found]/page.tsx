'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function NotFoundCatchAll() {
  const router = useRouter();

  useEffect(() => {
    toast.error('This page is not available');
    router.push('/dashboard/main');
  }, [router]);

  return null; // Component will redirect immediately
}
