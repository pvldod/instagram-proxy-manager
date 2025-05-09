import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, FileUp, User, Plus, AlertCircle, FileText, Upload } from "lucide-react"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { addSingleAccount, addBulkAccounts } from "./actions"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileUpload } from "@/components/ui/file-upload"

// Map error codes to user-friendly messages
const errorMessages: Record<string, string> = {
  'missing-fields': 'All fields are required.',
  'failed': 'Failed to add account. Please try again.',
  'no-accounts': 'No accounts provided.',
  'no-valid-accounts': 'No valid accounts found. Please check the format.',
  'file-error': 'Error processing the CSV file. Please check the format.',
  'no-file': 'No file was uploaded. Please select a CSV file.',
  'invalid-file-type': 'The uploaded file must be a CSV file.',
  'csv-format-error': 'CSV file format is invalid. Please check that it contains the required columns.'
}

export default async function AddAccountPage({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Awaited searchParams
  const params = searchParams;
  const error = typeof params.error === 'string' ? params.error : undefined
  const tab = typeof params.tab === 'string' ? params.tab : 'single'
  
  const errorMessage = error ? errorMessages[error] || error : undefined

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/accounts">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Add Instagram Account</h1>
        </div>

        {errorMessage && (
          <Alert variant="destructive" className="max-w-3xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue={tab} className="max-w-3xl mx-auto w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="single" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>Single Account</span>
            </TabsTrigger>
            <TabsTrigger value="bulk" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Bulk Text</span>
            </TabsTrigger>
            <TabsTrigger value="csv" className="flex items-center gap-2">
              <FileUp className="h-4 w-4" />
              <span>CSV Upload</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="single">
            <Card className="border-0 shadow-lg">
              <form action={addSingleAccount}>
                <CardHeader>
                  <CardTitle>Account Details</CardTitle>
                  <CardDescription>
                    Enter your Instagram account details and associated proxy information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Instagram Username</Label>
                    <Input id="username" name="username" placeholder="username" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Instagram Password</Label>
                    <Input id="password" name="password" type="password" placeholder="********" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="proxy">Proxy Address</Label>
                    <Input 
                      id="proxy" 
                      name="proxy" 
                      placeholder="host:port or host:port:username:password" 
                      required 
                    />
                    <p className="text-sm text-gray-500">
                      Enter your HTTP proxy in the format host:port or host:port:username:password
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button type="button" variant="outline" asChild>
                    <Link href="/dashboard/accounts">Cancel</Link>
                  </Button>
                  <Button type="submit">Add Account</Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          <TabsContent value="bulk">
            <Card className="border-0 shadow-lg">
              <form action={addBulkAccounts}>
                <CardHeader>
                  <CardTitle>Bulk Upload Accounts</CardTitle>
                  <CardDescription>
                    Add multiple Instagram accounts at once by entering them in the format:
                    <code className="block mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded">username:password:proxy</code>
                    One account per line. The proxy format should be host:port or host:port:username:password
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bulkAccounts">Accounts (one per line)</Label>
                    <Textarea 
                      id="bulkAccounts" 
                      name="bulkAccounts"
                      placeholder="username1:password1:proxy1.example.com:8080&#10;username2:password2:proxy2.example.com:8080" 
                      className="font-mono h-64 resize-y"
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button type="button" variant="outline" asChild>
                    <Link href="/dashboard/accounts">Cancel</Link>
                  </Button>
                  <Button type="submit" className="flex items-center gap-1">
                    <Plus className="h-4 w-4" />
                    <span>Add Accounts</span>
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          <TabsContent value="csv">
            <Card className="border-0 shadow-lg">
              <form action="/dashboard/accounts/add/upload" method="post" encType="multipart/form-data">
                <CardHeader>
                  <CardTitle>Upload CSV File</CardTitle>
                  <CardDescription>
                    Upload a CSV file with Instagram accounts. The file should have the following columns:
                    <code className="block mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded">username,password,proxy</code>
                    Each row represents one account. The proxy format can be host:port or host:port:username:password
                    
                    <div className="mt-4 text-sm">
                      <div className="font-semibold">Example CSV format:</div>
                      <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded mt-1 overflow-x-auto">
                        username,password,proxy<br/>
                        user1,pass123,192.168.1.1:8080<br/>
                        user2,pass456,proxy.example.com:8080:proxyuser:proxypass<br/>
                      </pre>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FileUpload 
                    id="csvFile"
                    name="csvFile"
                    accept=".csv"
                    required
                    helpText="The first row should be the header row with column names: username, password, proxy"
                  />
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button type="button" variant="outline" asChild>
                    <Link href="/dashboard/accounts">Cancel</Link>
                  </Button>
                  <Button type="submit" className="flex items-center gap-1">
                    <Upload className="h-4 w-4" />
                    <span>Upload File</span>
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 