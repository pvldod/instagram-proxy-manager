import { AddProxiesForm } from "@/components/add-proxies-form"

export default function AddProxiesPage() {
  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold">Add HTTP Proxies</h1>
          <p className="text-muted-foreground">Add proxies for your Instagram accounts</p>
        </div>

        <AddProxiesForm />
      </div>
    </div>
  )
}
