import { NextRequest, NextResponse } from 'next/server';
import { getClientContextData } from '@/lib/api/clickhouse';

/**
 * API endpoint to fetch all client context data from ClickHouse
 * GET /api/client-context?folderName=ClientName
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const folderName = searchParams.get('folderName');
    const timeRange = (searchParams.get('timeRange') as 'current_year' | 'two_years' | 'all_time') || 'current_year';

    if (!folderName) {
      return NextResponse.json(
        { error: 'folderName parameter is required' },
        { status: 400 }
      );
    }

    console.log('[Client Context API] Fetching data for:', folderName, 'with time range:', timeRange);

    // Fetch all client data from ClickHouse with time range filter
    const data = await getClientContextData(folderName, timeRange);

    return NextResponse.json({
      success: true,
      data,
      timeRange,
      cached_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Client context API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch client context',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
