import { test, expect } from '@playwright/test'

test('multi-select toggles selection on click', async ({ page }) => {
  test.setTimeout(60_000)

  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(`${e.name}: ${e.message}`))
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`[console.error] ${m.text()}`)
  })

  // ----- 1. Sign in
  await page.context().clearCookies()
  await page.goto('/Auth/SignIn', { waitUntil: 'networkidle' })
  await page.evaluate(() => localStorage.clear())
  await page.goto('/Auth/SignIn', { waitUntil: 'networkidle' })
  await page.getByLabel(/email/i).fill('superadmin@techouts.com')
  await page.getByLabel(/password/i).fill('SuperAdmin@123')
  await page.getByRole('button', { name: /sign in/i }).click()
  await page.waitForTimeout(3000)

  // ----- 2. View Data tab → first row → Edit
  await page.goto('/Management/Dashboard', { waitUntil: 'networkidle' })
  await page.waitForTimeout(2000)
  await page.getByRole('tab', { name: 'View Data' }).click()
  await page.waitForTimeout(2500)

  const editBtns = page.locator('button[title="Edit"]')
  await expect(editBtns.first()).toBeVisible({ timeout: 10000 })
  await editBtns.first().click()
  await page.waitForTimeout(1000)
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()

  // ----- 3. Open Projects multi-select
  const projectsTrigger = dialog.locator('label:has-text("Projects") + button[role="combobox"]').first()
  await projectsTrigger.click()
  await page.waitForTimeout(800)

  const optionButtons = page.locator('div.overflow-y-auto > button[type="button"]')
  const total = await optionButtons.count()
  expect(total).toBeGreaterThan(0)
  console.log('Option count:', total)

  // ----- 4. Click first option — selection should toggle on
  const firstLabel = (await optionButtons.first().textContent())?.trim()
  await optionButtons.first().click()
  await page.waitForTimeout(400)
  const cls1 = (await optionButtons.first().locator('svg').first().getAttribute('class')) || ''
  const sel1 = cls1.includes('opacity-100')
  console.log(`After clicking "${firstLabel}":   selected=${sel1}`)

  // ----- 5. Click second option — should also be selected (multi-select)
  const secondLabel = (await optionButtons.nth(1).textContent())?.trim()
  await optionButtons.nth(1).click()
  await page.waitForTimeout(400)
  const cls2 = (await optionButtons.nth(1).locator('svg').first().getAttribute('class')) || ''
  const sel2 = cls2.includes('opacity-100')
  console.log(`After clicking "${secondLabel}":   selected=${sel2}`)

  // First should still be selected after the second click (proving it's MULTI not single)
  const cls1Still = (await optionButtons.first().locator('svg').first().getAttribute('class')) || ''
  const sel1Still = cls1Still.includes('opacity-100')
  console.log(`First still selected after second click:  ${sel1Still}`)

  // ----- 6. Click first option again — should DESELECT (toggle off)
  await optionButtons.first().click()
  await page.waitForTimeout(400)
  const cls1Off = (await optionButtons.first().locator('svg').first().getAttribute('class')) || ''
  const sel1Off = cls1Off.includes('opacity-100')
  console.log(`After re-clicking "${firstLabel}":  selected=${sel1Off}  (expected false)`)

  console.log('\n--- Page errors ---', errors.length)
  errors.forEach((e) => console.log(' ', e))

  // The user's complaint was "click does nothing". These four checks pin
  // exactly that bug and confirm multi-select semantics work correctly.
  expect(sel1).toBe(true)         // first click selects
  expect(sel2).toBe(true)         // second click also selects (multi)
  expect(sel1Still).toBe(true)    // first stays selected when second is added
  expect(sel1Off).toBe(false)     // re-clicking deselects
  expect(errors.length).toBe(0)   // no console / page errors
})
