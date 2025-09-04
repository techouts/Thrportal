import { test, expect } from '@playwright/test'

const routes = [
  { path: '/', name: 'Home' },
  { path: '/Portal/Dashboard', name: 'Portal Dashboard' },
  { path: '/Me/Dashboard', name: 'My Dashboard' },
  { path: '/Me/Profile', name: 'My Profile' },
  { path: '/Me/Attendance', name: 'My Attendance' },
  { path: '/Me/Leave', name: 'My Leave' },
  { path: '/MyTeam/Dashboard', name: 'Team Dashboard' },
  { path: '/Hiring/Dashboard', name: 'Hiring Dashboard' },
  { path: '/Project/Dashboard', name: 'Project Dashboard' },
  { path: '/Org/EmployeeDirectory', name: 'Employee Directory' },
  { path: '/HR/Performance', name: 'HR Performance' },
  { path: '/Management/Dashboard', name: 'Management Dashboard' },
  { path: '/Reports/Mine', name: 'My Reports' },
  { path: '/Admin/Tenant', name: 'Admin Tenant' }
]

test.describe('T-HR Navigation Smoke Tests', () => {
  routes.forEach(({ path, name }) => {
    test(`should load ${name} (${path})`, async ({ page }) => {
      await page.goto(path)
      
      // Wait for page to load
      await page.waitForLoadState('networkidle')
      
      // Check that we're not on an error page
      await expect(page.locator('text=Error')).not.toBeVisible()
      await expect(page.locator('text=404')).not.toBeVisible()
      
      // Check that sidebar is present (indicates app loaded correctly)
      await expect(page.locator('[data-test-id="sidebar"]')).toBeVisible()
      
      // Check for main content area
      await expect(page.locator('main')).toBeVisible()
    })
  })

  test('should navigate between main sections', async ({ page }) => {
    await page.goto('/')
    
    // Test sidebar navigation
    const sidebarItems = [
      'Portal',
      'Me', 
      'MyTeam',
      'Hiring',
      'Projects',
      'Org',
      'HR',
      'Management',
      'Reports',
      'Admin'
    ]
    
    for (const item of sidebarItems) {
      // Click sidebar section to expand if collapsed
      await page.locator(`text=${item}`).first().click()
      
      // Wait for any animations
      await page.waitForTimeout(500)
      
      // Verify section is accessible (no immediate errors)
      await expect(page.locator('main')).toBeVisible()
    }
  })

  test('should have working search functionality', async ({ page }) => {
    await page.goto('/')
    
    // Check if search input exists
    const searchInput = page.locator('input[placeholder*="Search"]')
    if (await searchInput.isVisible()) {
      await searchInput.fill('test search')
      await page.keyboard.press('Enter')
      
      // Should not crash the app
      await expect(page.locator('main')).toBeVisible()
    }
  })

  test('should handle data table interactions', async ({ page }) => {
    // Test on a page likely to have a data table
    await page.goto('/Org/EmployeeDirectory')
    
    // Wait for potential data loading
    await page.waitForTimeout(2000)
    
    // Look for data table elements
    const dataTable = page.locator('[data-test-id*="data-table"]')
    
    if (await dataTable.isVisible()) {
      // Test search if present
      const searchInput = dataTable.locator('input[placeholder*="Search"]')
      if (await searchInput.isVisible()) {
        await searchInput.fill('test')
      }
      
      // Test pagination if present
      const nextButton = page.locator('button', { hasText: 'Next' })
      if (await nextButton.isVisible() && await nextButton.isEnabled()) {
        await nextButton.click()
      }
    }
    
    // Should not crash
    await expect(page.locator('main')).toBeVisible()
  })

  test('should handle mobile responsive layout', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    // Should still render properly
    await expect(page.locator('main')).toBeVisible()
    
    // Sidebar might be collapsed on mobile
    const sidebarTrigger = page.locator('button[aria-label*="toggle"]')
    if (await sidebarTrigger.isVisible()) {
      await sidebarTrigger.click()
      await page.waitForTimeout(500)
    }
  })

  test('should handle role-based access', async ({ page }) => {
    await page.goto('/Admin/Tenant')
    
    // Should either show content or appropriate access denied message
    // This will depend on the mock user role
    await expect(page.locator('main')).toBeVisible()
    
    // The page should load without JavaScript errors
    const errors = []
    page.on('pageerror', error => errors.push(error))
    
    await page.waitForTimeout(1000)
    expect(errors).toHaveLength(0)
  })
})