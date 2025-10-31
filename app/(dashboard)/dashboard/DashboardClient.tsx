'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { SearchBar } from '@/components/search/SearchBar';
import { ClientMatchSelector } from '@/components/search/ClientMatchSelector';
import { RecentSearches } from '@/components/dashboard/RecentSearches';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GoogleSheetRow } from '@/lib/types/api.types';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { AIInteractionCard } from '@/components/dashboard/AIInteractionCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { LogOut } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';

interface ClientMatch extends GoogleSheetRow {
  confidence_score: number;
}

interface SearchResult {
  match: 'single' | 'multiple' | 'none';
  result?: ClientMatch;
  results?: ClientMatch[];
  message?: string;
}

interface DashboardClientProps {
  user: User | null;
}

export function DashboardClient({ user }: DashboardClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [selectedClient, setSelectedClient] = useState<ClientMatch | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3); // Mock notification count
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = useCallback(async (query: string) => {
    setIsLoading(true);
    setError(null);
    setSearchResult(null);
    setSelectedClient(null);

    try {
      const response = await fetch('/api/search-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Search failed');
        return;
      }

      setSearchResult(data);

      // If single match, show the AI interaction card
      if (data.match === 'single' && data.result) {
        setSelectedClient(data.result);
      }
    } catch (err) {
      setError('An error occurred while searching');
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSelectClient = useCallback(async (client: GoogleSheetRow) => {
    const clientMatch = client as ClientMatch;
    setSelectedClient(clientMatch);
    setSearchResult(null);

    // Save to search history database
    try {
      await fetch('/api/search-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientFolderId: clientMatch.folder_id,
          clientName: clientMatch.folder_name,
        }),
      });
    } catch (err) {
      console.error('Failed to save search history:', err);
      // Non-critical, don't show error to user
    }
  }, []);

  const handleRecentSearchClick = useCallback((folderName: string) => {
    setSearchQuery(folderName);
    handleSearch(folderName);
  }, [handleSearch]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const handleProceed = () => {
    if (selectedClient) {
      router.push(`/dashboard/client/${selectedClient.folder_id}?name=${encodeURIComponent(selectedClient.folder_name)}`);
    }
  };

  const handleRetry = () => {
    setSelectedClient(null);
    setSearchResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--color-background))] to-[hsl(var(--color-muted)_/_0.2)]">
      {/* Sidebar - Hidden on mobile */}
      <div className="hidden lg:block">
        <Sidebar onSignOut={handleSignOut} onCollapseChange={setSidebarCollapsed} />
      </div>

      {/* Top Bar - Adjusted for mobile */}
      <div className="hidden lg:block">
        <TopBar user={user} sidebarCollapsed={sidebarCollapsed} />
      </div>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-30 flex h-14 items-center justify-between border-b bg-[hsl(var(--color-card))]/95 backdrop-blur-sm px-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Logo size="sm" className="rounded-lg" />
          <h1 className="text-base font-bold">Digitization Finder</h1>
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

      {/* Main Content - Responsive padding */}
      <main className="lg:ml-64 lg:mt-16 mt-14 p-4 lg:p-8 min-h-screen transition-all duration-300">
        <div className="max-w-5xl mx-auto space-y-6 lg:space-y-8">
          {/* Search Section */}
          <Card className="p-4 lg:p-8 shadow-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))]">
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-[hsl(var(--color-foreground))]">Locate Client Data in Seconds</h2>
                <p className="text-[hsl(var(--color-muted-foreground))] font-medium">
                  Enter a client name to find their implemented projects and recent activities.
                </p>
              </div>

              <SearchBar onSearch={handleSearch} isLoading={isLoading} initialQuery={searchQuery} />

              {/* Recent Searches */}
              {!isLoading && !searchResult && !selectedClient && (
                <RecentSearches onSelectSearch={handleRecentSearchClick} />
              )}

              {/* Error Message */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* No Results Message */}
              {searchResult?.match === 'none' && (
                <Alert>
                  <AlertDescription>
                    {searchResult.message || 'No clients found'}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </Card>

          {/* Multiple Matches */}
          {searchResult?.match === 'multiple' && searchResult.results && (
            <ClientMatchSelector
              matches={searchResult.results}
              onSelect={handleSelectClient}
            />
          )}

          {/* AI Interaction Card - shown when client is selected */}
          {selectedClient && (
            <div className="flex justify-center">
              <AIInteractionCard
                clientName={selectedClient.folder_name}
                folderId={selectedClient.folder_id}
                onProceed={handleProceed}
                onRetry={handleRetry}
              />
            </div>
          )}

          {/* Getting Started Tips */}
          {!searchResult && !isLoading && !selectedClient && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <Card className="p-6 text-center space-y-4 shadow-md hover:shadow-xl transition-all duration-300 border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] hover:scale-105">
                <div className="w-14 h-14 bg-gradient-to-br from-[hsl(var(--color-primary)_/_0.3)] to-[hsl(var(--color-secondary)_/_0.3)] rounded-2xl flex items-center justify-center mx-auto">
                  <span className="text-3xl">🔍</span>
                </div>
                <h3 className="font-semibold text-lg text-[hsl(var(--color-foreground))]">Smart Search</h3>
                <p className="text-sm text-[hsl(var(--color-muted-foreground))] font-medium">
                  Fuzzy matching finds clients even with typos
                </p>
              </Card>
              <Card className="p-6 text-center space-y-4 shadow-md hover:shadow-xl transition-all duration-300 border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] hover:scale-105">
                <div className="w-14 h-14 bg-gradient-to-br from-[hsl(var(--color-primary)_/_0.3)] to-[hsl(var(--color-secondary)_/_0.3)] rounded-2xl flex items-center justify-center mx-auto">
                  <span className="text-3xl">⚡</span>
                </div>
                <h3 className="font-semibold text-lg text-[hsl(var(--color-foreground))]">Instant Results</h3>
                <p className="text-sm text-[hsl(var(--color-muted-foreground))] font-medium">
                  Get client context in under 30 seconds
                </p>
              </Card>
              <Card className="p-6 text-center space-y-4 shadow-md hover:shadow-xl transition-all duration-300 border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] hover:scale-105">
                <div className="w-14 h-14 bg-gradient-to-br from-[hsl(var(--color-primary)_/_0.3)] to-[hsl(var(--color-secondary)_/_0.3)] rounded-2xl flex items-center justify-center mx-auto">
                  <span className="text-3xl">🤖</span>
                </div>
                <h3 className="font-semibold text-lg text-[hsl(var(--color-foreground))]">AI Insights</h3>
                <p className="text-sm text-[hsl(var(--color-muted-foreground))] font-medium">
                  AI-powered summaries and recommendations
                </p>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
