"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import { updateProxy } from "@/lib/actions"

interface Proxy {
  id: string
  address: string
  port: number
  username?: string
  password?: string
  isActive: boolean
}

interface EditProxyFormProps {
  proxy: Proxy
}

export function EditProxyForm({ proxy }: EditProxyFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [hasAuth, setHasAuth] = useState(Boolean(proxy.username && proxy.password))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const formData = new FormData(e.target as HTMLFormElement)
      formData.append("id", proxy.id)

      // If authentication is disabled, remove username and password
      if (!hasAuth) {
        formData.delete("username")
        formData.delete("password")
      }

      await updateProxy(formData)
      setSuccess(true)
      setTimeout(() => {
        router.refresh()
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update proxy")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Alert className="bg-green-50 border-green-200">
        <AlertDescription className="text-green-800">Proxy updated successfully!</AlertDescription>
      </Alert>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="address">Proxy Address</Label>
        <Input id="address" name="address" defaultValue={proxy.address} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="port">Port</Label>
        <Input id="port" name="port" type="number" defaultValue={proxy.port} required />
      </div>

      <div className="flex items-center space-x-2 my-4">
        <Checkbox id="has-auth" checked={hasAuth} onCheckedChange={(checked) => setHasAuth(checked === true)} />
        <Label htmlFor="has-auth">Proxy requires authentication</Label>
      </div>

      {hasAuth && (
        <>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" name="username" defaultValue={proxy.username || ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder={proxy.password ? "••••••••" : "Enter password"}
            />
            {proxy.password && <p className="text-xs text-muted-foreground">Leave blank to keep current password</p>}
          </div>
        </>
      )}

      <div className="flex items-center space-x-2 my-4">
        <Checkbox id="isActive" name="isActive" defaultChecked={proxy.isActive} />
        <Label htmlFor="isActive">Active</Label>
      </div>

      <Button type="submit" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Update Proxy
      </Button>
    </form>
  )
}
