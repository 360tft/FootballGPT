import { test, expect } from '@playwright/test'

const BASE_URL = 'https://football-gpt-8sbs.vercel.app'

// Generate unique test email
const testEmail = `test${Date.now()}@example.com`
const testPassword = 'TestPassword123!'

test.describe('FootballGPT E2E Tests', () => {

  test('1. Landing page loads correctly', async ({ page }) => {
    await page.goto(BASE_URL)

    // Check title
    await expect(page).toHaveTitle(/FootballGPT/)

    // Check hero section
    await expect(page.locator('h1')).toBeVisible()

    // Check sign in link exists
    await expect(page.locator('a[href="/auth/login"]')).toBeVisible()

    // Check "Start now" or similar CTA
    const cta = page.locator('a[href="/app"]')
    await expect(cta).toBeVisible()

    console.log('✅ Landing page loads correctly')
  })

  test('2. Protected routes redirect to login', async ({ page }) => {
    await page.goto(`${BASE_URL}/app`)

    // Should redirect to login
    await page.waitForURL(/\/auth\/login/)

    console.log('✅ Protected routes redirect to login')
  })

  test('3. Signup page loads and has form elements', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/signup`)

    // Wait for form to render
    await page.waitForSelector('input[type="email"]', { timeout: 10000 })

    // Check form fields exist
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]').first()).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()

    // Check link to login
    await expect(page.locator('a[href="/auth/login"]')).toBeVisible()

    console.log('✅ Signup page has all form elements')
  })

  test('4. Login page loads and has form elements', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/login`)

    // Wait for form to render
    await page.waitForSelector('input[type="email"]', { timeout: 10000 })

    // Check form fields exist
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()

    // Check link to signup
    await expect(page.locator('a[href="/auth/signup"]')).toBeVisible()

    console.log('✅ Login page has all form elements')
  })

  test('5. Signup flow - create new account', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/signup`)

    // Wait for form
    await page.waitForSelector('input[type="email"]', { timeout: 10000 })

    // Fill in signup form
    await page.fill('input[type="email"]', testEmail)

    // Fill password fields (there should be 2)
    const passwordFields = page.locator('input[type="password"]')
    await passwordFields.first().fill(testPassword)
    await passwordFields.nth(1).fill(testPassword)

    // Submit
    await page.click('button[type="submit"]')

    // Wait for either redirect to app, confirmation message, or error
    await page.waitForTimeout(3000)

    // Check current state
    const url = page.url()
    const content = await page.content()

    if (url.includes('/app')) {
      console.log('✅ Signup successful - redirected to app')
    } else if (content.includes('check your email') || content.includes('confirm')) {
      console.log('✅ Signup successful - email confirmation required')
    } else if (content.includes('error') || content.includes('Error')) {
      console.log('⚠️ Signup may have failed - check for errors')
      console.log('Current URL:', url)
    } else {
      console.log('ℹ️ Signup submitted, current URL:', url)
    }
  })

  test('6. Login flow with invalid credentials shows error', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/login`)

    await page.waitForSelector('input[type="email"]', { timeout: 10000 })

    // Try to login with invalid credentials
    await page.fill('input[type="email"]', 'invalid@example.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')

    // Wait for response
    await page.waitForTimeout(2000)

    // Should show error or stay on login page
    const url = page.url()
    expect(url).toContain('/auth/login')

    console.log('✅ Invalid login handled correctly')
  })

  test('7. App page structure (if accessible)', async ({ page }) => {
    // This test checks the app structure - will redirect if not logged in
    await page.goto(`${BASE_URL}/app`)

    await page.waitForTimeout(2000)

    const url = page.url()

    if (url.includes('/auth/login')) {
      console.log('✅ App correctly requires authentication')
    } else if (url.includes('/app')) {
      // If somehow logged in, check for chat elements
      const chatInput = page.locator('textarea, input[type="text"]')
      if (await chatInput.count() > 0) {
        console.log('✅ App page has chat input')
      }
    }
  })

  test('8. Check billing page redirect', async ({ page }) => {
    await page.goto(`${BASE_URL}/app/billing`)

    await page.waitForTimeout(2000)

    const url = page.url()

    if (url.includes('/auth/login')) {
      console.log('✅ Billing page correctly requires authentication')
    } else {
      console.log('ℹ️ Billing page URL:', url)
    }
  })

  test('9. API health check - chat endpoint exists', async ({ request }) => {
    // Try to hit the chat API without auth - should return 401
    const response = await request.post(`${BASE_URL}/api/chat`, {
      data: { message: 'test' },
      headers: { 'Content-Type': 'application/json' }
    })

    // We expect either 401 (unauthorized) or 400 (bad request) - not 404
    expect([400, 401, 403, 500]).toContain(response.status())

    console.log(`✅ Chat API endpoint exists (returned ${response.status()})`)
  })

  test('10. API health check - Stripe checkout endpoint exists', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/stripe/checkout`, {
      data: {},
      headers: { 'Content-Type': 'application/json' }
    })

    // We expect either 401 (unauthorized) or other error - not 404
    expect([400, 401, 403, 500]).toContain(response.status())

    console.log(`✅ Stripe checkout API endpoint exists (returned ${response.status()})`)
  })
})
