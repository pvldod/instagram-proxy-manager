"use client"

import Link from "next/link"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, RefreshCw, MessageCircle, Trash2, LogIn } from "lucide-react"
import { fetchAccounts, loginAccount, removeAccount } from "@/lib/actions"

interface Account {
  id: string
  username: string
  proxyAddress: string
  isActive: boolean
  lastLogin: string | null
}

export function AccountsTable() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [processingIds, setProcessingIds] = useState<string[]>([])

  useEffect(() => {
    fetchAccountsData()
  }, [])

  const fetchAccountsData = async () => {
    try {
      setLoading(true)
      const data = await fetchAccounts()
      setAccounts(data)
    } catch (error) {
      console.error("Failed to fetch accounts:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (id: string) => {
    try {
      setProcessingIds((prev) => [...prev, id])
      await loginAccount(id)
      fetchAccountsData()
    } catch (error) {
      console.error(`Failed to login account ${id}:`, error)
      alert(error instanceof Error ? error.message : "Failed to login")
    } finally {
      setProcessingIds((prev) => prev.filter((pid) => pid !== id))
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this account?")) {
      try {
        setProcessingIds((prev) => [...prev, id])
        await removeAccount(id)
        setAccounts((prev) => prev.filter((account) => account.id !== id))
      } catch (error) {
        console.error(`Failed to delete account ${id}:`, error)
      } finally {
        setProcessingIds((prev) => prev.filter((pid) => pid !== id))
      }
    }
  }

  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading accounts...</span>
        </div>
      </div>
    )
  }

  if (accounts.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No accounts found</p>
          <Button asChild>
            <Link href="/dashboard/accounts/add">Add Accounts</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="border rounded-xl overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Username</TableHead>
            <TableHead>Proxy</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Login</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accounts.map((account) => (
            <TableRow key={account.id}>
              <TableCell className="font-medium">{account.username}</TableCell>
              <TableCell>{account.proxyAddress}</TableCell>
              <TableCell>
                <Badge variant={account.isActive ? "success" : "secondary"}>
                  {account.isActive ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell>{account.lastLogin ? new Date(account.lastLogin).toLocaleString() : "Never"}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" disabled={processingIds.includes(account.id)}>
                      {processingIds.includes(account.id) ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <MoreHorizontal className="h-4 w-4" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleLogin(account.id)}>
                      <LogIn className="mr-2 h-4 w-4" />
                      Login
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/accounts/${account.id}/messages`}>
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Messages
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(account.id)} className="text-destructive">
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
