import { test, expect } from '@playwright/test'

const BASE_URL = 'https://football-gpt-8sbs.vercel.app'

test('Debug signup page', async ({ page }) => {
  // Take screenshot at each step
  await page.goto(`${BASE_URL}/auth/signup`)
  await page.waitForTimeout(3000)

  // Take screenshot
  await page.screenshot({ path: 'debug-signup-1-loaded.png', fullPage: true })

  // Log what we see
  const pageContent = await page.content()
  console.log('Page URL:', page.url())

  // Check for any error messages already on page
  const errorText = await page.locator('.text-red-500, .text-red-600, .error, [role="alert"]').allTextContents()
  if (errorText.length > 0) {
    console.log('Errors on page:', errorText)
  }

  // Check what form elements exist
  const emailInputs = await page.locator('input[type="email"]').count()
  const passwordInputs = await page.locator('input[type="password"]').count()
  const submitButtons = await page.locator('button[type="submit"]').count()

  console.log(`Form elements found: ${emailInputs} email, ${passwordInputs} password, ${submitButtons} submit`)

  // Try to fill the form
  if (emailInputs > 0) {
    await page.fill('input[type="email"]', `debug${Date.now()}@test.com`)
    console.log('Filled email')
  }

  if (passwordInputs >= 1) {
    await page.locator('input[type="password"]').first().fill('TestPassword123!')
    console.log('Filled first password')
  }

  if (passwordInputs >= 2) {
    await page.locator('input[type="password"]').nth(1).fill('TestPassword123!')
    console.log('Filled confirm password')
  }

  await page.screenshot({ path: 'debug-signup-2-filled.png', fullPage: true })

  // Try to submit
  if (submitButtons > 0) {
    await page.click('button[type="submit"]')
    console.log('Clicked submit')

    // Wait for response
    await page.waitForTimeout(5000)

    await page.screenshot({ path: 'debug-signup-3-after-submit.png', fullPage: true })

    // Check current URL
    console.log('URL after submit:', page.url())

    // Check for any errors
    const errorsAfter = await page.locator('.text-red-500, .text-red-600, .error, [role="alert"]').allTextContents()
    if (errorsAfter.length > 0) {
      console.log('Errors after submit:', errorsAfter)
    }

    // Check for success messages
    const successText = await page.locator('.text-green-500, .text-green-600, .success').allTextContents()
    if (successText.length > 0) {
      console.log('Success messages:', successText)
    }

    // Log visible text
    const bodyText = await page.locator('body').innerText()
    console.log('Page text (first 500 chars):', bodyText.substring(0, 500))
  }
})
