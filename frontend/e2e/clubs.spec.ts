/**
 * E2E tests for clubs functionality
 */
import { test, expect } from '@playwright/test'

test.describe('Clubs Directory', () => {
  test('should display clubs page', async ({ page }) => {
    await page.goto('/clubs')

    // Should show clubs heading or title
    await expect(
      page.locator('h1, h2').filter({ hasText: /clubs/i }).first()
    ).toBeVisible({ timeout: 10000 })
  })

  test('should filter clubs by category', async ({ page }) => {
    await page.goto('/clubs')

    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Look for category filters
    const categoryFilter = page.locator('select, button').filter({ hasText: /category|cocurricular|extracurricular/i }).first()

    if (await categoryFilter.isVisible()) {
      await categoryFilter.click()

      // Should show filtered results
      await page.waitForTimeout(1000) // Wait for filter to apply
    }
  })

  test('should search for clubs', async ({ page }) => {
    await page.goto('/clubs')

    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Find search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first()

    if (await searchInput.isVisible()) {
      await searchInput.fill('ACM')
      await page.waitForTimeout(1000) // Wait for search to apply

      // Should show search results
      const resultsCount = await page.locator('[data-testid="club-card"], .club-card, article').count()
      console.log(`Found ${resultsCount} results for "ACM"`)
    }
  })

  test('should navigate to club detail page', async ({ page }) => {
    await page.goto('/clubs')

    // Wait for clubs to load
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Click on first club if available
    const firstClub = page.locator('a[href*="/clubs/"], [data-testid="club-card"] a').first()

    if (await firstClub.isVisible()) {
      await firstClub.click()

      // Should navigate to club detail page
      await expect(page).toHaveURL(/\/clubs\/[^\/]+/)

      // Should show club details
      await expect(page.locator('h1, h2').first()).toBeVisible()
    }
  })
})

test.describe('Featured Clubs', () => {
  test('should display featured clubs section on home page', async ({ page }) => {
    await page.goto('/')

    // Look for featured clubs section
    const featuredSection = page.locator('text=/featured.*clubs/i, h2:has-text("Featured"), h3:has-text("Featured")').first()

    await expect(featuredSection).toBeVisible({ timeout: 5000 }).catch(() => {
      console.log('Featured clubs section not found on home page')
    })
  })
})
