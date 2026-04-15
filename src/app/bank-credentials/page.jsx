'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BankCredentialsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/en/bank-credentials');
  }, [router]);

  return null;
}
