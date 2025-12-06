import { test, expect } from '@playwright/test'

const BASE_URL = 'https://football-gpt-8sbs.vercel.app'

test('Signup for backend testing', async ({ page }) => {
  const testEmail = 'middletonkevin82@googlemail.com'
  const testPassword = 'Football2024!'

  console.log('Signing up with:')
  console.log('Email:', testEmail)
  console.log('Password:', testPassword)

  // Sign up
  await page.goto(`${BASE_URL}/auth/signup`)
  await page.waitForTimeout(2000)

  await page.fill('input[type="email"]', testEmail)
  await page.locator('input[type="password"]').first().fill(testPassword)
  await page.locator('input[type="password"]').nth(1).fill(testPassword)
  await page.click('button[type="submit"]')

  await page.waitForTimeout(5000)

  const bodyText = await page.locator('body').innerText()

  if (bodyText.includes('Check your email')) {
    console.log('')
    console.log('=== SIGNUP SUCCESSFUL ===')
    console.log('Email:', testEmail)
    console.log('Password:', testPassword)
    console.log('')
    console.log('Please click the confirmation link in your Gmail inbox.')
    console.log('After confirmation, I can login and test the backend.')
  } else {
    console.log('Result:', bodyText.substring(0, 500))
  }
})
