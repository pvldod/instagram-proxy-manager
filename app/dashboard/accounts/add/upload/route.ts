import { NextRequest, NextResponse } from "next/server";
import { addAccounts } from "@/lib/accounts";
import { revalidatePath } from "next/cache";

// Function to parse CSV content
function parseCSV(content: string) {
  // Detect line endings - handle both Windows (CRLF) and Unix (LF)
  const lineEnding = content.includes('\r\n') ? '\r\n' : '\n';
  
  // Split content into lines and filter out empty lines
  const lines = content.split(lineEnding).filter(line => line.trim() !== '');
  
  // Detect CSV delimiter (comma, semicolon, or tab)
  let delimiter = ',';
  const firstLine = lines[0] || '';
  if (firstLine.includes(';')) {
    delimiter = ';';
  } else if (firstLine.includes('\t')) {
    delimiter = '\t';
  }
  
  // Extract header row and convert to lowercase for case-insensitive matching
  const headerRow = lines[0].split(delimiter).map(header => header.trim().toLowerCase());
  
  // Find column indices - try various common column names
  const usernameIndex = findColumnIndex(headerRow, ['username', 'user', 'login', 'email', 'account']);
  const passwordIndex = findColumnIndex(headerRow, ['password', 'pass', 'pwd']);
  const proxyIndex = findColumnIndex(headerRow, ['proxy', 'proxy_address', 'proxyaddress', 'proxyserver', 'proxy_server']);
  
  // Validate that required columns exist
  if (usernameIndex === -1 || passwordIndex === -1 || proxyIndex === -1) {
    throw new Error('CSV file must contain columns for username, password, and proxy. Could not find all required columns.');
  }
  
  // Parse data rows, skipping the header
  const accounts = [];
  for (let i = 1; i < lines.length; i++) {
    // Skip empty lines
    if (!lines[i].trim()) continue;
    
    // Parse row - handle quoted values correctly
    const row = parseCSVRow(lines[i], delimiter);
    
    // Skip row if it doesn't have enough columns
    if (row.length <= Math.max(usernameIndex, passwordIndex, proxyIndex)) {
      continue;
    }
    
    const username = row[usernameIndex]?.trim();
    const password = row[passwordIndex]?.trim();
    const proxyAddress = row[proxyIndex]?.trim();
    
    // Skip rows with missing required data
    if (!username || !password || !proxyAddress) {
      continue;
    }
    
    accounts.push({
      username,
      password,
      proxyAddress
    });
  }
  
  return accounts;
}

// Helper function to find a column index by trying various possible names
function findColumnIndex(headers: string[], possibleNames: string[]): number {
  for (const name of possibleNames) {
    const index = headers.indexOf(name);
    if (index !== -1) return index;
  }
  return -1;
}

// Helper function to parse a CSV row handling quoted values
function parseCSVRow(row: string, delimiter: string): string[] {
  // If no quotes in the row, simply split by delimiter
  if (!row.includes('"')) {
    return row.split(delimiter);
  }
  
  // Handle quoted fields that might contain delimiters
  const result: string[] = [];
  let currentField = '';
  let inQuotes = false;
  
  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    
    if (char === '"') {
      // Toggle quote state
      inQuotes = !inQuotes;
    } else if (char === delimiter && !inQuotes) {
      // End of field
      result.push(currentField);
      currentField = '';
    } else {
      // Add character to current field
      currentField += char;
    }
  }
  
  // Add the last field
  result.push(currentField);
  
  return result;
}

export async function POST(request: NextRequest) {
  try {
    // Handle multipart form data
    const formData = await request.formData();
    const file = formData.get('csvFile') as File;
    
    // Validate file
    if (!file) {
      return NextResponse.redirect(new URL('/dashboard/accounts/add?error=no-file&tab=csv', request.url));
    }
    
    // Check file type
    if (!file.name.endsWith('.csv')) {
      return NextResponse.redirect(new URL('/dashboard/accounts/add?error=invalid-file-type&tab=csv', request.url));
    }
    
    // Read file content
    const fileContent = await file.text();
    
    // Parse CSV content
    const accounts = parseCSV(fileContent);
    
    // Validate parsed accounts
    if (accounts.length === 0) {
      return NextResponse.redirect(new URL('/dashboard/accounts/add?error=no-valid-accounts&tab=csv', request.url));
    }
    
    // Add accounts to database
    const addedCount = await addAccounts(accounts);
    
    // Revalidate accounts list and redirect to accounts page
    revalidatePath('/dashboard/accounts');
    return NextResponse.redirect(new URL(`/dashboard/accounts?added=${addedCount}`, request.url));
    
  } catch (error) {
    console.error('Error processing CSV file:', error);
    
    // Extract error message and encode for URL
    const errorMessage = error instanceof Error ? error.message : 'File processing error';
    const encodedError = encodeURIComponent(errorMessage);
    
    return NextResponse.redirect(new URL(`/dashboard/accounts/add?error=${encodedError}&tab=csv`, request.url));
  }
} 