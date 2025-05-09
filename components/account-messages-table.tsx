"use client"

import Link from "next/link"
import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, RefreshCw, Edit, Trash2 } from "lucide-react"
import { removeMessageConfig } from "@/lib/actions"

interface MessageConfig {
  id: number
  accountId: string
  targetUsername: string
  messageTemplate: string
  isActive: boolean
  lastSent: string | null
  createdAt: string
  updatedAt: string
}

interface AccountMessagesTableProps {
  accountId: string
  messageConfigs: MessageConfig[]
}

export function AccountMessagesTable({ accountId, messageConfigs: initialConfigs = [] }: AccountMessagesTableProps) {
  const [messageConfigs, setMessageConfigs] = useState<MessageConfig[]>(initialConfigs || [])
  const [processingIds, setProcessingIds] = useState<number[]>([])

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this message configuration?")) {
      try {
        setProcessingIds((prev) => [...prev, id])
        await removeMessageConfig(id)
        setMessageConfigs((prev) => prev.filter((config) => config.id !== id))
      } catch (error) {
        console.error(`Failed to delete message config ${id}:`, error)
      } finally {
        setProcessingIds((prev) => prev.filter((pid) => pid !== id))
      }
    }
  }

  if (!messageConfigs || messageConfigs.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No message configurations found</p>
          <Button asChild>
            <Link href={`/accounts/${accountId}/messages/add`}>Add Message</Link>
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
            <TableHead>Target Username</TableHead>
            <TableHead>Message Template</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Sent</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {messageConfigs.map((config) => (
            <TableRow key={config.id}>
              <TableCell className="font-medium">{config.targetUsername}</TableCell>
              <TableCell className="max-w-xs truncate">{config.messageTemplate}</TableCell>
              <TableCell>
                <Badge variant={config.isActive ? "success" : "secondary"}>
                  {config.isActive ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell>{config.lastSent ? new Date(config.lastSent).toLocaleString() : "Never"}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" disabled={processingIds.includes(config.id)}>
                      {processingIds.includes(config.id) ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <MoreHorizontal className="h-4 w-4" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/messages/${config.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(config.id)} className="text-destructive">
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
