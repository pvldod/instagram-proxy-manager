'use server'

import { addAccount, addAccounts } from "@/lib/accounts"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function addSingleAccount(formData: FormData) {
  const username = formData.get('username') as string
  const password = formData.get('password') as string
  const proxyAddress = formData.get('proxy') as string

  if (!username || !password || !proxyAddress) {
    // For form validation, we'd ideally use a client-side validation
    // or return a proper response, but for now we'll just redirect with an error
    redirect('/dashboard/accounts/add?error=missing-fields')
  }

  try {
    await addAccount({
      username,
      password,
      proxyAddress
    })

    revalidatePath('/dashboard/accounts')
    redirect('/dashboard/accounts')
  } catch (error) {
    // Redirect with an error param
    redirect('/dashboard/accounts/add?error=failed')
  }
}

export async function addBulkAccounts(formData: FormData) {
  const bulkText = formData.get('bulkAccounts') as string

  if (!bulkText) {
    redirect('/dashboard/accounts/add?error=no-accounts&tab=bulk')
  }

  try {
    const lines = bulkText.split('\n').filter(line => line.trim() !== '')
    const accounts = lines.map(line => {
      const parts = line.split(':')
      
      // Ensure we have at least username, password, and proxy host
      if (parts.length < 3) {
        throw new Error(`Invalid format in line: ${line}`)
      }

      const username = parts[0].trim()
      const password = parts[1].trim()
      
      // Handle different proxy formats
      let proxyAddress
      if (parts.length === 3) {
        // Just host:port
        proxyAddress = parts[2].trim()
      } else if (parts.length >= 5) {
        // host:port:username:password
        proxyAddress = `${parts[2].trim()}:${parts[3].trim()}:${parts[4].trim()}:${parts[5]?.trim() || ''}`
      } else {
        proxyAddress = `${parts[2].trim()}:${parts[3]?.trim() || ''}`
      }

      if (!username || !password || !proxyAddress) {
        throw new Error(`Missing required fields in line: ${line}`)
      }

      return {
        username,
        password,
        proxyAddress
      }
    })

    if (accounts.length === 0) {
      redirect('/dashboard/accounts/add?error=no-valid-accounts&tab=bulk')
    }

    const addedCount = await addAccounts(accounts)

    revalidatePath('/dashboard/accounts')
    redirect('/dashboard/accounts?added=' + addedCount)
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to add accounts'
    // URL encode the error message
    const encodedError = encodeURIComponent(errorMsg)
    redirect(`/dashboard/accounts/add?error=${encodedError}&tab=bulk`)
  }
} 