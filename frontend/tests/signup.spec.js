import { test, expect } from '@playwright/test';

test.describe('Student Signup Flow', () => {
  test('should load signup page and display registration form', async ({ page }) => {
    await page.goto('/signup');

    // Verify registration heading
    const signupHeading = page.getByRole('heading', { name: /sign up|register|create account/i });
    await expect(signupHeading).toBeVisible();

    // Verify name, email, password input fields
    const nameInput = page.getByLabel(/name/i).or(page.getByPlaceholder(/name/i));
    const emailInput = page.getByLabel(/email/i).or(page.getByPlaceholder(/email/i));
    const passwordInput = page.getByLabel(/password/i).or(page.getByPlaceholder(/password/i));

    await expect(nameInput).toBeVisible();
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    // Submit registration button
    const signupButton = page.getByRole('button', { name: /sign up|register/i });
    await expect(signupButton).toBeVisible();
  });
});
