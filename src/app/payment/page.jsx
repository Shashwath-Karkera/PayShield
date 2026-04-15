'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PaymentRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/en/payment');
  }, [router]);

  return null;
}
