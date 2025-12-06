import { test, expect } from '@playwright/test'

const BASE_URL = 'https://football-gpt-8sbs.vercel.app'

test('Full signup flow with email confirmation', async ({ page }) => {
  // Use a unique email for this test
  const timestamp = Date.now()
  const testEmail = `footballgpt_${timestamp}@mailinator.com`
  const testPassword = 'TestPassword123!'

  console.log('Testing with email:', testEmail)

  // Step 1: Sign up
  await page.goto(`${BASE_URL}/auth/signup`)
  await page.waitForTimeout(2000)

  await page.fill('input[type="email"]', testEmail)
  await page.locator('input[type="password"]').first().fill(testPassword)
  await page.locator('input[type="password"]').nth(1).fill(testPassword)
  await page.click('button[type="submit"]')

  await page.waitForTimeout(3000)

  const bodyText = await page.locator('body').innerText()
  if (!bodyText.includes('Check your email')) {
    console.log('Signup failed:', bodyText.substring(0, 500))
    throw new Error('Signup did not succeed')
  }
  console.log('Step 1: Signup successful, email sent')

  // Step 2: Wait for email and get confirmation link from Mailinator
  await page.waitForTimeout(5000) // Wait for email to arrive

  // Go to Mailinator inbox
  const mailboxUrl = `https://www.mailinator.com/v4/public/inboxes.jsp?to=${testEmail.split('@')[0]}`
  console.log('Checking mailbox:', mailboxUrl)

  await page.goto(`https://www.mailinator.com/v4/public/inboxes.jsp?to=${testEmail.split('@')[0]}`)
  await page.waitForTimeout(3000)

  // Take screenshot of inbox
  await page.screenshot({ path: 'e2e/mailinator-inbox.png', fullPage: true })

  // Try to find and click the email
  const emailRow = page.locator('tr.ng-scope').first()
  if (await emailRow.count() > 0) {
    await emailRow.click()
    await page.waitForTimeout(2000)

    // Get the email content
    const emailFrame = page.frameLocator('#html_msg_body')
    const confirmLink = await emailFrame.locator('a[href*="supabase"]').getAttribute('href')

    if (confirmLink) {
      console.log('Found confirmation link:', confirmLink.substring(0, 100))

      // Step 3: Click confirmation link in same browser
      await page.goto(confirmLink)
      await page.waitForTimeout(5000)

      // Take screenshot of result
      await page.screenshot({ path: 'e2e/confirmation-result.png', fullPage: true })

      const resultText = await page.locator('body').innerText()
      console.log('Result after confirmation:', resultText.substring(0, 500))

      // Check if we landed on /app (success) or error page
      if (page.url().includes('/app')) {
        console.log('SUCCESS: User confirmed and redirected to /app')
      } else if (resultText.includes('Error') || resultText.includes('error')) {
        console.log('FAILED: Got error after confirmation')
      } else {
        console.log('Current URL:', page.url())
      }
    } else {
      console.log('Could not find confirmation link in email')
    }
  } else {
    console.log('No emails found in Mailinator inbox')
    await page.screenshot({ path: 'e2e/no-emails.png', fullPage: true })
  }
})
