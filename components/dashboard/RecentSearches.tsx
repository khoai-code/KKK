'use client';

import { useSearchHistory } from '@/hooks/useSearchHistory';
import { Clock, TrendingUp, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface RecentSearchesProps {
  onSelectSearch: (folderName: string) => void;
}

export function RecentSearches({ onSelectSearch }: RecentSearchesProps) {
  const { searches, loading, removeSearch } = useSearchHistory();
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleRemove = async (e: React.MouseEvent, searchId: string) => {
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

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-[hsl(var(--color-muted-foreground))]" />
      </div>
    );
  }

  // Don't render if no searches
  if (!searches || searches.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-[hsl(var(--color-muted-foreground))]">
        <Clock className="h-4 w-4" />
        <span className="font-medium">Recent Searches</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {searches.map((search) => (
          <div key={search.id} className="relative group">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSelectSearch(search.client_name)}
              className="group hover:border-[hsl(var(--color-primary))] hover:bg-[hsl(var(--color-primary)_/_0.1)] transition-all duration-200 pr-8"
            >
              <TrendingUp className="h-3 w-3 mr-1.5 opacity-60 group-hover:opacity-100 transition-opacity" />
              {search.client_name}
            </Button>
            <button
              onClick={(e) => handleRemove(e, search.id)}
              disabled={removingId === search.id}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full hover:bg-[hsl(var(--color-destructive))]/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {removingId === search.id ? (
                <Loader2 className="h-3 w-3 animate-spin text-[hsl(var(--color-muted-foreground))]" />
              ) : (
                <X className="h-3 w-3 text-[hsl(var(--color-muted-foreground))] hover:text-[hsl(var(--color-destructive))]" />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
