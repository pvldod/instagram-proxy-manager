import { executeQuery } from "./db"
import { v4 as uuidv4 } from "uuid"

export interface Proxy {
  id: string
  address: string
  port: number
  username?: string
  password?: string
  isActive: boolean
}

export interface ProxyInput {
  address: string
  port: number
  username?: string
  password?: string
}

export async function getProxies(limit = 100, offset = 0): Promise<Proxy[]> {
  try {
    const query = `
      SELECT id, address, port, username, password, "isActive"
      FROM "Proxy"
      ORDER BY address, port
      LIMIT $1 OFFSET $2
    `

    const result = await executeQuery(query, [limit, offset])
    return (result.rows || []) as Proxy[] // Ensure we always return an array
  } catch (error) {
    console.error("Failed to get proxies:", error)
    // Return mock data in preview mode
    if (process.env.NODE_ENV === "development") {
      return getMockProxies()
    }
    return []
  }
}

export async function getProxyById(id: string): Promise<Proxy | null> {
  try {
    const query = `
      SELECT id, address, port, username, password, "isActive"
      FROM "Proxy"
      WHERE id = $1
    `

    const result = await executeQuery(query, [id])
    return result.rows.length > 0 ? (result.rows[0] as Proxy) : null
  } catch (error) {
    console.error(`Failed to get proxy ${id}:`, error)
    // Return mock data in preview mode
    if (process.env.NODE_ENV === "development" && id) {
      const mockProxies = getMockProxies()
      return mockProxies.find((p) => p.id === id) || null
    }
    return null
  }
}

export async function addProxy(proxy: ProxyInput): Promise<Proxy> {
  try {
    const id = uuidv4()
    const query = `
      INSERT INTO "Proxy" (id, address, port, username, password, "isActive")
      VALUES ($1, $2, $3, $4, $5, true)
      ON CONFLICT (address, port) DO UPDATE
      SET username = $4,
          password = $5,
          "isActive" = true
      RETURNING id, address, port, username, password, "isActive"
    `

    const result = await executeQuery(query, [
      id,
      proxy.address,
      proxy.port,
      proxy.username || null,
      proxy.password || null,
    ])

    return result.rows[0] as Proxy
  } catch (error) {
    console.error("Failed to add proxy:", error)
    // Return mock data in preview mode
    if (process.env.NODE_ENV === "development") {
      return {
        id: uuidv4(),
        address: proxy.address,
        port: proxy.port,
        username: proxy.username,
        password: proxy.password,
        isActive: true,
      }
    }
    throw error
  }
}

export async function updateProxy(id: string, proxy: Partial<ProxyInput> & { isActive?: boolean }): Promise<Proxy> {
  try {
    // Get the current proxy to handle password updates correctly
    const currentProxy = await getProxyById(id)
    if (!currentProxy) {
      throw new Error("Proxy not found")
    }

    // If password is empty, keep the current password
    const password = proxy.password === "" ? currentProxy.password : proxy.password

    const query = `
      UPDATE "Proxy"
      SET address = $1,
          port = $2,
          username = $3,
          password = $4,
          "isActive" = $5
      WHERE id = $6
      RETURNING id, address, port, username, password, "isActive"
    `

    const result = await executeQuery(query, [
      proxy.address || currentProxy.address,
      proxy.port || currentProxy.port,
      proxy.username === undefined ? currentProxy.username : proxy.username,
      password === undefined ? currentProxy.password : password,
      proxy.isActive === undefined ? currentProxy.isActive : proxy.isActive,
      id,
    ])

    return result.rows[0] as Proxy
  } catch (error) {
    console.error(`Failed to update proxy ${id}:`, error)
    throw error
  }
}

export async function addProxies(proxies: ProxyInput[]): Promise<number> {
  if (proxies.length === 0) return 0

  try {
    // Create a batch insert query
    const values = proxies
      .map((_, i) => {
        const offset = i * 5
        return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, true)`
      })
      .join(", ")

    const params: any[] = []
    proxies.forEach((proxy) => {
      params.push(uuidv4(), proxy.address, proxy.port, proxy.username || null, proxy.password || null)
    })

    const query = `
      INSERT INTO "Proxy" (id, address, port, username, password, "isActive")
      VALUES ${values}
      ON CONFLICT (address, port) DO NOTHING
    `

    const result = await executeQuery(query, params)
    return result.rowCount || 0
  } catch (error) {
    console.error("Failed to add proxies:", error)
    // Return mock data in preview mode
    if (process.env.NODE_ENV === "development") {
      return proxies.length
    }
    throw error
  }
}

export async function deleteProxy(id: string): Promise<boolean> {
  try {
    const query = `
      DELETE FROM "Proxy"
      WHERE id = $1
    `

    await executeQuery(query, [id])
    return true
  } catch (error) {
    console.error(`Failed to delete proxy ${id}:`, error)
    return process.env.NODE_ENV === "development"
  }
}

export async function getProxyStats(): Promise<{
  total: number
  active: number
}> {
  try {
    const query = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN "isActive" = true THEN 1 ELSE 0 END) as active
      FROM "Proxy"
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
    console.error("Failed to get proxy stats:", error)
    // Return mock data in preview mode
    if (process.env.NODE_ENV === "development") {
      const mockProxies = getMockProxies()
      return {
        total: mockProxies.length,
        active: mockProxies.filter((p) => p.isActive).length,
      }
    }
    return { total: 0, active: 0 }
  }
}

// Mock data for preview mode
function getMockProxies(): Proxy[] {
  return [
    {
      id: "proxy-001",
      address: "proxy1.example.com",
      port: 8080,
      username: "proxy_user1",
      password: "proxy_pass1",
      isActive: true,
    },
    {
      id: "proxy-002",
      address: "proxy2.example.com",
      port: 8080,
      username: "proxy_user2",
      password: "proxy_pass2",
      isActive: true,
    },
    {
      id: "proxy-003",
      address: "proxy3.example.com",
      port: 8080,
      username: "proxy_user3",
      password: "proxy_pass3",
      isActive: true,
    },
    {
      id: "proxy-004",
      address: "proxy4.example.com",
      port: 8080,
      username: "proxy_user4",
      password: "proxy_pass4",
      isActive: true,
    },
    {
      id: "proxy-005",
      address: "proxy5.example.com",
      port: 8080,
      username: "proxy_user5",
      password: "proxy_pass5",
      isActive: true,
    },
  ]
}
