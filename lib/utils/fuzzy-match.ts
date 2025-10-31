import Fuse from 'fuse.js';
import { GoogleSheetRow, FuzzyMatchResult } from '@/lib/types/api.types';

// Tokens to ignore during fuzzy matching (common words that don't help identify clients)
const IGNORE_TOKENS = [
  'capital',
  'fund',
  'group',
  'venture',
  'partners',
  'holdings',
  'management',
  'investments',
  'llc',
  'inc',
  'ltd',
  'limited',
  'corporation',
  'corp',
];

/**
 * Clean search query by removing ignore tokens and extra whitespace
 */
function cleanQuery(query: string): string {
  let cleaned = query.toLowerCase().trim();

  // Remove ignore tokens
  IGNORE_TOKENS.forEach(token => {
    const regex = new RegExp(`\\b${token}\\b`, 'gi');
    cleaned = cleaned.replace(regex, '');
  });

  // Remove extra whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  return cleaned;
}

/**
 * Perform fuzzy search on Google Sheet data
 * @param query - The search term (client name)
 * @param data - Array of GoogleSheetRow from Google Sheets
 * @returns Array of fuzzy match results sorted by relevance
 */
export function fuzzySearchClients(
  query: string,
  data: GoogleSheetRow[]
): FuzzyMatchResult[] {
  // Clean the query
  const cleanedQuery = cleanQuery(query);

  if (!cleanedQuery || cleanedQuery.length < 2) {
    return [];
  }

  // Configure Fuse.js for fuzzy matching
  const fuse = new Fuse(data, {
    keys: ['folder_name'], // Search only in folder_name field
    threshold: 0.3, // 0.0 = exact match, 1.0 = match anything (0.3 = ~70% match required)
    distance: 100, // Maximum distance between matched characters
    ignoreLocation: true, // Don't favor matches at the beginning
    minMatchCharLength: 2, // Minimum matched characters
    shouldSort: true, // Sort by score
  });

  // Perform search
  const results = fuse.search(cleanedQuery);

  // Map to FuzzyMatchResult with confidence scores
  const matches: FuzzyMatchResult[] = results.map(result => ({
    item: result.item,
    score: 1 - (result.score || 0), // Convert Fuse score (0=best) to confidence (1=best)
  }));

  // Filter to only include matches with 60%+ confidence
  return matches.filter(match => match.score >= 0.6);
}

/**
 * Categorize search results into single, multiple, or no match
 */
export type SearchResultType = 'single' | 'multiple' | 'none';

export interface CategorizedSearchResult {
  type: SearchResultType;
  matches: FuzzyMatchResult[];
  bestMatch?: GoogleSheetRow;
}

export function categorizeSearchResults(
  matches: FuzzyMatchResult[]
): CategorizedSearchResult {
  if (matches.length === 0) {
    return { type: 'none', matches: [] };
  }

  // Single match if only one result OR if top result has 90%+ confidence
  if (matches.length === 1 || matches[0].score >= 0.9) {
    return {
      type: 'single',
      matches: [matches[0]],
      bestMatch: matches[0].item,
    };
  }

  // Return top 5 matches if multiple found
  return {
    type: 'multiple',
    matches: matches.slice(0, 5),
  };
}
