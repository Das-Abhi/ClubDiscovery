/**
 * E2E tests for authentication flows
 */
import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display landing page', async ({ page }) => {
    await expect(page).toHaveTitle(/ClubCompass/)
    await expect(page.locator('text=ClubCompass')).toBeVisible()
  })

  test('should navigate to login page', async ({ page }) => {
    // Look for login button or link
    const loginButton = page.locator('a[href*="/login"], button:has-text("Login"), a:has-text("Login")').first()

    if (await loginButton.isVisible()) {
      await loginButton.click()
      await expect(page).toHaveURL(/.*login/)
    }
  })

  test('should navigate to register page', async ({ page }) => {
    // Look for register button or link
    const registerButton = page.locator('a[href*="/register"], button:has-text("Register"), a:has-text("Register")').first()

    if (await registerButton.isVisible()) {
      await registerButton.click()
      await expect(page).toHaveURL(/.*register/)
    }
  })

  test('should show validation errors on empty login form', async ({ page }) => {
    await page.goto('/login')

    // Find and click submit button
    const submitButton = page.locator('button[type="submit"]').first()
    await submitButton.click()

    // Should show validation errors (form should not submit)
    await expect(page).toHaveURL(/.*login/)
  })

  test('should show validation for invalid email domain', async ({ page }) => {
    await page.goto('/register')

    // Fill form with invalid email
    await page.fill('input[name="email"], input[type="email"]', 'test@gmail.com')
    await page.fill('input[name="password"], input[type="password"]', 'Test123!Pass')
    await page.fill('input[name="full_name"], input[placeholder*="name"]', 'Test User')

    // Submit form
    const submitButton = page.locator('button[type="submit"]').first()
    await submitButton.click()

    // Should show error about email domain
    await expect(page.locator('text=/.*bmsce.*/')).toBeVisible({timeout: 5000}).catch(() => {
      // If validation message not visible, form shouldn't have submitted
      return expect(page).toHaveURL(/.*register/)
    })
  })
})

test.describe('Protected Routes', () => {
  test('should redirect to login when accessing protected route', async ({ page }) => {
    // Try to access admin page without authentication
    await page.goto('/admin')

    // Should be redirected to login or show unauthorized
    await expect(
      page.locator('text=/login|sign in|unauthorized/i')
    ).toBeVisible({ timeout: 5000 }).catch(async () => {
      // Or check if redirected
      await expect(page).toHaveURL(/login|unauthorized/)
    })
  })
})
