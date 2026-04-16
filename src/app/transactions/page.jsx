'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TransactionsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/en/transactions');
  }, [router]);

  return null;
}
