'use server'

import { addAccount, addAccounts } from "@/lib/accounts"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function addSingleAccount(formData: FormData) {
  // Debug log of all form data keys and values
  console.log("Processing form: addSingleAccount");
  console.log("All form fields:", [...formData.entries()].map(([key, value]) => `${key}: ${typeof value === 'string' ? value : 'File'}`));

  // Support for formats with and without prefixes
  let username = formData.get('username') as string;
  let password = formData.get('password') as string;
  let proxyAddress = formData.get('proxy') as string;

  // Check for alternative fields with prefixes (e.g., from other frameworks or data modifications)
  for (const [key, value] of formData.entries()) {
    if (key.endsWith('_username') || key.includes('username')) {
      username = value as string;
    }
    if (key.endsWith('_password') || key.includes('password')) {
      password = value as string;
    }
    if (key.endsWith('_proxy') || key.includes('proxy')) {
      proxyAddress = value as string;
    }
  }

  console.log("Processed data:", { username, password: password ? '***' : undefined, proxyAddress });

  if (!username || !password || !proxyAddress) {
    console.log("Missing required fields:", { hasUsername: !!username, hasPassword: !!password, hasProxy: !!proxyAddress });
    // For form validation, we'd ideally use a client-side validation
    // or return a proper response, but for now we'll just redirect with an error
    redirect('/dashboard/accounts/add?error=missing-fields')
  }

  try {
    console.log("Attempting to add account:", { username, proxyAddress });
    await addAccount({
      username,
      password,
      proxyAddress
    })

    console.log("Account successfully added");
    revalidatePath('/dashboard/accounts')
    redirect('/dashboard/accounts')
  } catch (error) {
    // Detailed error logging
    console.error("Error adding account:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message);
      console.error("Stack trace:", error.stack);
    }
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