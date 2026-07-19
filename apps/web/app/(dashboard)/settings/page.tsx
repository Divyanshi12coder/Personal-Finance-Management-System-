'use client';

import { useAuthStore } from '@/stores/auth-store';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-ink-400">Manage your profile and preferences.</p>
      </div>

      <Card className="max-w-lg">
        <CardContent className="space-y-4 p-5">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" defaultValue={user?.name} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" defaultValue={user?.email} disabled />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="currency">Currency</Label>
            <Input id="currency" defaultValue={user?.currency} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
