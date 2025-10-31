'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchHistory } from '@/hooks/useSearchHistory';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { History, X, Trash2, Clock, ExternalLink, Loader2 } from 'lucide-react';

export function RecentSearches() {
  const { searches, loading, error, removeSearch, clearAll } = useSearchHistory();
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);

  const handleRemove = async (e: React.MouseEvent, searchId: string) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      setRemovingId(searchId);
      await removeSearch(searchId);
    } catch (err) {
      console.error('Failed to remove search:', err);
    } finally {
      setRemovingId(null);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to clear all search history?')) {
      return;
    }

    try {
      setClearing(true);
      await clearAll();
    } catch (err) {
      console.error('Failed to clear history:', err);
      alert('Failed to clear search history. Please try again.');
    } finally {
      setClearing(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-[hsl(var(--color-primary))]" />
            Recent Searches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--color-muted-foreground))]" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-[hsl(var(--color-primary))]" />
            Recent Searches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[hsl(var(--color-muted-foreground))]">
            Failed to load search history
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!searches || searches.length === 0) {
    return (
      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-[hsl(var(--color-primary))]" />
            Recent Searches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[hsl(var(--color-muted-foreground))]">
            No recent searches. Start by searching for a client above.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg rounded-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-[hsl(var(--color-primary))]" />
            Recent Searches
          </CardTitle>
          {searches.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              disabled={clearing}
              className="text-xs text-[hsl(var(--color-muted-foreground))] hover:text-[hsl(var(--color-destructive))]"
            >
              {clearing ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Clearing...
                </>
              ) : (
                <>
                  <Trash2 className="h-3 w-3 mr-1" />
                  Clear All
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {searches.map((search) => (
            <Link
              key={search.id}
              href={`/dashboard/client/${search.client_folder_id}?name=${encodeURIComponent(search.client_name)}`}
              className="block"
            >
              <div className="flex items-center justify-between p-4 rounded-xl border-2 border-[hsl(var(--color-border))] bg-[hsl(var(--color-accent))] hover:border-[hsl(var(--color-primary))] hover:bg-[hsl(var(--color-muted))] hover:shadow-md transition-all duration-200 group">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-base text-[hsl(var(--color-card-foreground))] truncate">
                      {search.client_name}
                    </h4>
                    <ExternalLink className="h-4 w-4 text-[hsl(var(--color-muted-foreground))] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="h-3 w-3 text-[hsl(var(--color-muted-foreground))]" />
                    <p className="text-xs text-[hsl(var(--color-muted-foreground))]">
                      {formatDate(search.searched_at)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleRemove(e, search.id)}
                  disabled={removingId === search.id}
                  className="ml-2 h-8 w-8 p-0 hover:bg-[hsl(var(--color-destructive))]/10 hover:text-[hsl(var(--color-destructive))]"
                >
                  {removingId === search.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
