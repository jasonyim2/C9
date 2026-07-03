import { NextResponse } from 'next/server';
import { getSheetsClient } from '@/lib/google-sheets';

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;
const RANGE = 'News!A2:J'; // Assuming headers are in row 1

// Helper to convert row data to News object
function rowToNews(row: any[]): any {
  return {
    id: row[0] || '', // news_id
    created_at: row[1] || '',
    news_date: row[2] || '',
    title: row[3] || '',
    source: row[4] || '',
    url: row[5] || '',
    summary_3line: row[6] ? JSON.parse(row[6]) : [],
    impact_1line: row[7] || null,
    category: row[8] || 'ETF',
    is_favorite: row[9] === 'TRUE',
  };
}

// Helper to convert News object to row data
function newsToRow(news: any): any[] {
  return [
    news.id,
    news.created_at,
    news.news_date,
    news.title,
    news.source,
    news.url,
    JSON.stringify(news.summary_3line || []),
    news.impact_1line || '',
    news.category,
    news.is_favorite ? 'TRUE' : 'FALSE',
  ];
}

export async function GET() {
  try {
    const sheets = getSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
    });

    const rows = response.data.values || [];
    const news = rows.map(rowToNews);

    return NextResponse.json({ success: true, data: news });
  } catch (error: any) {
    console.error('[Google Sheets API Error] Failed to fetch from Google Sheets:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newItems: any[] = Array.isArray(body) ? body : [body];

    const sheets = getSheetsClient();

    // Fetch existing to handle upsert
    const existingData = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
    });

    const rows = existingData.data.values || [];
    const updates: { range: string; values: any[][] }[] = [];
    const appends: any[][] = [];

    for (const item of newItems) {
      // Upsert based on URL
      const existingIndex = rows.findIndex((row) => row[5] === item.url);
      if (existingIndex >= 0) {
        // Keep existing ID, created_at, is_favorite if not provided
        const existingRow = rows[existingIndex];
        const mergedItem = {
          ...item,
          id: existingRow[0] || item.id,
          created_at: existingRow[1] || item.created_at,
          is_favorite: existingRow[9] === 'TRUE',
        };
        const rowNumber = existingIndex + 2; // +2 because array is 0-indexed and A1 is header
        updates.push({
          range: `News!A${rowNumber}:J${rowNumber}`,
          values: [newsToRow(mergedItem)],
        });
        // Update local copy to prevent duplicate appends in the same batch
        rows[existingIndex] = newsToRow(mergedItem);
      } else {
        appends.push(newsToRow(item));
        // Add to local copy so subsequent items in the same batch can check against it
        rows.push(newsToRow(item));
      }
    }

    // Execute updates
    for (const update of updates) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: update.range,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: update.values },
      });
    }

    // Execute appends
    if (appends.length > 0) {
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: RANGE,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        requestBody: { values: appends },
      });
    }

    return NextResponse.json({ success: true, message: 'Data saved successfully' });
  } catch (error: any) {
    console.error('[Google Sheets API Error] Failed to save to Google Sheets:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, is_favorite } = await request.json();

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });
    }

    const sheets = getSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'News!A2:A',
    });

    const rows = response.data.values || [];
    const rowIndex = rows.findIndex((row) => row[0] === id);

    if (rowIndex === -1) {
      return NextResponse.json({ success: false, error: 'News item not found' }, { status: 404 });
    }

    const rowNumber = rowIndex + 2;
    // Update only the is_favorite column (J)
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `News!J${rowNumber}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[is_favorite ? 'TRUE' : 'FALSE']],
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Google Sheets API Error] Failed to update Google Sheets:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
