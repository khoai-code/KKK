/**
 * Utility functions for managing recent client searches in localStorage
 */

const RECENT_SEARCHES_KEY = 'digitization_finder_recent_searches';
const MAX_RECENT_SEARCHES = 3;

export interface RecentSearch {
  folderName: string;
  folderId: string;
  timestamp: number;
}

/**
 * Get recent searches from localStorage
 */
export function getRecentSearches(): RecentSearch[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (!stored) return [];

    const searches: RecentSearch[] = JSON.parse(stored);
    // Sort by timestamp descending (newest first)
    return searches.sort((a, b) => b.timestamp - a.timestamp).slice(0, MAX_RECENT_SEARCHES);
  } catch (error) {
    console.error('Error reading recent searches:', error);
    return [];
  }
}

/**
 * Add a search to recent searches
 */
export function addRecentSearch(folderName: string, folderId: string): void {
  if (typeof window === 'undefined') return;

  try {
    const searches = getRecentSearches();

    // Remove duplicate if exists
    const filtered = searches.filter(s => s.folderId !== folderId);

    // Add new search at the beginning
    const updated: RecentSearch[] = [
      {
        folderName,
        folderId,
        timestamp: Date.now(),
      },
      ...filtered,
    ].slice(0, MAX_RECENT_SEARCHES);

    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving recent search:', error);
  }
}

/**
 * Clear all recent searches
 */
export function clearRecentSearches(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch (error) {
    console.error('Error clearing recent searches:', error);
  }
}
