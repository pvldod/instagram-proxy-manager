import { AddAccountsForm } from "@/components/add-accounts-form"

export default function AddAccountsPage() {
  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold">Add Instagram Accounts</h1>
          <p className="text-muted-foreground">Add up to 5,000 accounts at once</p>
        </div>

        <AddAccountsForm />
      </div>
    </div>
  )
}
