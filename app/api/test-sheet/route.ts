import { NextResponse } from 'next/server';

/**
 * Test endpoint to verify Google Sheets API connection
 * Visit: http://localhost:3002/api/test-sheet
 */
export async function GET() {
  const SHEET_ID = process.env.GOOGLE_SHEET_ID;
  const API_KEY = process.env.GOOGLE_SHEETS_API_KEY;

  if (!SHEET_ID || !API_KEY) {
    return NextResponse.json({
      error: 'Google Sheets configuration missing',
      hasSheetId: !!SHEET_ID,
      hasApiKey: !!API_KEY,
    }, { status: 500 });
  }

  try {
    // Test with Sheet1 first
    const ranges = ['Sheet1!A:D', 'Data!A:D', 'A:D'];
    const results: any = {};

    for (const range of ranges) {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}?key=${API_KEY}`;

      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          cache: 'no-store',
        });

        if (response.ok) {
          const data = await response.json();
          results[range] = {
            success: true,
            rowCount: data.values?.length || 0,
            firstRow: data.values?.[0] || [],
            sampleData: data.values?.slice(0, 3) || [],
          };
        } else {
          const errorData = await response.json();
          results[range] = {
            success: false,
            status: response.status,
            error: errorData,
          };
        }
      } catch (err) {
        results[range] = {
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error',
        };
      }
    }

    return NextResponse.json({
      sheetId: SHEET_ID,
      apiKeyPresent: !!API_KEY,
      results,
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
