'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Settings as SettingsIcon,
  User,
  Palette,
  Bell,
  Shield,
  LogOut,
  Check,
  Loader2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { Logo } from '@/components/brand/Logo';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { useTheme } from '@/lib/context/ThemeContext';

interface SettingsClientProps {
  user: SupabaseUser;
}

// Avatar options
const avatarOptions = [
  { id: 'avatar-1', emoji: '👤', name: 'Default' },
  { id: 'avatar-2', emoji: '🧑‍💼', name: 'Professional' },
  { id: 'avatar-3', emoji: '👨‍💻', name: 'Developer' },
  { id: 'avatar-4', emoji: '👩‍💻', name: 'Developer Alt' },
  { id: 'avatar-5', emoji: '🦸', name: 'Superhero' },
  { id: 'avatar-6', emoji: '🧙', name: 'Wizard' },
  { id: 'avatar-7', emoji: '🤖', name: 'Robot' },
  { id: 'avatar-8', emoji: '👾', name: 'Alien' },
  { id: 'avatar-9', emoji: '🐱', name: 'Cat' },
  { id: 'avatar-10', emoji: '🐶', name: 'Dog' },
  { id: 'avatar-11', emoji: '🦊', name: 'Fox' },
  { id: 'avatar-12', emoji: '🐼', name: 'Panda' },
];

export function SettingsClient({ user }: SettingsClientProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState('avatar-1');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load saved avatar from localStorage
  useEffect(() => {
    const savedAvatar = localStorage.getItem('user_avatar');
    if (savedAvatar) {
      setSelectedAvatar(savedAvatar);
    }
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      setError(null);

      // Save avatar to localStorage
      localStorage.setItem('user_avatar', selectedAvatar);

      // Show success message
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const selectedAvatarData = avatarOptions.find(a => a.id === selectedAvatar) || avatarOptions[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--color-background))] to-[hsl(var(--color-muted)_/_0.2)]">
      {/* Sidebar - Hidden on mobile */}
      <div className="hidden lg:block">
        <Sidebar onSignOut={handleSignOut} onCollapseChange={setSidebarCollapsed} />
      </div>

      {/* Top Bar - Hidden on mobile */}
      <div className="hidden lg:block">
        <TopBar user={user} sidebarCollapsed={sidebarCollapsed} />
      </div>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-30 flex h-14 items-center justify-between border-b bg-[hsl(var(--color-card))]/95 backdrop-blur-sm px-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Logo size="sm" className="rounded-lg" />
          <h1 className="text-base font-bold">Settings</h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            className="h-8 w-8"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="lg:ml-64 lg:mt-16 mt-14 p-4 lg:p-8 min-h-screen transition-all duration-300">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Page Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[hsl(var(--color-primary))] to-[hsl(var(--color-accent))] rounded-xl flex items-center justify-center">
                <SettingsIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-[hsl(var(--color-muted-foreground))]">
                  Manage your account preferences and appearance
                </p>
              </div>
            </div>
          </div>

          {/* Success Alert */}
          {saved && (
            <Alert className="bg-green-500/10 border-green-500/50 text-green-700 dark:text-green-400">
              <Check className="h-4 w-4" />
              <AlertDescription>Settings saved successfully!</AlertDescription>
            </Alert>
          )}

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Profile Settings */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile
              </CardTitle>
              <CardDescription>Your account information and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email (Read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user.email || ''}
                  disabled
                  className="bg-[hsl(var(--color-muted)_/_0.3)]"
                />
                <p className="text-xs text-[hsl(var(--color-muted-foreground))]">
                  Email cannot be changed from this screen
                </p>
              </div>

              {/* User ID (Read-only) */}
              <div className="space-y-2">
                <Label htmlFor="user-id">User ID</Label>
                <Input
                  id="user-id"
                  value={user.id}
                  disabled
                  className="bg-[hsl(var(--color-muted)_/_0.3)] font-mono text-sm"
                />
              </div>
            </CardContent>
          </Card>

          {/* Avatar Selection */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Avatar
              </CardTitle>
              <CardDescription>Choose your profile avatar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Avatar Preview */}
              <div className="flex items-center gap-4 p-4 bg-[hsl(var(--color-muted)_/_0.2)] rounded-lg">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[hsl(var(--color-primary))] to-[hsl(var(--color-accent))] flex items-center justify-center text-3xl">
                  {selectedAvatarData.emoji}
                </div>
                <div>
                  <p className="font-semibold">Current Avatar</p>
                  <p className="text-sm text-[hsl(var(--color-muted-foreground))]">
                    {selectedAvatarData.name}
                  </p>
                </div>
              </div>

              {/* Avatar Grid */}
              <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                {avatarOptions.map((avatar) => (
                  <button
                    key={avatar.id}
                    onClick={() => setSelectedAvatar(avatar.id)}
                    className={`
                      relative aspect-square rounded-lg p-3 transition-all
                      ${selectedAvatar === avatar.id
                        ? 'bg-gradient-to-br from-[hsl(var(--color-primary))] to-[hsl(var(--color-accent))] ring-2 ring-[hsl(var(--color-primary))] ring-offset-2 ring-offset-[hsl(var(--color-background))]'
                        : 'bg-[hsl(var(--color-muted)_/_0.2)] hover:bg-[hsl(var(--color-muted)_/_0.4)]'
                      }
                    `}
                    title={avatar.name}
                  >
                    <span className="text-3xl">{avatar.emoji}</span>
                    {selectedAvatar === avatar.id && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Appearance Settings */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance
              </CardTitle>
              <CardDescription>Customize the look and feel of the application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Theme Selector */}
              <div className="space-y-3">
                <Label>Theme</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    onClick={() => setTheme('light')}
                    className={`
                      p-4 rounded-lg border-2 transition-all
                      ${theme === 'light'
                        ? 'border-[hsl(var(--color-primary))] bg-[hsl(var(--color-primary)_/_0.1)]'
                        : 'border-[hsl(var(--color-border))] hover:border-[hsl(var(--color-primary)_/_0.5)]'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Light</span>
                      {theme === 'light' && <Check className="h-4 w-4 text-[hsl(var(--color-primary))]" />}
                    </div>
                    <div className="w-full h-12 bg-white rounded border border-gray-200 flex items-center justify-center text-xs text-gray-500">
                      Preview
                    </div>
                  </button>

                  <button
                    onClick={() => setTheme('dark')}
                    className={`
                      p-4 rounded-lg border-2 transition-all
                      ${theme === 'dark'
                        ? 'border-[hsl(var(--color-primary))] bg-[hsl(var(--color-primary)_/_0.1)]'
                        : 'border-[hsl(var(--color-border))] hover:border-[hsl(var(--color-primary)_/_0.5)]'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Dark</span>
                      {theme === 'dark' && <Check className="h-4 w-4 text-[hsl(var(--color-primary))]" />}
                    </div>
                    <div className="w-full h-12 bg-gray-900 rounded border border-gray-700 flex items-center justify-center text-xs text-gray-400">
                      Preview
                    </div>
                  </button>

                  <button
                    onClick={() => setTheme('asian')}
                    className={`
                      p-4 rounded-lg border-2 transition-all
                      ${theme === 'asian'
                        ? 'border-[hsl(var(--color-primary))] bg-[hsl(var(--color-primary)_/_0.1)]'
                        : 'border-[hsl(var(--color-border))] hover:border-[hsl(var(--color-primary)_/_0.5)]'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Asian</span>
                      {theme === 'asian' && <Check className="h-4 w-4 text-[hsl(var(--color-primary))]" />}
                    </div>
                    <div className="w-full h-12 bg-gradient-to-br from-red-50 to-amber-50 rounded border border-red-200 flex items-center justify-center text-xs text-red-700">
                      Preview
                    </div>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications Settings (Placeholder) */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>Manage your notification preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[hsl(var(--color-muted-foreground))]">
                Notification settings will be available in a future update.
              </p>
            </CardContent>
          </Card>

          {/* Privacy & Security (Placeholder) */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy & Security
              </CardTitle>
              <CardDescription>Manage your privacy and security settings</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[hsl(var(--color-muted-foreground))]">
                Advanced security settings will be available in a future update.
              </p>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard')}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveSettings}
              disabled={saving}
              className="bg-gradient-to-r from-[hsl(var(--color-primary))] to-[hsl(var(--color-accent))]"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
