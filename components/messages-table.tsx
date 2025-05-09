"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, RefreshCw, Edit, Trash2 } from "lucide-react"
import { fetchMessageConfigs, removeMessageConfig } from "@/lib/actions"

interface MessageConfig {
  id: number
  accountId: string
  targetUsername: string
  messageTemplate: string
  isActive: boolean
  lastSent: string | null
  createdAt: string
  updatedAt: string
  accountUsername?: string // Added when joining with account data
}

export function MessagesTable() {
  const [messages, setMessages] = useState<MessageConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [processingIds, setProcessingIds] = useState<number[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMessagesData()
  }, [])

  const fetchMessagesData = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchMessageConfigs()
      // Ensure we always have an array, even if the API returns undefined
      setMessages(data || [])
    } catch (err) {
      console.error("Failed to fetch messages:", err)
      setError("Failed to load message configurations")
      setMessages([]) // Set to empty array on error
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this message configuration?")) {
      try {
        setProcessingIds((prev) => [...prev, id])
        await removeMessageConfig(id)
        setMessages((prev) => prev.filter((message) => message.id !== id))
      } catch (error) {
        console.error(`Failed to delete message config ${id}:`, error)
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
          <span>Loading message configurations...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={fetchMessagesData}>Try Again</Button>
        </div>
      </div>
    )
  }

  if (!messages || messages.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No message configurations found</p>
          <Button asChild>
            <Link href="/dashboard/messages/add">Add Message</Link>
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
            <TableHead>Account ID</TableHead>
            <TableHead>Target Username</TableHead>
            <TableHead>Message Template</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Sent</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {messages.map((message) => (
            <TableRow key={message.id}>
              <TableCell className="font-medium">
                <Link href={`/accounts/${message.accountId}`} className="hover:underline">
                  {message.accountId}
                </Link>
              </TableCell>
              <TableCell>{message.targetUsername}</TableCell>
              <TableCell className="max-w-xs truncate">{message.messageTemplate}</TableCell>
              <TableCell>
                <Badge variant={message.isActive ? "success" : "secondary"}>
                  {message.isActive ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell>{message.lastSent ? new Date(message.lastSent).toLocaleString() : "Never"}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" disabled={processingIds.includes(message.id)}>
                      {processingIds.includes(message.id) ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <MoreHorizontal className="h-4 w-4" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/messages/${message.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(message.id)} className="text-destructive">
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
