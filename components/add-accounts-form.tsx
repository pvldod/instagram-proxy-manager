"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, FileUp, Loader2 } from "lucide-react"
import { addNewAccount, addBulkAccounts } from "@/lib/actions"

export function AddAccountsForm() {
  const router = useRouter()
  const [bulkText, setBulkText] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const accounts = bulkText
        .split("\n")
        .map((line) => {
          const [username, password, proxy] = line.split(":")
          return { username, password, proxyAddress: proxy }
        })
        .filter((acc) => acc.username && acc.password && acc.proxyAddress)

      if (accounts.length === 0) {
        throw new Error("No valid accounts found. Format should be username:password:proxy")
      }

      await addBulkAccounts(accounts)
      setSuccess(true)
      setBulkText("")
      setTimeout(() => {
        router.push("/accounts")
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add accounts")
    } finally {
      setLoading(false)
    }
  }

  const handleFileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError("Please select a file")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const text = await file.text()
      const accounts = text
        .split("\n")
        .map((line) => {
          const [username, password, proxy] = line.split(":")
          return { username, password, proxyAddress: proxy }
        })
        .filter((acc) => acc.username && acc.password && acc.proxyAddress)

      if (accounts.length === 0) {
        throw new Error("No valid accounts found in file. Format should be username:password:proxy")
      }

      await addBulkAccounts(accounts)
      setSuccess(true)
      setFile(null)
      setTimeout(() => {
        router.push("/accounts")
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add accounts")
    } finally {
      setLoading(false)
    }
  }

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const formData = new FormData(e.target as HTMLFormElement)
      await addNewAccount(formData)
      setSuccess(true)
      setTimeout(() => {
        router.push("/accounts")
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add account")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Alert className="bg-green-50 border-green-200">
        <AlertDescription className="text-green-800">
          Accounts added successfully! Redirecting to accounts page...
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Tabs defaultValue="bulk">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="bulk">Bulk Text</TabsTrigger>
            <TabsTrigger value="file">File Upload</TabsTrigger>
            <TabsTrigger value="single">Single Account</TabsTrigger>
          </TabsList>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <TabsContent value="bulk">
            <form onSubmit={handleBulkSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bulk-accounts">Enter accounts (one per line, format: username:password:proxy)</Label>
                <Textarea
                  id="bulk-accounts"
                  placeholder="username1:password1:proxy1.example.com:8080
username2:password2:proxy2.example.com:8080"
                  rows={10}
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  className="font-mono"
                />
              </div>
              <Button type="submit" disabled={loading || !bulkText.trim()}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Accounts
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="file">
            <form onSubmit={handleFileSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file-upload">Upload a text file (format: username:password:proxy, one per line)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".txt,.csv"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={loading || !file}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              {file && (
                <p className="text-sm text-muted-foreground">
                  Selected file: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </form>
          </TabsContent>

          <TabsContent value="single">
            <form onSubmit={handleSingleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Instagram Username</Label>
                <Input id="username" name="username" placeholder="username" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" placeholder="password" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="proxyAddress">Proxy Address (format: host:port)</Label>
                <Input id="proxyAddress" name="proxyAddress" placeholder="proxy.example.com:8080" required />
              </div>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Account
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
