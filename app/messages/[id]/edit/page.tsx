import { notFound } from "next/navigation"
import { EditMessageForm } from "@/components/edit-message-form"
import { fetchMessageConfigById } from "@/lib/actions"

interface EditMessagePageProps {
  params: {
    id: string
  }
}

export default async function EditMessagePage({ params }: EditMessagePageProps) {
  const id = Number.parseInt(params.id, 10)

  if (isNaN(id)) {
    notFound()
  }

  const messageConfig = await fetchMessageConfigById(id)

  if (!messageConfig) {
    notFound()
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold">Edit Automated Message</h1>
          <p className="text-muted-foreground">Update message configuration</p>
        </div>

        <EditMessageForm messageConfig={messageConfig} />
      </div>
    </div>
  )
}
