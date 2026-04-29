import { test } from '@playwright/test'

test('debug — what does the management page render?', async ({ page }) => {
  const errs: string[] = []
  const calls: string[] = []
  page.on('pageerror', (e) => errs.push(`${e.name}: ${e.message}`))
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') errs.push(`[${m.type()}] ${m.text()}`)
  })
  page.on('response', (r) => {
    const u = r.url()
    if (u.includes('/api/')) calls.push(`${r.status()} ${r.request().method()} ${u.replace(/^.*\/api/, '/api')}`)
  })

  await page.context().clearCookies()
  await page.goto('/Auth/SignIn', { waitUntil: 'networkidle' })
  await page.evaluate(() => localStorage.clear())
  await page.goto('/Auth/SignIn', { waitUntil: 'networkidle' })
  await page.getByLabel(/email/i).fill('superadmin@techouts.com')
  await page.getByLabel(/password/i).fill('SuperAdmin@123')
  await page.getByRole('button', { name: /sign in/i }).click()
  await page.waitForTimeout(3500)

  console.log('--- after login ---')
  console.log('URL:', page.url())
  console.log('localStorage role:', await page.evaluate(() => {
    try { return JSON.parse(localStorage.getItem('backend_user') || 'null')?.role } catch { return null }
  }))

  await page.goto('/Management/Dashboard', { waitUntil: 'networkidle' })
  await page.waitForTimeout(4500)  // give recharts time

  console.log('--- on management ---')
  console.log('URL:', page.url())
  console.log('Visible h1/h2 text:', await page.locator('h1, h2').allTextContents())
  console.log('All tabs:', await page.locator('[role="tab"]').allTextContents())
  console.log('Card titles (any):', await page.locator('div').filter({ hasText: /^(Top 10 Customers|Employees by Country|Employees by Department|Billable vs|Non-Billable Breakdown|Project Engagement)$/ }).allTextContents())
  console.log('All cards count:', await page.locator('[class*="rounded"]').count())
  console.log('SVGs on page:', await page.locator('svg').count())
  console.log('Tables on page:', await page.locator('table').count())
  console.log('Body innerText length:', (await page.locator('body').innerText()).length)
  console.log('Body innerText sample:', (await page.locator('body').innerText()).slice(0, 600))

  console.log('\n--- API calls ---')
  calls.forEach((c) => console.log(' ', c))
  console.log('\n--- Errors ---')
  errs.forEach((e) => console.log(' ', e))
})
