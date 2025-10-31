import { NextRequest, NextResponse } from 'next/server';
import { fetchGoogleSheetData } from '@/lib/api/google-sheets';
import {
  fuzzySearchClients,
  categorizeSearchResults,
} from '@/lib/utils/fuzzy-match';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    if (query.trim().length < 2) {
      return NextResponse.json(
        { error: 'Query must be at least 2 characters' },
        { status: 400 }
      );
    }

    // Fetch all client data from Google Sheets
    console.log('[Search API] Fetching Google Sheets data...');
    const sheetData = await fetchGoogleSheetData();
    console.log('[Search API] Got sheet data, rows:', sheetData.length);

    if (sheetData.length === 0) {
      console.error('[Search API] No client data available from Google Sheets');
      return NextResponse.json(
        { error: 'No client data available. Please check Google Sheets connection.' },
        { status: 500 }
      );
    }

    // Perform fuzzy search
    const matches = fuzzySearchClients(query, sheetData);

    // Categorize results
    const result = categorizeSearchResults(matches);

    // Return appropriate response based on match type
    switch (result.type) {
      case 'single':
        return NextResponse.json({
          match: 'single',
          result: {
            ...result.bestMatch!,
            confidence_score: result.matches[0].score,
          },
        });

      case 'multiple':
        return NextResponse.json({
          match: 'multiple',
          results: result.matches.map(m => ({
            ...m.item,
            confidence_score: m.score,
          })),
        });

      case 'none':
        return NextResponse.json({
          match: 'none',
          message: `No clients found matching '${query}'. Try a different spelling.`,
        });

      default:
        return NextResponse.json(
          { error: 'Unexpected error' },
          { status: 500 }
        );
    }
  } catch (error) {
    console.error('Search client error:', error);
    return NextResponse.json(
      {
        error: 'Failed to search clients',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
