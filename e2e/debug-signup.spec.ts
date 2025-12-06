import { test, expect } from '@playwright/test'

const BASE_URL = 'https://football-gpt-8sbs.vercel.app'

test('Debug signup page with real email format', async ({ page }) => {
  await page.goto(`${BASE_URL}/auth/signup`)
  await page.waitForTimeout(3000)

  // Use a more realistic email format (mailinator for testing)
  const testEmail = `footballgpt_test_${Date.now()}@mailinator.com`
  const testPassword = 'TestPassword123!'

  console.log('Testing with email:', testEmail)

  // Fill the form
  await page.fill('input[type="email"]', testEmail)
  await page.locator('input[type="password"]').first().fill(testPassword)
  await page.locator('input[type="password"]').nth(1).fill(testPassword)

  await page.screenshot({ path: 'debug-signup-filled.png', fullPage: true })

  // Submit
  await page.click('button[type="submit"]')
  console.log('Clicked submit')

  // Wait for response
  await page.waitForTimeout(5000)

  await page.screenshot({ path: 'debug-signup-result.png', fullPage: true })

  // Check current URL and page content
  console.log('URL after submit:', page.url())

  const bodyText = await page.locator('body').innerText()
  console.log('Page text:', bodyText.substring(0, 800))

  // Check for success (redirect or success message)
  if (bodyText.includes('Check your email') || bodyText.includes('confirm')) {
    console.log('✅ SUCCESS: Signup worked - email confirmation required')
  } else if (page.url().includes('/app')) {
    console.log('✅ SUCCESS: Signup worked - redirected to app')
  } else if (bodyText.includes('error') || bodyText.includes('Error') || bodyText.includes('invalid')) {
    console.log('❌ FAILED: Error on page')
  } else {
    console.log('⚠️ UNKNOWN: Check screenshot for details')
  }
})
