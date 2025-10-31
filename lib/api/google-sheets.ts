import { GoogleSheetRow } from '@/lib/types/api.types';

/**
 * Fetches all rows from the Google Sheet containing client folder mappings
 * Sheet ID: 1uW3UWNhcBysrjaNN-gUrV7WqxyQt9eVT9RYWzKGJfg0
 */
export async function fetchGoogleSheetData(): Promise<GoogleSheetRow[]> {
  const SHEET_ID = process.env.GOOGLE_SHEET_ID;
  const API_KEY = process.env.GOOGLE_SHEETS_API_KEY;

  if (!SHEET_ID || !API_KEY) {
    throw new Error('Google Sheets configuration missing');
  }

  // Data is in columns A:D (Space id, Space name, Folder name, Folder id)
  const RANGE = 'A:D';

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      // Disable cache temporarily to debug
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Sheets API error response:', errorText);
      throw new Error(`Google Sheets API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    console.log('[Google Sheets] Fetched rows:', data.values?.length || 0);

    if (!data.values || data.values.length === 0) {
      console.warn('[Google Sheets] No data returned from API');
      return [];
    }

    // Skip header row (index 0) and map to GoogleSheetRow objects
    // Column mapping: A=Space id, B=Space name, C=Folder name, D=Folder id
    const rows: GoogleSheetRow[] = data.values.slice(1).map((row: string[]) => ({
      space_id: row[0] || '',
      space_name: row[1] || '',
      folder_name: row[2] || '', // This is the column we search against
      folder_id: row[3] || '',
    }));

    // Filter out empty rows
    return rows.filter(row => row.folder_id && row.folder_name);
  } catch (error) {
    console.error('Error fetching Google Sheet data:', error);
    throw error;
  }
}

/**
 * Get a single client by folder_id (for direct lookups)
 */
export async function getClientByFolderId(folderId: string): Promise<GoogleSheetRow | null> {
  const allData = await fetchGoogleSheetData();
  return allData.find(row => row.folder_id === folderId) || null;
}
