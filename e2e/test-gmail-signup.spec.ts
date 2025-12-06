import { test, expect } from '@playwright/test'

const BASE_URL = 'https://football-gpt-8sbs.vercel.app'

test('Signup with Gmail address', async ({ page }) => {
  const testEmail = 'middletonkevin82@googlemail.com'
  const testPassword = 'TestPassword123!'

  // Go to signup page
  await page.goto(`${BASE_URL}/auth/signup`)

  await page.waitForTimeout(2000)

  // Fill in the form
  await page.fill('input[type="email"]', testEmail)
  await page.locator('input[type="password"]').first().fill(testPassword)
  await page.locator('input[type="password"]').nth(1).fill(testPassword)

  // Submit
  await page.click('button[type="submit"]')

  // Wait for response
  await page.waitForTimeout(5000)

  // Get the page content to see what happened
  const pageContent = await page.textContent('body')
  console.log('Result:', pageContent)

  // Take screenshot
  await page.screenshot({ path: 'e2e/gmail-signup-result.png', fullPage: true })
})
