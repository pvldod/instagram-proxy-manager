import { executeQuery, getMockAccounts as dbGetMockAccounts } from "./db"
import { v4 as uuidv4 } from "uuid"

export interface Account {
  id: string
  username: string
  password: string
  proxyAddress: string
  isActive: boolean
  lastLogin: string | null
  sessionData?: string
  createdAt: string
  updatedAt: string
}

export interface AccountInput {
  username: string
  password: string
  proxyAddress: string
}

// Convert mock data from db.ts to the expected format
function getMockAccounts(): Account[] {
  const mockData = dbGetMockAccounts();
  return mockData.rows.map(row => ({
    id: row.id,
    username: row.username,
    password: row.password,
    proxyAddress: row.proxyAddress,
    isActive: row.isActive,
    lastLogin: row.lastLogin ? row.lastLogin.toISOString() : null,
    sessionData: row.sessionData || undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString()
  })) as Account[];
}

export async function getAccounts(limit = 100, offset = 0): Promise<Account[]> {
  try {
    const query = `
      SELECT id, username, password, "proxyAddress", "isActive", "lastLogin", 
             "sessionData", "createdAt", "updatedAt"
      FROM "Account"
      ORDER BY "createdAt" DESC
      LIMIT $1 OFFSET $2
    `

    const accounts = await executeQuery(query, [limit, offset])
    return accounts.rows as Account[]
  } catch (error) {
    console.error("Failed to get accounts:", error)
    // Return mock data in development mode
    if (process.env.NODE_ENV === "development") {
      return getMockAccounts()
    }
    return []
  }
}

export async function getAccountById(id: string): Promise<Account | null> {
  try {
    const query = `
      SELECT id, username, password, "proxyAddress", "isActive", "lastLogin", 
             "sessionData", "createdAt", "updatedAt"
      FROM "Account"
      WHERE id = $1
    `

    const result = await executeQuery(query, [id])
    return result.rows.length > 0 ? (result.rows[0] as Account) : null
  } catch (error) {
    console.error(`Failed to get account ${id}:`, error)
    // Return mock data in development mode
    if (process.env.NODE_ENV === "development" && id) {
      const mockAccounts = getMockAccounts()
      return mockAccounts.find((a) => a.id === id) || null
    }
    return null
  }
}

export async function addAccount(account: AccountInput): Promise<Account> {
  console.log("lib/accounts.ts: Attempt to add account", {
    username: account.username,
    proxyAddress: account.proxyAddress,
    environment: process.env.NODE_ENV,
    useRealInstagram: process.env.USE_REAL_INSTAGRAM_LOGIN
  });

  try {
    const id = uuidv4()
    const query = `
      INSERT INTO "Account" (id, username, password, "proxyAddress", "isActive")
      VALUES ($1, $2, $3, $4, false)
      RETURNING id, username, password, "proxyAddress", "isActive", "lastLogin", 
                "sessionData", "createdAt", "updatedAt"
    `

    const result = await executeQuery(query, [id, account.username, account.password, account.proxyAddress])
    console.log("Account successfully added to database");

    return result.rows[0] as Account
  } catch (error) {
    console.error("Failed to add account:", error)

    // More detailed error logging
    if (error instanceof Error) {
      console.error("Error details:", error.message);
      console.error("Stack trace:", error.stack);
    }

    // Return mock data in development mode
    if (process.env.NODE_ENV === "development") {
      console.log("Using mock data for development mode");
      return {
        id: uuidv4(),
        username: account.username,
        password: account.password,
        proxyAddress: account.proxyAddress,
        isActive: false,
        lastLogin: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    }
    throw error
  }
}

export async function addAccounts(accounts: AccountInput[]): Promise<number> {
  if (accounts.length === 0) return 0

  try {
    // Create a batch insert query
    const values = accounts
      .map((_, i) => {
        const offset = i * 4
        return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, false)`
      })
      .join(", ")

    const params: any[] = []
    accounts.forEach((account) => {
      params.push(uuidv4(), account.username, account.password, account.proxyAddress)
    })

    const query = `
      INSERT INTO "Account" (id, username, password, "proxyAddress", "isActive")
      VALUES ${values}
      ON CONFLICT (username) DO NOTHING
    `

    const result = await executeQuery(query, params)
    return result.rowCount || 0
  } catch (error) {
    console.error("Failed to add accounts:", error)
    // Return mock data in development mode
    if (process.env.NODE_ENV === "development") {
      return accounts.length
    }
    throw error
  }
}

export async function updateAccountSession(id: string, sessionData: string): Promise<boolean> {
  try {
    const query = `
      UPDATE "Account"
      SET "isActive" = true,
          "lastLogin" = CURRENT_TIMESTAMP,
          "sessionData" = $1,
          "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = $2
    `

    await executeQuery(query, [sessionData, id])
    return true
  } catch (error) {
    console.error(`Failed to update account session ${id}:`, error)
    return process.env.NODE_ENV === "development"
  }
}

export async function deleteAccount(id: string): Promise<boolean> {
  try {
    const query = `
      DELETE FROM "Account"
      WHERE id = $1
    `

    await executeQuery(query, [id])
    return true
  } catch (error) {
    console.error(`Failed to delete account ${id}:`, error)
    return process.env.NODE_ENV === "development"
  }
}

export async function getAccountStats(): Promise<{
  total: number
  active: number
}> {
  try {
    const query = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN "isActive" = true THEN 1 ELSE 0 END) as active
      FROM "Account"
    `

    const result = await executeQuery(query)

    // Check if result.rows exists and has at least one row
    if (!result.rows || result.rows.length === 0) {
      return { total: 0, active: 0 }
    }

    return {
      total: Number.parseInt(result.rows[0].total) || 0,
      active: Number.parseInt(result.rows[0].active) || 0,
    }
  } catch (error) {
    console.error("Failed to get account stats:", error)
    // Return mock data in development mode
    if (process.env.NODE_ENV === "development") {
      const mockAccounts = getMockAccounts()
      return {
        total: mockAccounts.length,
        active: mockAccounts.filter((a: Account) => a.isActive).length,
      }
    }
    return { total: 0, active: 0 }
  }
}