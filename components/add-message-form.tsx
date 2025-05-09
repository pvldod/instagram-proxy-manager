"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { addNewMessageConfig, fetchAccounts } from "@/lib/actions"

interface Account {
  id: string
  username: string
}

export function AddMessageForm() {
  const router = useRouter()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(false)
  const [accountsLoading, setAccountsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        setAccountsLoading(true)
        const accountsData = await fetchAccounts(1000)
        setAccounts(accountsData)
      } catch (err) {
        console.error("Failed to load accounts:", err)
      } finally {
        setAccountsLoading(false)
      }
    }

    loadAccounts()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const formData = new FormData(e.target as HTMLFormElement)
      await addNewMessageConfig(formData)
      setSuccess(true)
      setTimeout(() => {
        router.push("/messages")
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add message configuration")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Alert className="bg-green-50 border-green-200">
        <AlertDescription className="text-green-800">
          Message configuration added successfully! Redirecting...
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
            <Label htmlFor="accountId">Instagram Account</Label>
            <Select name="accountId" required>
              <SelectTrigger id="accountId" disabled={accountsLoading}>
                <SelectValue placeholder={accountsLoading ? "Loading accounts..." : "Select an account"} />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">Select the Instagram account that will send the message</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetUsername">Target Username</Label>
            <Input id="targetUsername" name="targetUsername" placeholder="username_to_message" required />
            <p className="text-sm text-muted-foreground">The Instagram username that will receive the message</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="messageTemplate">Message Template</Label>
            <Textarea
              id="messageTemplate"
              name="messageTemplate"
              placeholder="Enter your message here..."
              rows={5}
              required
            />
            <p className="text-sm text-muted-foreground">The message that will be sent automatically after login</p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="isActive" name="isActive" defaultChecked />
            <Label htmlFor="isActive">Active</Label>
          </div>

          <Button type="submit" disabled={loading || accountsLoading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Message Configuration
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
