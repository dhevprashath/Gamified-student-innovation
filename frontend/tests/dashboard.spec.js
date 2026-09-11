import { test, expect } from '@playwright/test';

test.describe('Student Dashboard Verification', () => {
  test('should load the dashboard and verify key elements', async ({ page }) => {
    await page.goto('/');

    // Verify main brand name in Navbar (exact text match)
    const brand = page.getByText('InnoQuest', { exact: true });
    await expect(brand).toBeVisible();

    // Verify Hero Welcome Banner / Workspace heading (H1) inside main content
    const welcomeHeader = page.getByRole('main').getByRole('heading', { level: 1 });
    await expect(welcomeHeader).toBeVisible();

    // Verify 4 primary module quick cards are visible
    await expect(page.getByText('1. AI Advisor')).toBeVisible();
    await expect(page.getByText('2. Research Gap')).toBeVisible();
    await expect(page.getByText('3. Innovation Journey')).toBeVisible();
    await expect(page.getByText('4. Readiness & Pitch')).toBeVisible();

    // Verify Active Projects list section
    const projectsHeader = page.getByRole('heading', { name: /your active student projects/i });
    await expect(projectsHeader).toBeVisible();
  });

  test('should open and close the Create New Project modal', async ({ page }) => {
    await page.goto('/');

    // Click the "Create New Project" button inside main workspace area
    const createBtn = page.getByRole('main').getByRole('button', { name: /create new project/i });
    await createBtn.click();

    // Verify modal title is visible
    const modalHeader = page.getByRole('heading', { name: 'Create Student Innovation Project' });
    await expect(modalHeader).toBeVisible();

    // Verify input form fields inside modal
    const titleInput = page.getByPlaceholder('e.g. Smart Agriculture Soil Sensor');
    await expect(titleInput).toBeVisible();

    // Click Cancel button to close modal
    const cancelBtn = page.getByRole('button', { name: 'Cancel' });
    await cancelBtn.click();

    // Verify modal is closed
    await expect(modalHeader).toBeHidden();
  });
});
