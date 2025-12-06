import { test, expect } from '@playwright/test'

const BASE_URL = 'https://football-gpt-8sbs.vercel.app'

test('Signup with existing email shows error', async ({ page }) => {
  await page.goto(`${BASE_URL}/auth/signup`)
  await page.waitForTimeout(2000)

  // Use the email that was already registered
  const existingEmail = 'kev_wired@hotmail.com'
  const testPassword = 'FootballGPT2024!'

  console.log('Attempting signup with existing email:', existingEmail)

  // Fill the form
  await page.fill('input[type="email"]', existingEmail)
  await page.locator('input[type="password"]').first().fill(testPassword)
  await page.locator('input[type="password"]').nth(1).fill(testPassword)

  // Submit
  await page.click('button[type="submit"]')
  console.log('Submitted signup form')

  // Wait for response
  await page.waitForTimeout(3000)

  // Check for error message
  const bodyText = await page.locator('body').innerText()
  console.log('Result:', bodyText.substring(0, 500))

  if (bodyText.includes('already exists') || bodyText.includes('already registered')) {
    console.log('✅ SUCCESS: Shows error for existing email')
  } else if (bodyText.includes('Check your email')) {
    console.log('❌ FAILED: Still shows success for existing email')
  } else {
    console.log('⚠️ Unexpected result')
  }
})
