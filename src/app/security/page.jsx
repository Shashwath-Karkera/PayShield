'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SecurityRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/en/security');
  }, [router]);

  return null;
}
