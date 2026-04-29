import { test, expect } from '@playwright/test'

test('backend-mode login as superadmin@techouts.com', async ({ page }) => {
  const consoleMsgs: string[] = []
  const pageErrors: string[] = []
  const networkFails: string[] = []
  const apiRequests: string[] = []

  page.on('console', m => consoleMsgs.push(`[${m.type()}] ${m.text()}`))
  page.on('pageerror', e => pageErrors.push(`${e.name}: ${e.message}`))
  page.on('requestfailed', r => networkFails.push(`${r.method()} ${r.url()} — ${r.failure()?.errorText}`))
  page.on('response', async r => {
    const url = r.url()
    if (url.includes('/api/auth/')) {
      apiRequests.push(`${r.status()} ${r.request().method()} ${url}`)
    }
    if (r.status() >= 400 && !url.includes('/@react-refresh')) {
      networkFails.push(`${r.status()} ${r.request().method()} ${url}`)
    }
  })

  await page.goto('/Auth/SignIn', { waitUntil: 'networkidle' })
  console.log('--- URL after load:', page.url())
  console.log('--- Title:', await page.title())

  await page.getByLabel(/email/i).fill('superadmin@techouts.com')
  await page.getByLabel(/password/i).fill('SuperAdmin@123')
  await page.getByRole('button', { name: /sign in/i }).click()

  // Wait up to 10s for either nav to /Home or an error toast
  await page.waitForTimeout(5000)

  console.log('--- URL after submit:', page.url())
  console.log('--- localStorage backend_user:', await page.evaluate(() => localStorage.getItem('backend_user')))
  console.log('--- localStorage access_token (first 30):', await page.evaluate(() => (localStorage.getItem('backend_access_token') || '').slice(0, 30)))

  const toast = await page.locator('[data-sonner-toast] [data-title], [data-sonner-toast] [data-description], .sonner-toast')
    .allTextContents()
    .catch(() => [] as string[])
  console.log('--- Toasts:', toast)

  console.log('\n=== API REQUESTS ===')
  apiRequests.forEach(m => console.log(m))
  console.log('\n=== NETWORK FAILURES ===')
  networkFails.forEach(m => console.log(m))
  console.log('\n=== PAGE ERRORS ===')
  pageErrors.forEach(m => console.log(m))
  console.log('\n=== CONSOLE (filtered) ===')
  consoleMsgs.filter(m => /\[AUTH\]|auth|ERROR|error/i.test(m)).forEach(m => console.log(m))
})
