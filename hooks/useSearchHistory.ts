import { useState, useEffect, useCallback } from 'react';

export interface SearchHistoryItem {
  id: string;
  user_id: string;
  client_folder_id: string;
  client_name: string;
  searched_at: string;
}

export function useSearchHistory() {
  const [searches, setSearches] = useState<SearchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch search history
  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/search-history');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch search history');
      }

      const data = await response.json();
      setSearches(data.searches || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching search history:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Add a search to history
  const addSearch = useCallback(async (clientFolderId: string, clientName: string) => {
    try {
      const response = await fetch('/api/search-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientFolderId, clientName }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add search to history');
      }

      // Refresh history after adding
      await fetchHistory();
    } catch (err) {
      console.error('Error adding search to history:', err);
      // Don't throw - search history is non-critical
    }
  }, [fetchHistory]);

  // Remove a specific search
  const removeSearch = useCallback(async (searchId: string) => {
    try {
      const response = await fetch(`/api/search-history?id=${searchId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove search');
      }

      // Refresh history after removing
      await fetchHistory();
    } catch (err) {
      console.error('Error removing search:', err);
      throw err;
    }
  }, [fetchHistory]);

  // Clear all search history
  const clearAll = useCallback(async () => {
    try {
      const response = await fetch('/api/search-history?clearAll=true', {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to clear history');
      }

      // Refresh history after clearing
      await fetchHistory();
    } catch (err) {
      console.error('Error clearing history:', err);
      throw err;
    }
  }, [fetchHistory]);

  // Fetch history on mount
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    searches,
    loading,
    error,
    addSearch,
    removeSearch,
    clearAll,
    refresh: fetchHistory,
  };
}
