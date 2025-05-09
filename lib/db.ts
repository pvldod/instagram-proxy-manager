import { neon } from "@neondatabase/serverless"

// Check if DATABASE_URL is available and valid
const isDevelopment = process.env.NODE_ENV === 'development';
const dbUrl = process.env.DATABASE_URL || '';

// Initialize the SQL client or use a mock implementation
let sql: any;

try {
  if (dbUrl.trim() === '') {
    console.log("Používám simulovanou databázi v development režimu");
    sql = {
      query: async () => getMockQueryResult()
    };
  } else {
    sql = neon(dbUrl);
  }
} catch (error) {
  console.warn("Database connection setup failed, using mock implementation");
  sql = {
    query: async () => getMockQueryResult()
  };
}

export { sql };

// Helper function to get mock data based on query
function getMockQueryResult() {
  return { rows: [], rowCount: 0 };
}

// Helper function to execute raw SQL queries
export async function executeQuery(query: string, params: any[] = []) {
  try {
    // Pokud jsme v development režimu bez databáze, použijeme mock data
    if (isDevelopment && dbUrl.trim() === '') {
      return getMockDataForQuery(query);
    }
    
    return await sql.query(query, params);
  } catch (error) {
    console.error("Database query error:", error);
    // In development or preview mode, return mock data
    return getMockDataForQuery(query);
  }
}

// Helper function to return mock data based on query
function getMockDataForQuery(query: string) {
  // Check query to determine what mock data to return
  if (query.includes('Account')) {
    return getMockAccounts();
  } else if (query.includes('Proxy')) {
    return getMockProxies();
  } else if (query.includes('MessageConfig')) {
    return getMockMessages();
  } else {
    return { rows: [], rowCount: 0 };
  }
}

// Mock data helper functions for development
export function getMockAccounts() {
  return {
    rows: [
      { id: '1', username: 'demo_user1', password: '********', proxyAddress: '192.168.1.1:8080', isActive: true, lastLogin: new Date(), sessionData: null, createdAt: new Date(), updatedAt: new Date() },
      { id: '2', username: 'demo_user2', password: '********', proxyAddress: '192.168.1.2:8080', isActive: false, lastLogin: null, sessionData: null, createdAt: new Date(), updatedAt: new Date() }
    ],
    rowCount: 2
  };
}

export function getMockProxies() {
  return {
    rows: [
      { id: '1', address: '192.168.1.1', port: 8080, username: 'proxy_user1', password: '********', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { id: '2', address: '192.168.1.2', port: 8080, username: 'proxy_user2', password: '********', isActive: true, createdAt: new Date(), updatedAt: new Date() }
    ],
    rowCount: 2
  };
}

export function getMockMessages() {
  return {
    rows: [
      { id: 1, accountId: '1', targetUsername: 'target_user1', messageTemplate: 'Hello, {{name}}! Check out my profile.', isActive: true, lastSent: null, createdAt: new Date(), updatedAt: new Date() }
    ],
    rowCount: 1
  };
}

// Stats functions
export function getMockStats() {
  return {
    totalAccounts: 2,
    activeAccounts: 1,
    totalProxies: 2,
    activeProxies: 2
  };
}
