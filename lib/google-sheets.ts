import { google } from 'googleapis';

export function getSheetsClient() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  // Handle newlines and possible surrounding quotes from Vercel environment variables
  let privateKey = process.env.GOOGLE_PRIVATE_KEY || '';
  if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.slice(1, -1);
  }
  privateKey = privateKey.replace(/\\n/g, '\n');
  if (!clientEmail) {
    throw new Error('Missing GOOGLE_SERVICE_ACCOUNT_EMAIL in Vercel Environment Variables');
  }
  if (!privateKey) {
    throw new Error('Missing GOOGLE_PRIVATE_KEY in Vercel Environment Variables');
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return google.sheets({ version: 'v4', auth });
}
