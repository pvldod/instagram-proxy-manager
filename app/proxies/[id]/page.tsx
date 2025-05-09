import { notFound } from "next/navigation"
import { getProxyById } from "@/lib/proxies"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EditProxyForm } from "@/components/edit-proxy-form"

interface ProxyDetailPageProps {
  params: {
    id: string
  }
}

export default async function ProxyDetailPage({ params }: ProxyDetailPageProps) {
  const proxy = await getProxyById(params.id)

  if (!proxy) {
    notFound()
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Proxy Details</h1>
          <p className="text-muted-foreground">View and edit proxy information</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Proxy Information</CardTitle>
              <CardDescription>Details about this proxy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Address</h3>
                <p className="font-mono">{proxy.address}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Port</h3>
                <p className="font-mono">{proxy.port}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                <Badge variant={proxy.isActive ? "success" : "secondary"}>
                  {proxy.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              {proxy.username && proxy.password && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Authentication</h3>
                  <p className="font-mono">{proxy.username}:•••••••</p>
                </div>
              )}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Connection String</h3>
                <p className="font-mono">
                  {proxy.username && proxy.password
                    ? `${proxy.username}:•••••••@${proxy.address}:${proxy.port}`
                    : `${proxy.address}:${proxy.port}`}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Edit Proxy</CardTitle>
              <CardDescription>Update proxy information</CardDescription>
            </CardHeader>
            <CardContent>
              <EditProxyForm proxy={proxy} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
