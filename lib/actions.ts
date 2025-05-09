"use server"

import { revalidatePath } from "next/cache"
import {
  getAccounts,
  addAccount,
  addAccounts as addMultipleAccounts,
  updateAccountSession,
  deleteAccount,
  getAccountById,
  getAccountStats,
} from "./accounts"
import {
  getProxies,
  addProxy,
  updateProxy as updateProxyData,
  addProxies as addMultipleProxies,
  deleteProxy,
  getProxyStats,
  getProxyById,
} from "./proxies"
import {
  getMessageConfigs,
  getMessageConfigById,
  addMessageConfig,
  updateMessageConfig,
  deleteMessageConfig,
  getMessageConfigsForAccount,
  updateMessageSent,
} from "./messages"
import { loginToInstagram, sendInstagramMessage } from "./instagram"

export async function getStats() {
  try {
    const [accountStats, proxyStats] = await Promise.all([getAccountStats(), getProxyStats()])

    return {
      totalAccounts: accountStats.total,
      activeAccounts: accountStats.active,
      totalProxies: proxyStats.total,
      activeProxies: proxyStats.active,
    }
  } catch (error) {
    console.error("Failed to get stats:", error)
    return {
      totalAccounts: 0,
      activeAccounts: 0,
      totalProxies: 0,
      activeProxies: 0,
    }
  }
}

export async function fetchAccounts(limit = 100, offset = 0) {
  try {
    const accounts = await getAccounts(limit, offset)

    // Don't send passwords to the client
    return accounts.map((account) => ({
      ...account,
      password: "••••••••",
    }))
  } catch (error) {
    console.error("Failed to fetch accounts:", error)
    return []
  }
}

export async function addNewAccount(formData: FormData) {
  const username = formData.get("username") as string
  const password = formData.get("password") as string
  const proxyAddress = formData.get("proxyAddress") as string

  if (!username || !password || !proxyAddress) {
    throw new Error("All fields are required")
  }

  await addAccount({ username, password, proxyAddress })
  revalidatePath("/accounts")
  return { success: true }
}

export async function addBulkAccounts(accounts: { username: string; password: string; proxyAddress: string }[]) {
  if (!accounts.length) {
    throw new Error("No accounts provided")
  }

  if (accounts.length > 5000) {
    throw new Error("Maximum 5,000 accounts can be added at once")
  }

  // Process in batches of 100
  const batchSize = 100
  let processed = 0

  for (let i = 0; i < accounts.length; i += batchSize) {
    const batch = accounts.slice(i, i + batchSize)
    const count = await addMultipleAccounts(batch)
    processed += count
  }

  revalidatePath("/accounts")
  return { success: true, processed }
}

export async function loginAccount(id: string) {
  try {
    const account = await getAccountById(id)

    if (!account) {
      throw new Error("Account not found")
    }

    // Attempt to login to Instagram
    const { success, sessionData, error } = await loginToInstagram({
      username: account.username,
      password: account.password,
      proxyAddress: account.proxyAddress,
    })

    if (!success) {
      throw new Error(error || "Failed to login to Instagram")
    }

    // Update account with session data
    await updateAccountSession(id, sessionData!)

    revalidatePath("/accounts")
    return { success: true }
  } catch (error) {
    console.error(`Failed to login account ${id}:`, error)
    throw error
  }
}

export async function removeAccount(id: string) {
  try {
    await deleteAccount(id)
    revalidatePath("/accounts")
    return { success: true }
  } catch (error) {
    console.error(`Failed to delete account ${id}:`, error)
    throw error
  }
}

export async function fetchProxies(limit = 100, offset = 0) {
  try {
    const proxies = await getProxies(limit, offset)
    return proxies || [] // Ensure we always return an array
  } catch (error) {
    console.error("Failed to fetch proxies:", error)
    return [] // Return empty array on error
  }
}

export async function fetchProxyById(id: string) {
  try {
    const proxy = await getProxyById(id)
    return proxy
  } catch (error) {
    console.error(`Failed to fetch proxy ${id}:`, error)
    return null
  }
}

export async function addNewProxy(formData: FormData) {
  const address = formData.get("address") as string
  const portStr = formData.get("port") as string
  const username = (formData.get("username") as string) || undefined
  const password = (formData.get("password") as string) || undefined

  if (!address || !portStr) {
    throw new Error("Address and port are required")
  }

  const port = Number.parseInt(portStr, 10)
  if (isNaN(port)) {
    throw new Error("Port must be a number")
  }

  await addProxy({ address, port, username, password })
  revalidatePath("/proxies")
  return { success: true }
}

export async function updateProxy(formData: FormData) {
  const id = formData.get("id") as string
  const address = formData.get("address") as string
  const portStr = formData.get("port") as string
  const username = (formData.get("username") as string) || undefined
  const password = (formData.get("password") as string) || undefined
  const isActive = formData.has("isActive")

  if (!id || !address || !portStr) {
    throw new Error("ID, address, and port are required")
  }

  const port = Number.parseInt(portStr, 10)
  if (isNaN(port)) {
    throw new Error("Port must be a number")
  }

  await updateProxyData(id, {
    address,
    port,
    username,
    password,
    isActive,
  })

  revalidatePath(`/proxies/${id}`)
  revalidatePath("/proxies")
  return { success: true }
}

export async function addBulkProxies(
  proxies: { address: string; port: number; username?: string; password?: string }[],
) {
  if (!proxies.length) {
    throw new Error("No proxies provided")
  }

  // Process in batches of 100
  const batchSize = 100
  let processed = 0

  for (let i = 0; i < proxies.length; i += batchSize) {
    const batch = proxies.slice(i, i + batchSize)
    const count = await addMultipleProxies(batch)
    processed += count
  }

  revalidatePath("/proxies")
  return { success: true, processed }
}

export async function removeProxy(id: string) {
  try {
    await deleteProxy(id)
    revalidatePath("/proxies")
    return { success: true }
  } catch (error) {
    console.error(`Failed to delete proxy ${id}:`, error)
    throw error
  }
}

// Add new message config actions
export async function fetchMessageConfigs(accountId?: string) {
  try {
    const configs = await getMessageConfigs(accountId)
    return configs || [] // Ensure we always return an array
  } catch (error) {
    console.error("Failed to fetch message configs:", error)
    return [] // Return empty array on error
  }
}

export async function fetchMessageConfigsForAccount(accountId: string) {
  try {
    return getMessageConfigsForAccount(accountId)
  } catch (error) {
    console.error(`Failed to fetch message configs for account ${accountId}:`, error)
    return []
  }
}

export async function fetchMessageConfigById(id: number) {
  try {
    return getMessageConfigById(id)
  } catch (error) {
    console.error(`Failed to fetch message config ${id}:`, error)
    return null
  }
}

export async function addNewMessageConfig(formData: FormData) {
  const accountId = formData.get("accountId") as string
  const targetUsername = formData.get("targetUsername") as string
  const messageTemplate = formData.get("messageTemplate") as string
  const isActive = formData.has("isActive")

  if (!accountId || !targetUsername || !messageTemplate) {
    throw new Error("Account ID, target username, and message template are required")
  }

  await addMessageConfig({
    accountId,
    targetUsername,
    messageTemplate,
    isActive,
  })

  revalidatePath(`/accounts/${accountId}/messages`)
  revalidatePath("/messages")
  return { success: true }
}

export async function updateExistingMessageConfig(formData: FormData) {
  const id = Number(formData.get("id"))
  const targetUsername = formData.get("targetUsername") as string
  const messageTemplate = formData.get("messageTemplate") as string
  const isActive = formData.has("isActive")

  if (isNaN(id) || !targetUsername || !messageTemplate) {
    throw new Error("ID, target username, and message template are required")
  }

  const config = await updateMessageConfig(id, {
    targetUsername,
    messageTemplate,
    isActive,
  })

  revalidatePath(`/accounts/${config.accountId}/messages`)
  revalidatePath("/messages")
  return { success: true }
}

export async function removeMessageConfig(id: number) {
  try {
    const config = await getMessageConfigById(id)
    await deleteMessageConfig(id)

    if (config) {
      revalidatePath(`/accounts/${config.accountId}/messages`)
    }

    revalidatePath("/messages")
    return { success: true }
  } catch (error) {
    console.error(`Failed to delete message config ${id}:`, error)
    throw error
  }
}

export async function loginAccountWithMessage(id: string) {
  try {
    const account = await getAccountById(id)

    if (!account) {
      throw new Error("Account not found")
    }

    // Attempt to login to Instagram
    const { success, sessionData, error } = await loginToInstagram({
      username: account.username,
      password: account.password,
      proxyAddress: account.proxyAddress,
    })

    if (!success) {
      throw new Error(error || "Failed to login to Instagram")
    }

    // Update account with session data
    await updateAccountSession(id, sessionData!)

    // Get active message configs for this account
    const messageConfigs = await getMessageConfigsForAccount(id)

    // Send messages if there are any configs
    if (messageConfigs.length > 0) {
      for (const config of messageConfigs) {
        try {
          await sendInstagramMessage({
            sessionData: sessionData!,
            proxyAddress: account.proxyAddress,
            targetUsername: config.targetUsername,
            message: config.messageTemplate,
          })

          // Update last sent timestamp
          await updateMessageSent(config.id)
        } catch (msgError) {
          console.error(`Failed to send message to ${config.targetUsername}:`, msgError)
          // Continue with other messages even if one fails
        }
      }
    }

    revalidatePath("/accounts")
    return { success: true }
  } catch (error) {
    console.error(`Failed to login account ${id}:`, error)
    throw error
  }
}
