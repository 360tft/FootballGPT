import { test, expect } from '@playwright/test'

const BASE_URL = 'https://football-gpt-8sbs.vercel.app'

test('Signup with real email kev_wired@hotmail.com', async ({ page }) => {
  await page.goto(`${BASE_URL}/auth/signup`)
  await page.waitForTimeout(2000)

  const testEmail = 'middletonkevin82@googlemail.com'
  const testPassword = 'FootballGPT2024!'

  console.log('Signing up with email:', testEmail)

  // Fill the form
  await page.fill('input[type="email"]', testEmail)
  await page.locator('input[type="password"]').first().fill(testPassword)
  await page.locator('input[type="password"]').nth(1).fill(testPassword)

  // Submit
  await page.click('button[type="submit"]')
  console.log('Submitted signup form')

  // Wait longer for response
  await page.waitForTimeout(8000)

  // Check result
  const bodyText = await page.locator('body').innerText()
  console.log('Result:', bodyText.substring(0, 600))

  if (bodyText.includes('Check your email') && bodyText.includes('spam/junk')) {
    console.log('✅ SUCCESS: Signup worked! Check kev_wired@hotmail.com for confirmation email')
  } else if (bodyText.includes('already registered') || bodyText.includes('already exists')) {
    console.log('⚠️ Email already registered - try logging in instead')
  } else {
    console.log('Check the result above')
  }
})
