import { test, expect } from '@playwright/test';

test.describe('Student Login Flow', () => {
  test('should load the login page and authenticate student', async ({ page }) => {
    // Navigate to the application root
    await page.goto('/');

    // Verify that the login form/page is visible
    // Reliable locators: getByRole, getByLabel, getByText
    const loginHeading = page.getByRole('heading', { name: /login|sign in/i });
    await expect(loginHeading).toBeVisible();

    // Fill in test student credentials
    const emailInput = page.getByLabel(/email/i).or(page.getByPlaceholder(/email/i));
    const passwordInput = page.getByLabel(/password/i).or(page.getByPlaceholder(/password/i));

    await emailInput.fill(process.env.TEST_STUDENT_EMAIL || 'student@innoquest.edu');
    await passwordInput.fill(process.env.TEST_STUDENT_PASSWORD || 'StudentPass123!');

    // Click Login button
    const loginButton = page.getByRole('button', { name: /log in|sign in/i });
    await loginButton.click();

    // Verify student dashboard loads successfully
    await expect(page.getByRole('heading', { name: /dashboard|student innovation/i })).toBeVisible();
  });

  test('should test logout if application supports it', async ({ page }) => {
    await page.goto('/');

    // Locate logout button if present
    const logoutButton = page.getByRole('button', { name: /logout|sign out/i });
    await expect(logoutButton).toBeVisible();
    await logoutButton.click();

    // Verify returned to login page
    await expect(page.getByRole('heading', { name: /login|sign in/i })).toBeVisible();
  });
});
