import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardStats } from "@/components/dashboard-stats"
import { Users, Shield, MessageCircle, PlusCircle } from "lucide-react"

export default function Dashboard() {
  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col gap-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/dashboard/accounts/add">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Account
              </Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/messages/add">
                <MessageCircle className="mr-2 h-4 w-4" />
                New Message
              </Link>
            </Button>
          </div>
        </div>

        <DashboardStats />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-instagram-pink" />
                <CardTitle>Account Management</CardTitle>
              </div>
              <CardDescription>Add, view, and manage your Instagram accounts</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p>Manage up to 5,000 Instagram accounts with dedicated proxies.</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button asChild className="flex-1">
                  <Link href="/dashboard/accounts">View Accounts</Link>
                </Button>
                <Button asChild variant="outline" className="flex-1">
                  <Link href="/dashboard/accounts/add">Add Accounts</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-instagram-blue" />
                <CardTitle>Proxy Management</CardTitle>
              </div>
              <CardDescription>Manage your HTTP proxies</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p>Configure and manage your proxy settings for each account.</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button asChild className="flex-1">
                  <Link href="/dashboard/proxies">View Proxies</Link>
                </Button>
                <Button asChild variant="outline" className="flex-1">
                  <Link href="/dashboard/proxies/add">Add Proxies</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg md:col-span-2">
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-instagram-purple" />
                <CardTitle>Automated Messaging</CardTitle>
              </div>
              <CardDescription>Configure automated messages to be sent after login</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p>Set up custom messages that will be automatically sent to specific users when your accounts log in.</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button asChild className="flex-1">
                  <Link href="/dashboard/messages">View Messages</Link>
                </Button>
                <Button asChild variant="outline" className="flex-1">
                  <Link href="/dashboard/messages/add">Add Message</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
