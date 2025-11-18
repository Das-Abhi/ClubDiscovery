/**
 * E2E tests for admin panel
 * NOTE: These tests require admin authentication
 */
import { test, expect } from '@playwright/test'

test.describe('Admin Panel', () => {
  // These tests assume you have an admin user created
  // You may need to modify authentication based on your implementation

  test.skip('should access admin dashboard with admin credentials', async ({ page }) => {
    // Login as admin first
    await page.goto('/login')

    await page.fill('input[name="email"]', 'admin@bmsce.ac.in')
    await page.fill('input[name="password"]', 'AdminPass123!')
    await page.click('button[type="submit"]')

    // Navigate to admin dashboard
    await page.goto('/admin')

    // Should see admin dashboard
    await expect(page.locator('text=/admin.*dashboard/i')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('text=/total.*users|statistics/i')).toBeVisible()
  })

  test.skip('should display dashboard statistics', async ({ page }) => {
    // Assumes already logged in as admin
    await page.goto('/admin')

    // Should show statistics cards
    await expect(page.locator('text=/total.*users/i')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('text=/total.*clubs/i')).toBeVisible()
    await expect(page.locator('text=/memberships|assessments/i')).toBeVisible()
  })

  test.skip('should navigate to user management', async ({ page }) => {
    await page.goto('/admin')

    // Click on user management link/button
    const userMgmtLink = page.locator('a[href*="/admin/users"], button:has-text("Manage Users"), a:has-text("Users")').first()

    await userMgmtLink.click()

    // Should navigate to users page
    await expect(page).toHaveURL(/\/admin\/users/)
    await expect(page.locator('text=/user.*management/i')).toBeVisible()
  })

  test.skip('should navigate to club management', async ({ page }) => {
    await page.goto('/admin')

    // Click on club management link/button
    const clubMgmtLink = page.locator('a[href*="/admin/clubs"], button:has-text("Manage Clubs"), a:has-text("Clubs")').first()

    await clubMgmtLink.click()

    // Should navigate to clubs page
    await expect(page).toHaveURL(/\/admin\/clubs/)
    await expect(page.locator('text=/club.*management/i')).toBeVisible()
  })

  test.skip('should search and filter users', async ({ page }) => {
    await page.goto('/admin/users')

    // Wait for users to load
    await page.waitForLoadState('networkidle')

    // Search for a user
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first()
    await searchInput.fill('test')
    await page.waitForTimeout(1000)

    // Filter by role
    const roleFilter = page.locator('select').filter({ hasText: /role|admin|user/i }).first()
    if (await roleFilter.isVisible()) {
      await roleFilter.selectOption('admin')
      await page.waitForTimeout(1000)
    }
  })

  test.skip('should toggle club featured status', async ({ page }) => {
    await page.goto('/admin/clubs')

    // Wait for clubs to load
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Find the first featured toggle button (star icon)
    const toggleButton = page.locator('button[title*="featured" i], button:has(svg.lucide-star)').first()

    if (await toggleButton.isVisible()) {
      await toggleButton.click()

      // Should show success indication or update the UI
      await page.waitForTimeout(1000)
    }
  })

  test.skip('should open club creation modal', async ({ page }) => {
    await page.goto('/admin/clubs')

    // Click create club button
    const createButton = page.locator('button:has-text("Create"), button:has-text("Add Club"), button:has-text("New Club")').first()

    if (await createButton.isVisible()) {
      await createButton.click()

      // Should open modal
      await expect(page.locator('text=/create.*club|new.*club/i')).toBeVisible({ timeout: 5000 })
    }
  })
})

test.describe('Admin Access Control', () => {
  test('should deny access to non-admin users', async ({ page }) => {
    // Try to access admin without being logged in as admin
    await page.goto('/admin')

    // Should be redirected or show unauthorized message
    await page.waitForLoadState('networkidle')

    const url = page.url()
    const hasUnauthorized = await page.locator('text=/unauthorized|forbidden|access.*denied/i').isVisible().catch(() => false)

    expect(
      url.includes('login') ||
      url.includes('unauthorized') ||
      hasUnauthorized ||
      !url.includes('/admin')
    ).toBeTruthy()
  })
})
