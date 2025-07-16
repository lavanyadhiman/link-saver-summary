'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import AuthForm from '@/components/AuthForm';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>, email: string, password: string) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    setIsLoading(false);
    if (res.ok) {
      router.push('/');
      router.refresh(); 
    } else {
      const data = await res.json();
      setError(data.message || 'Something went wrong.');
    }
  };

  return <AuthForm formType="login" onSubmit={handleSubmit} error={error} isLoading={isLoading} />;
}