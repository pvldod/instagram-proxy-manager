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
import { addNewProxy, addBulkProxies } from "@/lib/actions"
import { Checkbox } from "@/components/ui/checkbox"

export function AddProxiesForm() {
  const router = useRouter()
  const [bulkText, setBulkText] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [hasAuth, setHasAuth] = useState(false)

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const proxies = bulkText
        .split("\n")
        .map((line) => {
          // Handle different formats:
          // 1. host:port
          // 2. username:password@host:port

          if (line.includes("@")) {
            // Format: username:password@host:port
            const [auth, hostPort] = line.split("@")
            const [username, password] = auth.split(":")
            const [address, portStr] = hostPort.split(":")
            const port = Number.parseInt(portStr, 10)

            if (!address || isNaN(port)) return null

            return { address, port, username, password }
          } else {
            // Format: host:port
            const [address, portStr] = line.split(":")
            const port = Number.parseInt(portStr, 10)

            if (!address || isNaN(port)) return null

            return { address, port }
          }
        })
        .filter(Boolean) as { address: string; port: number; username?: string; password?: string }[]

      if (proxies.length === 0) {
        throw new Error("No valid proxies found. Format should be host:port or username:password@host:port")
      }

      await addBulkProxies(proxies)
      setSuccess(true)
      setBulkText("")
      setTimeout(() => {
        router.push("/proxies")
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add proxies")
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
      const proxies = text
        .split("\n")
        .map((line) => {
          // Handle different formats:
          // 1. host:port
          // 2. username:password@host:port

          if (line.includes("@")) {
            // Format: username:password@host:port
            const [auth, hostPort] = line.split("@")
            const [username, password] = auth.split(":")
            const [address, portStr] = hostPort.split(":")
            const port = Number.parseInt(portStr, 10)

            if (!address || isNaN(port)) return null

            return { address, port, username, password }
          } else {
            // Format: host:port
            const [address, portStr] = line.split(":")
            const port = Number.parseInt(portStr, 10)

            if (!address || isNaN(port)) return null

            return { address, port }
          }
        })
        .filter(Boolean) as { address: string; port: number; username?: string; password?: string }[]

      if (proxies.length === 0) {
        throw new Error("No valid proxies found in file. Format should be host:port or username:password@host:port")
      }

      await addBulkProxies(proxies)
      setSuccess(true)
      setFile(null)
      setTimeout(() => {
        router.push("/proxies")
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add proxies")
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
      await addNewProxy(formData)
      setSuccess(true)
      setTimeout(() => {
        router.push("/proxies")
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add proxy")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Alert className="bg-green-50 border-green-200">
        <AlertDescription className="text-green-800">
          Proxies added successfully! Redirecting to proxies page...
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
            <TabsTrigger value="single">Single Proxy</TabsTrigger>
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
                <Label htmlFor="bulk-proxies">
                  Enter proxies (one per line, format: host:port or username:password@host:port)
                </Label>
                <Textarea
                  id="bulk-proxies"
                  placeholder="proxy1.example.com:8080
username:password@proxy2.example.com:8080
192.168.1.100:3128"
                  rows={10}
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  className="font-mono"
                />
              </div>
              <Button type="submit" disabled={loading || !bulkText.trim()}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Proxies
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="file">
            <form onSubmit={handleFileSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file-upload">
                  Upload a text file (format: host:port or username:password@host:port, one per line)
                </Label>
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
                <Label htmlFor="address">Proxy Address</Label>
                <Input id="address" name="address" placeholder="proxy.example.com or 192.168.1.100" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="port">Port</Label>
                <Input id="port" name="port" type="number" placeholder="8080" required />
              </div>
              <div className="flex items-center space-x-2 my-4">
                <Checkbox id="has-auth" checked={hasAuth} onCheckedChange={(checked) => setHasAuth(checked === true)} />
                <Label htmlFor="has-auth">Proxy requires authentication</Label>
              </div>
              {hasAuth && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" name="username" placeholder="proxy_username" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" name="password" type="password" placeholder="proxy_password" />
                  </div>
                </>
              )}
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Proxy
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
