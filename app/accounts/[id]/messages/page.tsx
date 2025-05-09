import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AccountMessagesTable } from "@/components/account-messages-table"
import { fetchMessageConfigsForAccount } from "@/lib/actions"

interface AccountMessagesPageProps {
  params: {
    id: string
  }
}

export default async function AccountMessagesPage({ params }: AccountMessagesPageProps) {
  const accountId = params.id
  const messageConfigs = await fetchMessageConfigsForAccount(accountId)

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Account Messages</h1>
            <p className="text-muted-foreground">Automated messages for this account</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href={`/accounts/${accountId}`}>Back to Account</Link>
            </Button>
            <Button asChild>
              <Link href={`/accounts/${accountId}/messages/add`}>Add Message</Link>
            </Button>
          </div>
        </div>

        {messageConfigs.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Messages Configured</CardTitle>
              <CardDescription>This account doesn't have any automated messages configured yet.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href={`/accounts/${accountId}/messages/add`}>Add Message</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <AccountMessagesTable accountId={accountId} messageConfigs={messageConfigs} />
        )}
      </div>
    </div>
  )
}
