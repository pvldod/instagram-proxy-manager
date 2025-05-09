"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { updateExistingMessageConfig } from "@/lib/actions"

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

interface EditMessageFormProps {
  messageConfig: MessageConfig
}

export function EditMessageForm({ messageConfig }: EditMessageFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const formData = new FormData(e.target as HTMLFormElement)
      formData.append("id", messageConfig.id.toString())

      await updateExistingMessageConfig(formData)
      setSuccess(true)
      setTimeout(() => {
        router.push("/messages")
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update message configuration")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Alert className="bg-green-50 border-green-200">
        <AlertDescription className="text-green-800">
          Message configuration updated successfully! Redirecting...
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label>Account</Label>
            <div className="p-2 border rounded-md bg-muted/50">{messageConfig.accountId}</div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetUsername">Target Username</Label>
            <Input id="targetUsername" name="targetUsername" defaultValue={messageConfig.targetUsername} required />
            <p className="text-sm text-muted-foreground">The Instagram username that will receive the message</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="messageTemplate">Message Template</Label>
            <Textarea
              id="messageTemplate"
              name="messageTemplate"
              defaultValue={messageConfig.messageTemplate}
              rows={5}
              required
            />
            <p className="text-sm text-muted-foreground">The message that will be sent automatically after login</p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="isActive" name="isActive" defaultChecked={messageConfig.isActive} />
            <Label htmlFor="isActive">Active</Label>
          </div>

          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Message Configuration
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
