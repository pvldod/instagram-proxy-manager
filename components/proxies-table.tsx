"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, RefreshCw, Trash2, Copy } from "lucide-react"
import { fetchProxies, removeProxy } from "@/lib/actions"

interface Proxy {
  id: string
  address: string
  port: number
  username?: string
  password?: string
  isActive: boolean
}

export function ProxiesTable() {
  const [proxies, setProxies] = useState<Proxy[]>([])
  const [loading, setLoading] = useState(true)
  const [processingIds, setProcessingIds] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProxiesData()
  }, [])

  const fetchProxiesData = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchProxies()
      // Ensure we always have an array, even if the API returns undefined
      setProxies(data || [])
    } catch (err) {
      console.error("Failed to fetch proxies:", err)
      setError("Failed to load proxies")
      setProxies([]) // Set to empty array on error
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this proxy?")) {
      try {
        setProcessingIds((prev) => [...prev, id])
        await removeProxy(id)
        setProxies((prev) => prev.filter((proxy) => proxy.id !== id))
      } catch (error) {
        console.error(`Failed to delete proxy ${id}:`, error)
      } finally {
        setProcessingIds((prev) => prev.filter((pid) => pid !== id))
      }
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert("Copied to clipboard")
      })
      .catch((err) => {
        console.error("Failed to copy:", err)
      })
  }

  const formatProxyString = (proxy: Proxy) => {
    if (proxy.username && proxy.password) {
      return `${proxy.username}:${proxy.password}@${proxy.address}:${proxy.port}`
    }
    return `${proxy.address}:${proxy.port}`
  }

  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading proxies...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={fetchProxiesData}>Try Again</Button>
        </div>
      </div>
    )
  }

  if (!proxies || proxies.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No proxies found</p>
          <Button asChild>
            <Link href="/dashboard/proxies/add">Add Proxies</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Address</TableHead>
            <TableHead>Port</TableHead>
            <TableHead>Authentication</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {proxies.map((proxy) => (
            <TableRow key={proxy.id}>
              <TableCell className="font-medium">{proxy.address}</TableCell>
              <TableCell>{proxy.port}</TableCell>
              <TableCell>
                {proxy.username && proxy.password ? (
                  <Badge variant="outline">{proxy.username}:•••••••</Badge>
                ) : (
                  <span className="text-muted-foreground">None</span>
                )}
              </TableCell>
              <TableCell>
                <Badge variant={proxy.isActive ? "success" : "secondary"}>
                  {proxy.isActive ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" disabled={processingIds.includes(proxy.id)}>
                      {processingIds.includes(proxy.id) ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <MoreHorizontal className="h-4 w-4" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => copyToClipboard(formatProxyString(proxy))}>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(proxy.id)} className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
