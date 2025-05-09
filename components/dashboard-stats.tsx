"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { getStats } from "@/lib/actions"
import { Users, Shield, Activity } from "lucide-react"

interface Stats {
  totalAccounts: number
  activeAccounts: number
  totalProxies: number
  activeProxies: number
}

export function DashboardStats() {
  const [stats, setStats] = useState<Stats>({
    totalAccounts: 0,
    activeAccounts: 0,
    totalProxies: 0,
    activeProxies: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getStats()
        setStats(data)
      } catch (err) {
        console.error("Failed to fetch stats:", err)
        setError("Failed to load statistics")
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard
        title="Total Accounts"
        value={stats.totalAccounts}
        loading={loading}
        icon={<Users className="h-5 w-5 text-instagram-purple" />}
      />
      <StatsCard
        title="Active Sessions"
        value={stats.activeAccounts}
        loading={loading}
        icon={<Activity className="h-5 w-5 text-instagram-pink" />}
      />
      <StatsCard
        title="Total Proxies"
        value={stats.totalProxies}
        loading={loading}
        icon={<Shield className="h-5 w-5 text-instagram-blue" />}
      />
      <StatsCard
        title="Active Proxies"
        value={stats.activeProxies}
        loading={loading}
        icon={<Shield className="h-5 w-5 text-instagram-orange" />}
      />
      {error && <div className="col-span-full text-center text-red-500 mt-2">{error}</div>}
    </div>
  )
}

function StatsCard({
  title,
  value,
  loading,
  icon,
}: {
  title: string
  value: number
  loading: boolean
  icon: React.ReactNode
}) {
  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="p-6 flex items-center gap-4">
        <div className="rounded-full p-3 bg-muted flex items-center justify-center">{icon}</div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {loading ? (
            <div className="h-6 w-16 bg-muted animate-pulse rounded mt-1" />
          ) : (
            <p className="text-2xl font-bold">{value.toLocaleString()}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
