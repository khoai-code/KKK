'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LogoSwitcher } from '@/components/brand/LogoSwitcher';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SidebarProps {
  onSignOut: () => void;
  onCollapseChange?: (collapsed: boolean) => void;
}

export function Sidebar({ onSignOut, onCollapseChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  // Load collapsed state from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('sidebar-collapsed');
    if (stored !== null) {
      const collapsed = stored === 'true';
      setIsCollapsed(collapsed);
      onCollapseChange?.(collapsed);
    }
  }, [onCollapseChange]);

  // Toggle and persist collapsed state
  const toggleCollapsed = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', String(newState));
    onCollapseChange?.(newState);
  };

  const navItems = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
    },
    {
      label: 'Glossary',
      icon: BookOpen,
      href: '/dashboard/glossary',
    },
    {
      label: 'Reports',
      icon: FileText,
      href: '/dashboard/reports',
    },
    {
      label: 'Settings',
      icon: Settings,
      href: '/dashboard/settings',
    },
  ];

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r bg-[hsl(var(--color-muted))] transition-all duration-300',
        'shadow-lg',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo/Brand */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          {!isCollapsed && (
            <Link href="/dashboard" className="flex items-center space-x-3">
              <LogoSwitcher size={36} className="h-9 w-9" />
              <span className="text-lg bg-gradient-to-r from-[hsl(var(--color-primary))] to-[hsl(var(--color-secondary))] bg-clip-text text-transparent">
                Digi <span className="font-bold">Finder</span>
              </span>
            </Link>
          )}
          {isCollapsed && (
            <div className="mx-auto">
              <LogoSwitcher size={36} className="h-9 w-9" />
            </div>
          )}
        </div>

        {/* Collapse Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'absolute -right-3 top-20 h-6 w-6 rounded-full border bg-[hsl(var(--color-card))] shadow-md hover:bg-[hsl(var(--color-muted))] z-50',
            'transition-transform duration-300'
          )}
          onClick={toggleCollapsed}
        >
          <ChevronLeft
            className={cn(
              'h-4 w-4 transition-transform duration-300',
              isCollapsed && 'rotate-180'
            )}
          />
        </Button>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3">
          <TooltipProvider delayDuration={0}>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const navContent = (
                <div
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    'hover:bg-[hsl(var(--color-accent))] hover:text-[hsl(var(--color-foreground))] hover:translate-x-1 hover:shadow-sm',
                    isActive && 'bg-[hsl(var(--color-accent))] text-[hsl(var(--color-foreground))] border-l-4 border-[hsl(var(--color-secondary))] pl-2 shadow-md font-semibold',
                    !isActive && 'text-[hsl(var(--color-muted-foreground))]',
                    isCollapsed && 'justify-center px-0 border-l-0'
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!isCollapsed && <span>{item.label}</span>}
                </div>
              );

              if (isCollapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                      <Link href={item.href}>{navContent}</Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="font-medium">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return (
                <Link key={item.href} href={item.href}>
                  {navContent}
                </Link>
              );
            })}
          </TooltipProvider>
        </nav>

        {/* Sign Out */}
        <div className="border-t p-3">
          <TooltipProvider delayDuration={0}>
            {isCollapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-center px-0 text-[hsl(var(--color-muted-foreground))] hover:text-[hsl(var(--color-destructive))] hover:bg-[hsl(var(--color-destructive)_/_0.1)] transition-all duration-200"
                    onClick={onSignOut}
                  >
                    <LogOut className="h-5 w-5 shrink-0" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                  Sign Out
                </TooltipContent>
              </Tooltip>
            ) : (
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-[hsl(var(--color-muted-foreground))] hover:text-[hsl(var(--color-destructive))] hover:bg-[hsl(var(--color-destructive)_/_0.1)] transition-all duration-200"
                onClick={onSignOut}
              >
                <LogOut className="h-5 w-5 shrink-0" />
                <span>Sign Out</span>
              </Button>
            )}
          </TooltipProvider>
        </div>
      </div>
    </aside>
  );
}
