import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MessagesTable } from "@/components/messages-table"
import { PlusCircle } from "lucide-react"

export default function MessagesPage() {
  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Automated Messages</h1>
          <Button asChild>
            <Link href="/dashboard/messages/add" className="flex items-center gap-1">
              <PlusCircle className="h-4 w-4" />
              Add Message
            </Link>
          </Button>
        </div>

        <MessagesTable />
      </div>
    </div>
  )
}
