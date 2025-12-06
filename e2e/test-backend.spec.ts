import { test, expect } from '@playwright/test'

const BASE_URL = 'https://football-gpt-8sbs.vercel.app'
const TEST_EMAIL = 'middletonkevin82@googlemail.com'
const TEST_PASSWORD = 'Football2024!'

test('Login and test backend functionality', async ({ page }) => {
  console.log('=== BACKEND TEST ===')
  console.log('Logging in as:', TEST_EMAIL)

  // Step 1: Login
  await page.goto(`${BASE_URL}/auth/login`)
  await page.waitForTimeout(2000)

  // Click on Sign in tab
  await page.click('text=Sign in')
  await page.waitForTimeout(500)

  // Fill login form
  await page.fill('input[type="email"]', TEST_EMAIL)
  await page.fill('input[type="password"]', TEST_PASSWORD)
  await page.click('button[type="submit"]')

  console.log('Submitted login form...')

  // Wait for redirect to /app
  await page.waitForTimeout(5000)

  // Check if we're logged in
  const currentUrl = page.url()
  console.log('Current URL:', currentUrl)

  if (currentUrl.includes('/app')) {
    console.log('✅ LOGIN SUCCESSFUL - Redirected to /app')
  } else {
    const bodyText = await page.locator('body').innerText()
    console.log('Page content:', bodyText.substring(0, 500))
    throw new Error('Login failed - not redirected to /app')
  }

  // Take screenshot of dashboard
  await page.screenshot({ path: 'e2e/dashboard.png', fullPage: true })
  console.log('📸 Screenshot saved: e2e/dashboard.png')

  // Step 2: Explore the dashboard
  const dashboardContent = await page.locator('body').innerText()
  console.log('\n=== DASHBOARD CONTENT ===')
  console.log(dashboardContent.substring(0, 1000))

  // Step 3: Try to access the chat feature
  console.log('\n=== TESTING CHAT FEATURE ===')

  // Look for chat link or button
  const chatLink = page.locator('a:has-text("Chat"), button:has-text("Chat")')
  if (await chatLink.count() > 0) {
    await chatLink.first().click()
    await page.waitForTimeout(2000)
    console.log('Clicked on Chat')
    console.log('Current URL:', page.url())

    await page.screenshot({ path: 'e2e/chat-page.png', fullPage: true })
    console.log('📸 Screenshot saved: e2e/chat-page.png')

    const chatContent = await page.locator('body').innerText()
    console.log('Chat page content:', chatContent.substring(0, 500))
  } else {
    console.log('No Chat link found on dashboard')
  }

  // Step 4: Check billing/subscription
  console.log('\n=== TESTING BILLING ===')

  const billingLink = page.locator('a:has-text("Billing"), button:has-text("Billing"), a:has-text("Manage billing")')
  if (await billingLink.count() > 0) {
    await billingLink.first().click()
    await page.waitForTimeout(2000)
    console.log('Clicked on Billing')
    console.log('Current URL:', page.url())

    await page.screenshot({ path: 'e2e/billing-page.png', fullPage: true })
    console.log('📸 Screenshot saved: e2e/billing-page.png')
  } else {
    console.log('No Billing link found')
  }

  // Step 5: Test sign out
  console.log('\n=== TESTING SIGN OUT ===')

  await page.goto(`${BASE_URL}/app`)
  await page.waitForTimeout(2000)

  const signOutButton = page.locator('button:has-text("Sign out"), a:has-text("Sign out")')
  if (await signOutButton.count() > 0) {
    await signOutButton.first().click()
    await page.waitForTimeout(3000)
    console.log('Clicked Sign out')
    console.log('Current URL after signout:', page.url())

    if (page.url().includes('/auth')) {
      console.log('✅ SIGN OUT SUCCESSFUL - Redirected to auth page')
    }
  } else {
    console.log('No Sign out button found')
  }

  console.log('\n=== BACKEND TEST COMPLETE ===')
})
