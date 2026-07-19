'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { registerSchema, RegisterInput } from '@/lib/validators/auth.schema';
import { apiClient, ApiError } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function RegisterPage() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register: registerField,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (values: RegisterInput) => {
    setServerError(null);
    try {
      const auth = await apiClient.post<{ accessToken: string; user: never }>('/auth/register', values);
      setSession(auth.accessToken, auth.user);
      router.push('/dashboard');
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : 'Unable to create your account. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-50 px-4 dark:bg-ink-950">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brass-500 font-display text-lg font-bold text-ink-950">
            F
          </span>
          <h1 className="font-display text-xl font-semibold">Create your account</h1>
          <p className="text-sm text-ink-400">Start tracking your finances with FinPilot AI.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" autoComplete="name" {...registerField('name')} aria-invalid={!!errors.name} />
            {errors.name && <p className="text-xs text-signal-rose">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" {...registerField('email')} aria-invalid={!!errors.email} />
            {errors.email && <p className="text-xs text-signal-rose">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              {...registerField('password')}
              aria-invalid={!!errors.password}
            />
            {errors.password && <p className="text-xs text-signal-rose">{errors.password.message}</p>}
          </div>

          {serverError && <p className="text-sm text-signal-rose" role="alert">{serverError}</p>}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-400">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-brass-600 hover:underline dark:text-brass-400">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
