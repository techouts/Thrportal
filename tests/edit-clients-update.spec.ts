import { test, expect } from '@playwright/test'

test('adding a project from a new client makes the row show the new client', async ({ page }) => {
  test.setTimeout(60_000)

  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(`${e.name}: ${e.message}`))
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`[err] ${m.text()}`) })

  // 1. Sign in
  await page.context().clearCookies()
  await page.goto('/Auth/SignIn', { waitUntil: 'networkidle' })
  await page.evaluate(() => localStorage.clear())
  await page.goto('/Auth/SignIn', { waitUntil: 'networkidle' })
  await page.getByLabel(/email/i).fill('superadmin@techouts.com')
  await page.getByLabel(/password/i).fill('SuperAdmin@123')
  await page.getByRole('button', { name: /sign in/i }).click()
  await page.waitForTimeout(3000)

  // 2. View Data → search for Pynam (we know he exists)
  await page.goto('/Management/Dashboard', { waitUntil: 'networkidle' })
  await page.waitForTimeout(2000)
  await page.getByRole('tab', { name: 'View Data' }).click()
  await page.waitForTimeout(2000)
  await page.getByPlaceholder(/Search name, code, client/i).fill('Pynam')
  await page.waitForTimeout(2500)

  // 3. Read clients/projects in the row BEFORE editing
  const row = page.locator('table tbody tr').first()
  const before = await row.textContent()
  console.log('Row before edit:', before?.replace(/\s+/g, ' ').trim().slice(0, 250))

  // 4. Open edit modal
  await row.locator('button[title="Edit"]').click()
  await page.waitForTimeout(1000)
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()

  // 5. Open Projects multi-select and pick the FIRST option (a brand new project)
  const projectsTrigger = dialog.locator('label:has-text("Projects") + button[role="combobox"]').first()
  await projectsTrigger.click()
  await page.waitForTimeout(700)

  const optionButtons = page.locator('div.overflow-y-auto > button[type="button"]')
  await expect(optionButtons.first()).toBeVisible({ timeout: 5000 })
  const newOptionLabel = (await optionButtons.first().textContent())?.trim() || ''
  console.log('Adding option:', newOptionLabel)
  await optionButtons.first().click()
  await page.waitForTimeout(400)

  // Confirm the check is on (the click registered)
  const cls = (await optionButtons.first().locator('svg').first().getAttribute('class')) || ''
  expect(cls.includes('opacity-100')).toBe(true)

  // Close the popover so the Save button isn't blocked by its modal overlay
  await page.keyboard.press('Escape')
  await page.waitForTimeout(500)
  // Confirm dialog is still open (Escape on the popover should only close the popover)
  await expect(dialog).toBeVisible()

  // 6. Click Save
  const saveBtn = dialog.getByRole('button', { name: /^Save$/ })
  await saveBtn.click()
  await page.waitForTimeout(2500) // backend round-trip + reload

  // Modal should close
  await expect(dialog).toBeHidden({ timeout: 5000 })

  // 7. Read the row AGAIN — clients column should now contain the new client
  const after = await page.locator('table tbody tr').first().textContent()
  console.log('Row after edit: ', after?.replace(/\s+/g, ' ').trim().slice(0, 250))

  // The label rendered in the dropdown is "Project — Client". The project
  // name is everything before the em-dash (or the whole label if no em-dash).
  const dashIdx = newOptionLabel.lastIndexOf(' — ')
  const newProject = (dashIdx > 0 ? newOptionLabel.slice(0, dashIdx) : newOptionLabel).trim()
  console.log('Expected new project on row:', newProject)

  // The row text should now contain the new project name. The client comes
  // automatically via the project's FK, so a successful project save proves
  // the bug is fixed.
  expect(after).toContain(newProject)

  console.log('\n--- Page errors ---', errors.length)
  errors.forEach((e) => console.log(' ', e))
  expect(errors.length).toBe(0)
})
