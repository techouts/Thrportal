import { test, expect } from '@playwright/test'

test('management dashboard renders real-data dump end-to-end', async ({ page }) => {
  const apiCalls: Array<{ status: number; url: string }> = []
  const pageErrors: string[] = []
  page.on('response', (r) => {
    const u = r.url()
    if (u.includes('/api/management/')) apiCalls.push({ status: r.status(), url: u.replace(/^.*\/api/, '/api') })
  })
  page.on('pageerror', (e) => pageErrors.push(`${e.name}: ${e.message}`))

  await page.context().clearCookies()
  await page.goto('/Auth/SignIn', { waitUntil: 'networkidle' })
  await page.evaluate(() => localStorage.clear())
  await page.goto('/Auth/SignIn', { waitUntil: 'networkidle' })
  await page.getByLabel(/email/i).fill('superadmin@techouts.com')
  await page.getByLabel(/password/i).fill('SuperAdmin@123')
  await page.getByRole('button', { name: /sign in/i }).click()
  await page.waitForTimeout(3000)

  // ---- Dashboard tab
  await page.goto('/Management/Dashboard', { waitUntil: 'networkidle' })
  await page.waitForTimeout(2500)

  const dashCalls = apiCalls.filter((c) => c.url.startsWith('/api/management/dashboard'))
  console.log('Dashboard API calls:', dashCalls)

  const ihclVisible = await page.getByText(/^IHCL$/i).first().isVisible().catch(() => false)
  const indiaVisible = await page.getByText(/^India$/i).first().isVisible().catch(() => false)
  console.log('Top client "IHCL" visible:', ihclVisible)
  console.log('Country "India" visible: ', indiaVisible)

  const titles = await page.locator('[data-slot="card-title"]').allTextContents()
  console.log('Chart cards:', titles)

  // ---- View Data tab
  await page.getByRole('tab', { name: 'View Data' }).click()
  await page.waitForTimeout(2000)

  const tableRows = await page.locator('table tbody tr').count()
  const newRowVisible = await page.getByRole('button', { name: /New row/i }).isVisible().catch(() => false)
  const editVisible = await page.locator('[title="Edit"]').first().isVisible().catch(() => false)
  console.log('Table rows on View Data:', tableRows)
  console.log('"New row" button visible (should be false in read-only):', newRowVisible)
  console.log('Per-row Edit icon visible (should be false):', editVisible)

  const xlsxVisible = await page.getByRole('button', { name: /Export XLSX/i }).isVisible()
  console.log('Export XLSX visible:', xlsxVisible)

  // ---- Filter to "IHCL" and confirm dashboard + table both update
  await page.getByRole('tab', { name: 'Dashboard' }).click()
  await page.waitForTimeout(1000)
  await page.getByRole('combobox').filter({ hasText: /All clients|Client/ }).click()
  await page.waitForTimeout(500)
  await page.getByRole('option', { name: 'IHCL' }).click()
  await page.waitForTimeout(2500)

  const ihclProjects = apiCalls.filter((c) => c.url.includes('client=IHCL'))
  console.log('Filtered API calls (client=IHCL):', ihclProjects.length)

  console.log('\nPage errors:', pageErrors.length)
  pageErrors.forEach((e) => console.log(' ', e))

  expect(dashCalls[dashCalls.length - 1]?.status).toBe(200)
  expect(tableRows).toBeGreaterThan(0)
  expect(newRowVisible).toBe(false)
  expect(editVisible).toBe(false)
  expect(xlsxVisible).toBe(true)
})
