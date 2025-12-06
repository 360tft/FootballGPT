import { test, expect } from '@playwright/test'

const BASE_URL = 'https://football-gpt-8sbs.vercel.app'

test('New signup with fresh email', async ({ page }) => {
  await page.goto(`${BASE_URL}/auth/signup`)
  await page.waitForTimeout(2000)

  // Use a new email
  const newEmail = `footballgpt_${Date.now()}@mailinator.com`
  const testPassword = 'FootballGPT2024!'

  console.log('Signing up with new email:', newEmail)

  // Fill the form
  await page.fill('input[type="email"]', newEmail)
  await page.locator('input[type="password"]').first().fill(testPassword)
  await page.locator('input[type="password"]').nth(1).fill(testPassword)

  // Submit
  await page.click('button[type="submit"]')

  // Wait for response
  await page.waitForTimeout(3000)

  // Check result
  const bodyText = await page.locator('body').innerText()
  console.log('Result:', bodyText.substring(0, 600))

  if (bodyText.includes('spam/junk folder')) {
    console.log('✅ SUCCESS: Shows updated message with spam/junk folder mention')
  } else if (bodyText.includes('Check your email')) {
    console.log('⚠️ PARTIAL: Shows check email but missing spam/junk mention')
  } else {
    console.log('Result page content')
  }
})
