import { test, expect } from '@playwright/test'

test('HR invites employee → first login forces password change → can sign in afterwards', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(`${e.name}: ${e.message}`))

  // unique email per run
  const stamp = Date.now().toString().slice(-7)
  const newEmail = `invitee.${stamp}@techouts.com`

  // ---- 1. Sign in as Super Admin
  await page.context().clearCookies()
  await page.goto('/Auth/SignIn', { waitUntil: 'networkidle' })
  await page.evaluate(() => localStorage.clear())
  await page.goto('/Auth/SignIn', { waitUntil: 'networkidle' })
  await page.getByLabel(/email/i).fill('superadmin@techouts.com')
  await page.getByLabel(/password/i).fill('SuperAdmin@123')
  await page.getByRole('button', { name: /sign in/i }).click()
  await page.waitForTimeout(3000)
  console.log('After admin login URL:', page.url())

  // ---- 2. Open Employee Directory and click Invite Employee
  await page.goto('/Org/EmployeeDirectory', { waitUntil: 'networkidle' })
  await page.waitForTimeout(2500)

  console.log('Buttons on directory page:', await page.locator('button').allTextContents())
  console.log('h1 on directory page:', await page.locator('h1').allTextContents())

  await page.getByRole('button', { name: /Invite Employee/i }).click()
  await page.waitForTimeout(1200)
  console.log('After modal click — dialog count:', await page.locator('[role="dialog"]').count())
  console.log('Inputs in dialog:', await page.locator('[role="dialog"] input').count())

  // Fill and submit
  await page.getByLabel(/^First Name/i).fill('Invitee')
  await page.getByLabel(/^Last Name/i).fill(stamp)
  await page.getByLabel(/^Email/i).fill(newEmail)
  await page.getByLabel(/^Phone/i).fill(`+91987650${stamp.slice(-4)}`)
  await page.getByRole('button', { name: /^Invite$/i }).click()
  await page.waitForTimeout(2500)

  // Pull the temp password out of the success card
  const tempPasswordEl = page.locator('code').first()
  await expect(tempPasswordEl).toBeVisible({ timeout: 5000 })
  const tempPassword = (await tempPasswordEl.textContent())?.trim()
  console.log('Temp password from UI:', tempPassword)
  expect(tempPassword?.length).toBe(8)

  // Close modal
  await page.getByRole('button', { name: /Done/i }).click()

  // ---- 3. Sign out, log in as the new invitee with the temp password
  await page.evaluate(() => localStorage.clear())
  await page.goto('/Auth/SignIn', { waitUntil: 'networkidle' })
  await page.getByLabel(/email/i).fill(newEmail)
  await page.getByLabel(/password/i).fill(tempPassword!)
  await page.getByRole('button', { name: /sign in/i }).click()
  await page.waitForTimeout(2500)

  console.log('After invitee first-login URL:', page.url())
  expect(page.url()).toContain('/Auth/SetPassword')

  // ---- 4. Set the new password
  await page.locator('input[type="password"]').nth(1).fill('Permanent@123') // newPassword
  await page.locator('input[type="password"]').nth(2).fill('Permanent@123') // confirm
  await page.getByRole('button', { name: /Set password/i }).click()
  await page.waitForTimeout(3500)

  console.log('After set-password URL:', page.url())
  expect(page.url()).toContain('/Home')

  // ---- 5. Sign out, log in fresh with the new password — should go to /Home directly
  await page.evaluate(() => localStorage.clear())
  await page.goto('/Auth/SignIn', { waitUntil: 'networkidle' })
  await page.getByLabel(/email/i).fill(newEmail)
  await page.getByLabel(/password/i).fill('Permanent@123')
  await page.getByRole('button', { name: /sign in/i }).click()
  await page.waitForTimeout(2500)

  console.log('Final URL:', page.url())
  expect(page.url()).toContain('/Home')

  console.log('\nPage errors:', errors.length)
  errors.forEach((e) => console.log(' ', e))
})
