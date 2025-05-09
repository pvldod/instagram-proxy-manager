import { notFound } from "next/navigation"
import { AddAccountMessageForm } from "@/components/add-account-message-form"
import { getAccountById } from "@/lib/accounts"

interface AddAccountMessagePageProps {
  params: {
    id: string
  }
}

export default async function AddAccountMessagePage({ params }: AddAccountMessagePageProps) {
  const accountId = params.id
  const account = await getAccountById(accountId)

  if (!account) {
    notFound()
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold">Add Message for {account.username}</h1>
          <p className="text-muted-foreground">Configure a message to be sent automatically after login</p>
        </div>

        <AddAccountMessageForm accountId={accountId} />
      </div>
    </div>
  )
}
