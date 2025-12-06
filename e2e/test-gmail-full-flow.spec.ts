import { test, expect } from '@playwright/test'

const BASE_URL = 'https://football-gpt-8sbs.vercel.app'

test('Full signup flow with Gmail', async ({ page }) => {
  const testEmail = 'middletonkevin82@googlemail.com'
  const testPassword = 'TestPassword123!'

  console.log('Testing with email:', testEmail)

  // Step 1: Sign up
  await page.goto(`${BASE_URL}/auth/signup`)
  await page.waitForTimeout(2000)

  await page.fill('input[type="email"]', testEmail)
  await page.locator('input[type="password"]').first().fill(testPassword)
  await page.locator('input[type="password"]').nth(1).fill(testPassword)
  await page.click('button[type="submit"]')

  await page.waitForTimeout(5000)

  const bodyText = await page.locator('body').innerText()
  console.log('Result:', bodyText.substring(0, 500))

  // Take screenshot
  await page.screenshot({ path: 'e2e/gmail-signup-result.png', fullPage: true })

  if (bodyText.includes('Check your email')) {
    console.log('SUCCESS: Signup completed, confirmation email sent to', testEmail)
    console.log('Please check your Gmail inbox and click the confirmation link')
  } else if (bodyText.includes('already exists')) {
    console.log('User already exists - please delete from Supabase first')
  } else {
    console.log('Unexpected result')
  }
})
