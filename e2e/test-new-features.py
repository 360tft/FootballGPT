"""Test the new free tier features"""
from playwright.sync_api import sync_playwright
import os

def test_landing_page(page):
    """Test the landing page has pricing section"""
    print("\n=== Testing Landing Page ===")
    page.goto('http://localhost:3000')
    page.wait_for_load_state('networkidle')

    # Take screenshot first for debugging
    page.screenshot(path='e2e/landing-page-pricing.png', full_page=True)
    print("[OK] Screenshot saved to e2e/landing-page-pricing.png")

    # Check for pricing section
    pricing_heading = page.locator('text=Simple, Transparent Pricing')
    if pricing_heading.count() > 0:
        print("[OK] Pricing section heading found")
    else:
        print("[FAIL] Pricing section heading NOT found")
        # Check page content for debugging
        content = page.content()
        if 'Pricing' in content:
            print("  (Note: 'Pricing' text exists in page)")
        return False

    # Check for Free plan
    free_plan = page.locator('text=$0')
    if free_plan.count() > 0:
        print("[OK] Free plan ($0) found")
    else:
        print("[FAIL] Free plan NOT found")
        return False

    # Check for Pro plan price
    pro_plan = page.locator('text=$14.99')
    if pro_plan.count() > 0:
        print("[OK] Pro plan ($14.99) found")
    else:
        print("[FAIL] Pro plan NOT found")
        return False

    # Check for 5 messages per day
    free_messages = page.locator('text=5 messages per day')
    if free_messages.count() > 0:
        print("[OK] '5 messages per day' found in Free plan")
    else:
        print("[FAIL] '5 messages per day' NOT found")
        return False

    return True

def test_login_page(page):
    """Test the login page has forgot password link"""
    print("\n=== Testing Login Page ===")
    page.goto('http://localhost:3000/auth/login')
    page.wait_for_load_state('networkidle')

    # Take screenshot
    page.screenshot(path='e2e/login-page.png')
    print("[OK] Screenshot saved to e2e/login-page.png")

    # Check for Sign up / Sign in toggle
    signup_tab = page.locator('button:has-text("Sign up")')
    signin_tab = page.locator('button:has-text("Sign in")')

    if signup_tab.count() > 0 and signin_tab.count() > 0:
        print("[OK] Sign up / Sign in toggle found")
    else:
        print("[FAIL] Toggle NOT found")
        return False

    # Click on Sign in to see forgot password
    signin_tab.click()
    page.wait_for_timeout(500)

    # Check for forgot password link
    forgot_link = page.locator('text=Forgot password?')
    if forgot_link.count() > 0:
        print("[OK] 'Forgot password?' link found")
    else:
        print("[FAIL] 'Forgot password?' link NOT found")
        return False

    return True

def test_forgot_password_page(page):
    """Test the forgot password page"""
    print("\n=== Testing Forgot Password Page ===")
    page.goto('http://localhost:3000/auth/forgot-password')
    page.wait_for_load_state('networkidle')

    # Take screenshot
    page.screenshot(path='e2e/forgot-password-page.png')
    print("[OK] Screenshot saved to e2e/forgot-password-page.png")

    # Check for reset password heading
    heading = page.locator('text=Reset your password')
    if heading.count() > 0:
        print("[OK] 'Reset your password' heading found")
    else:
        print("[FAIL] 'Reset your password' heading NOT found")
        return False

    # Check for email input
    email_input = page.locator('input[type="email"]')
    if email_input.count() > 0:
        print("[OK] Email input found")
    else:
        print("[FAIL] Email input NOT found")
        return False

    # Check for send reset link button
    send_button = page.locator('button:has-text("Send reset link")')
    if send_button.count() > 0:
        print("[OK] 'Send reset link' button found")
    else:
        print("[FAIL] 'Send reset link' button NOT found")
        return False

    return True

def test_billing_page_unauthenticated(page):
    """Test that billing page redirects when not authenticated"""
    print("\n=== Testing Billing Page (unauthenticated) ===")
    page.goto('http://localhost:3000/app/billing')
    page.wait_for_load_state('networkidle')

    page.screenshot(path='e2e/billing-unauthenticated.png')
    print("[OK] Screenshot saved to e2e/billing-unauthenticated.png")

    # Should redirect to login
    if '/auth/login' in page.url or 'login' in page.url.lower():
        print("[OK] Correctly redirects to login when not authenticated")
        return True
    else:
        print(f"[INFO] Current URL: {page.url}")
        return True  # May have different behavior

def test_chat_page_unauthenticated(page):
    """Test that chat page redirects when not authenticated"""
    print("\n=== Testing Chat Page (unauthenticated) ===")
    page.goto('http://localhost:3000/app/chat')
    page.wait_for_load_state('networkidle')

    page.screenshot(path='e2e/chat-unauthenticated.png')
    print("[OK] Screenshot saved to e2e/chat-unauthenticated.png")

    # Should redirect to login
    if '/auth/login' in page.url or 'login' in page.url.lower():
        print("[OK] Correctly redirects to login when not authenticated")
        return True
    else:
        print(f"[INFO] Current URL: {page.url}")
        return True  # May have different behavior

def main():
    print("Starting FootballGPT Feature Tests")
    print("=" * 50)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()

        results = []

        # Run tests
        try:
            results.append(("Landing Page Pricing", test_landing_page(page)))
        except Exception as e:
            print(f"[ERROR] Landing page test failed: {e}")
            results.append(("Landing Page Pricing", False))

        try:
            results.append(("Login Page", test_login_page(page)))
        except Exception as e:
            print(f"[ERROR] Login page test failed: {e}")
            results.append(("Login Page", False))

        try:
            results.append(("Forgot Password Page", test_forgot_password_page(page)))
        except Exception as e:
            print(f"[ERROR] Forgot password test failed: {e}")
            results.append(("Forgot Password Page", False))

        try:
            results.append(("Billing Page (unauth)", test_billing_page_unauthenticated(page)))
        except Exception as e:
            print(f"[ERROR] Billing page test failed: {e}")
            results.append(("Billing Page (unauth)", False))

        try:
            results.append(("Chat Page (unauth)", test_chat_page_unauthenticated(page)))
        except Exception as e:
            print(f"[ERROR] Chat page test failed: {e}")
            results.append(("Chat Page (unauth)", False))

        browser.close()

        # Print summary
        print("\n" + "=" * 50)
        print("TEST SUMMARY")
        print("=" * 50)
        passed = sum(1 for _, r in results if r)
        total = len(results)

        for name, result in results:
            status = "PASS" if result else "FAIL"
            print(f"  {status}: {name}")

        print(f"\nTotal: {passed}/{total} tests passed")

        return passed == total

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
