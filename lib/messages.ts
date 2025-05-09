import { executeQuery } from "./db"

export interface MessageConfig {
  id: number
  accountId: string
  targetUsername: string
  messageTemplate: string
  isActive: boolean
  lastSent: string | null
  createdAt: string
  updatedAt: string
}

export interface MessageConfigInput {
  accountId: string
  targetUsername: string
  messageTemplate: string
  isActive?: boolean
}

export async function getMessageConfigs(accountId?: string, limit = 100, offset = 0): Promise<MessageConfig[]> {
  try {
    let query = `
      SELECT id, "accountId", "targetUsername", "messageTemplate", "isActive", "lastSent", "createdAt", "updatedAt"
      FROM "MessageConfig"
    `

    const params: any[] = []

    if (accountId) {
      query += ` WHERE "accountId" = $1`
      params.push(accountId)
    }

    query += ` ORDER BY "createdAt" DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(limit, offset)

    const result = await executeQuery(query, params)

    // Ensure we always return an array, even if result.rows is undefined
    return (result.rows || []) as MessageConfig[]
  } catch (error) {
    console.error("Failed to get message configs:", error)
    return [] // Return empty array on error
  }
}

export async function getMessageConfigById(id: number): Promise<MessageConfig | null> {
  try {
    const query = `
      SELECT id, "accountId", "targetUsername", "messageTemplate", "isActive", "lastSent", "createdAt", "updatedAt"
      FROM "MessageConfig"
      WHERE id = $1
    `

    const result = await executeQuery(query, [id])
    return result.rows.length > 0 ? (result.rows[0] as MessageConfig) : null
  } catch (error) {
    console.error(`Failed to get message config ${id}:`, error)
    return null
  }
}

export async function getMessageConfigByAccount(
  accountId: string,
  targetUsername: string,
): Promise<MessageConfig | null> {
  try {
    const query = `
      SELECT id, "accountId", "targetUsername", "messageTemplate", "isActive", "lastSent", "createdAt", "updatedAt"
      FROM "MessageConfig"
      WHERE "accountId" = $1 AND "targetUsername" = $2
    `

    const result = await executeQuery(query, [accountId, targetUsername])
    return result.rows.length > 0 ? (result.rows[0] as MessageConfig) : null
  } catch (error) {
    console.error(`Failed to get message config for account ${accountId} and target ${targetUsername}:`, error)
    return null
  }
}

export async function addMessageConfig(config: MessageConfigInput): Promise<MessageConfig> {
  try {
    // Check if a config already exists for this account and target
    const existingConfig = await getMessageConfigByAccount(config.accountId, config.targetUsername)

    if (existingConfig) {
      // Update existing config
      return updateMessageConfig(existingConfig.id, config)
    }

    const query = `
      INSERT INTO "MessageConfig" ("accountId", "targetUsername", "messageTemplate", "isActive")
      VALUES ($1, $2, $3, $4)
      RETURNING id, "accountId", "targetUsername", "messageTemplate", "isActive", "lastSent", "createdAt", "updatedAt"
    `

    const result = await executeQuery(query, [
      config.accountId,
      config.targetUsername,
      config.messageTemplate,
      config.isActive !== undefined ? config.isActive : true,
    ])

    return result.rows[0] as MessageConfig
  } catch (error) {
    console.error("Failed to add message config:", error)
    throw error
  }
}

export async function updateMessageConfig(id: number, config: Partial<MessageConfigInput>): Promise<MessageConfig> {
  try {
    // Get current config to merge with updates
    const currentConfig = await getMessageConfigById(id)
    if (!currentConfig) {
      throw new Error("Message config not found")
    }

    const query = `
      UPDATE "MessageConfig"
      SET "targetUsername" = $1,
          "messageTemplate" = $2,
          "isActive" = $3,
          "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING id, "accountId", "targetUsername", "messageTemplate", "isActive", "lastSent", "createdAt", "updatedAt"
    `

    const result = await executeQuery(query, [
      config.targetUsername || currentConfig.targetUsername,
      config.messageTemplate || currentConfig.messageTemplate,
      config.isActive !== undefined ? config.isActive : currentConfig.isActive,
      id,
    ])

    return result.rows[0] as MessageConfig
  } catch (error) {
    console.error(`Failed to update message config ${id}:`, error)
    throw error
  }
}

export async function deleteMessageConfig(id: number): Promise<boolean> {
  try {
    const query = `
      DELETE FROM "MessageConfig"
      WHERE id = $1
    `

    await executeQuery(query, [id])
    return true
  } catch (error) {
    console.error(`Failed to delete message config ${id}:`, error)
    throw error
  }
}

export async function updateMessageSent(id: number): Promise<boolean> {
  try {
    const query = `
      UPDATE "MessageConfig"
      SET "lastSent" = CURRENT_TIMESTAMP
      WHERE id = $1
    `

    await executeQuery(query, [id])
    return true
  } catch (error) {
    console.error(`Failed to update message sent status for config ${id}:`, error)
    return false
  }
}

export async function getMessageConfigsForAccount(accountId: string): Promise<MessageConfig[]> {
  try {
    const query = `
      SELECT id, "accountId", "targetUsername", "messageTemplate", "isActive", "lastSent", "createdAt", "updatedAt"
      FROM "MessageConfig"
      WHERE "accountId" = $1 AND "isActive" = true
      ORDER BY "createdAt" DESC
    `

    const result = await executeQuery(query, [accountId])
    return result.rows as MessageConfig[]
  } catch (error) {
    console.error(`Failed to get message configs for account ${accountId}:`, error)
    return []
  }
}
