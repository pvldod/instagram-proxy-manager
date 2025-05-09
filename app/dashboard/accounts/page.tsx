import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AccountsTable } from "@/components/accounts-table"
import { PlusCircle } from "lucide-react"

export default function AccountsPage() {
  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Instagram Accounts</h1>
          <Button asChild>
            <Link href="/dashboard/accounts/add" className="flex items-center gap-1">
              <PlusCircle className="h-4 w-4" />
              Add Accounts
            </Link>
          </Button>
        </div>

        <AccountsTable />
      </div>
    </div>
  )
}
