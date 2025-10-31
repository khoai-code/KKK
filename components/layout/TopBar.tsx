'use client';

import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { ThemeSwitcher } from '@/components/theme/ThemeSwitcherEnhanced';
import { NotificationPopover } from '@/components/notifications/NotificationPopover';

interface TopBarProps {
  user: User | null;
  sidebarCollapsed?: boolean;
}

// Avatar options (sync with SettingsClient)
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

export function TopBar({ user, sidebarCollapsed = false }: TopBarProps) {
  const [userAvatar, setUserAvatar] = useState('avatar-1');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedAvatar = localStorage.getItem('user_avatar');
    if (savedAvatar) {
      setUserAvatar(savedAvatar);
    }
  }, []);

  const selectedAvatarData = avatarOptions.find(a => a.id === userAvatar) || avatarOptions[0];

  return (
    <header
      className="fixed top-0 right-0 z-30 flex h-16 items-center justify-between border-b bg-[hsl(var(--color-muted))]/95 backdrop-blur-md px-6 shadow-sm transition-all duration-300"
      style={{
        left: sidebarCollapsed ? '4rem' : '16rem',
      }}
    >
      {/* Left: Tagline */}
      <div className="flex items-center gap-3">
        <p className="text-sm text-[hsl(var(--color-muted-foreground))] font-medium">
          Type. Find. Analyze.
        </p>
      </div>

      {/* Right: Notifications + Theme + User */}
      <div className="flex items-center gap-3">
        <NotificationPopover />
        <ThemeSwitcher />

        <div className="flex items-center gap-3 pl-3 border-l border-[hsl(var(--color-border))]">
          <div className="text-right">
            <p className="text-sm font-medium leading-none">
              {user?.user_metadata?.full_name || 'User'}
            </p>
            <p className="text-xs text-[hsl(var(--color-muted-foreground))] truncate max-w-[150px]">
              {user?.email}
            </p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[hsl(var(--color-primary))] to-[hsl(var(--color-secondary))] text-white font-semibold text-sm shadow-md">
            {mounted ? selectedAvatarData.emoji : (user?.email?.charAt(0).toUpperCase() || 'U')}
          </div>
        </div>
      </div>
    </header>
  );
}
