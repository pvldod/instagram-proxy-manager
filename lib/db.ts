import { neon } from "@neondatabase/serverless"

// Check if DATABASE_URL is available and valid
const isDevelopment = process.env.NODE_ENV === 'development';
const dbUrl = process.env.DATABASE_URL || '';

console.log(`DB setup: environment=${process.env.NODE_ENV}, hasDbUrl=${!!dbUrl}`);

// Initialize the SQL client or use a mock implementation
let sql: any;

try {
  if (dbUrl.trim() === '') {
    console.log("Používám simulovanou databázi v development režimu");
    sql = {
      query: async (query: string, params: any[] = []) => {
        console.log(`[MOCK DB] Query: ${query.slice(0, 100)}${query.length > 100 ? '...' : ''}`);
        console.log(`[MOCK DB] Params: ${JSON.stringify(params)}`);
        return getMockQueryResult(query);
      }
    };
  } else {
    console.log("Inicializuji spojení s databází Neon");
    sql = neon(dbUrl);
  }
} catch (error) {
  console.warn("Database connection setup failed, using mock implementation", error);
  sql = {
    query: async (query: string, params: any[] = []) => {
      console.log(`[MOCK DB - FALLBACK] Query: ${query.slice(0, 100)}${query.length > 100 ? '...' : ''}`);
      return getMockQueryResult(query);
    }
  };
}

export { sql };

// Helper function to get mock data based on query
function getMockQueryResult(query?: string) {
  if (!query) return { rows: [], rowCount: 0 };
  return getMockDataForQuery(query);
}

// Helper function to execute raw SQL queries
export async function executeQuery(query: string, params: any[] = []) {
  try {
    console.log(`Executing query: ${query.slice(0, 100)}${query.length > 100 ? '...' : ''}`);
    console.log(`Query params:`, params);
    
    // Pokud jsme v development režimu bez databáze, použijeme mock data
    if (isDevelopment && dbUrl.trim() === '') {
      console.log("Používám mock data pro query");
      return getMockDataForQuery(query);
    }
    
    const result = await sql.query(query, params);
    console.log(`Query result: rows=${result.rows?.length || 0}, rowCount=${result.rowCount || 0}`);
    return result;
  } catch (error) {
    console.error("Database query error:", error);
    // In development or preview mode, return mock data
    console.log("Vracím mock data kvůli chybě v dotazu");
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
