require('dotenv').config({ path: '.env.local' });
const { google } = require('googleapis');

async function testSheets() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY || '';
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

  if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.slice(1, -1);
  }
  privateKey = privateKey.replace(/\\n/g, '\n');

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: { client_email: clientEmail, private_key: privateKey },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: 'News!A1:J10', 
    });

    console.log('Sheet data:', JSON.stringify(response.data.values, null, 2));

  } catch (error) {
    console.error('Error:', error.message);
  }
}

testSheets();
