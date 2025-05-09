export interface Account {
  id: string
  username: string
  password: string
  proxyAddress: string
  isActive: boolean
  lastLogin: string | null
  sessionData?: string
}

export interface Proxy {
  id: string
  address: string
  port: number
  username?: string
  password?: string
  isActive: boolean
  accountId?: string
}

export interface Stats {
  totalAccounts: number
  activeAccounts: number
  totalProxies: number
  activeProxies: number
}
