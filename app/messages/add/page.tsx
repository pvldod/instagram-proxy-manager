import { AddMessageForm } from "@/components/add-message-form"

export default function AddMessagePage() {
  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold">Add Automated Message</h1>
          <p className="text-muted-foreground">Configure a message to be sent automatically after login</p>
        </div>

        <AddMessageForm />
      </div>
    </div>
  )
}
