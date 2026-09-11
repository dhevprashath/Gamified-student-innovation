# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: login.spec.js >> Student Login Flow >> should load the login page and authenticate student
- Location: tests\login.spec.js:4:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: /login|sign in/i })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('heading', { name: /login|sign in/i }) with timeout 5000ms
  - waiting for getByRole('heading', { name: /login|sign in/i })

```

```yaml
- banner:
  - img
  - text: InnoQuest Student Innovation MVP
  - combobox:
    - option "📁 EcoTrack - Smart Waste Routing" [selected]
  - button "Create New Project":
    - img
  - navigation:
    - button "Dashboard":
      - img
      - text: Dashboard
    - button "AI Advisor":
      - img
      - text: AI Advisor
    - button "Research Gap":
      - img
      - text: Research Gap
    - button "Innovation Journey":
      - img
      - text: Innovation Journey
    - button "Project Readiness":
      - img
      - text: Project Readiness
- main:
  - img
  - text: Student Innovation Workspace
  - heading "EcoTrack - Smart Waste Routing" [level=1]
  - paragraph: IoT waste bin sensor network with real-time routing.
  - text: "Domain: Smart Cities & Sustainability"
  - button "Create New Project":
    - img
    - text: Create New Project
  - img
  - heading "1. AI Advisor" [level=3]
  - paragraph: Submit your concept for 7-metric score evaluation & risk analysis.
  - text: Launch Advisor
  - img
  - img
  - heading "2. Research Gap" [level=3]
  - paragraph: Discover unexplored literature gaps & innovation opportunities.
  - text: Find Gaps
  - img
  - img
  - heading "3. Innovation Journey" [level=3]
  - paragraph: Earn XP, level up, and unlock 7 innovation badges across milestones.
  - text: View Timeline
  - img
  - img
  - heading "4. Readiness & Pitch" [level=3]
  - paragraph: Calculate 6-pillar readiness score & generate 2-minute pitch deck.
  - text: Generate Pitch
  - img
  - heading "Your Active Student Projects (1)" [level=2]
  - heading "EcoTrack - Smart Waste Routing" [level=3]
  - text: Active
  - paragraph: IoT waste bin sensor network with real-time routing.
  - text: "Domain: Smart Cities & Sustainability 9/3/2026"
- contentinfo:
  - paragraph: Gamified Student Innovation Platform — React + FastAPI + SQLAlchemy + MySQL + AI MVP
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Student Login Flow', () => {
  4  |   test('should load the login page and authenticate student', async ({ page }) => {
  5  |     // Navigate to the application root
  6  |     await page.goto('/');
  7  | 
  8  |     // Verify that the login form/page is visible
  9  |     // Reliable locators: getByRole, getByLabel, getByText
  10 |     const loginHeading = page.getByRole('heading', { name: /login|sign in/i });
> 11 |     await expect(loginHeading).toBeVisible();
     |                                ^ Error: expect(locator).toBeVisible() failed
  12 | 
  13 |     // Fill in test student credentials
  14 |     const emailInput = page.getByLabel(/email/i).or(page.getByPlaceholder(/email/i));
  15 |     const passwordInput = page.getByLabel(/password/i).or(page.getByPlaceholder(/password/i));
  16 | 
  17 |     await emailInput.fill(process.env.TEST_STUDENT_EMAIL || 'student@innoquest.edu');
  18 |     await passwordInput.fill(process.env.TEST_STUDENT_PASSWORD || 'StudentPass123!');
  19 | 
  20 |     // Click Login button
  21 |     const loginButton = page.getByRole('button', { name: /log in|sign in/i });
  22 |     await loginButton.click();
  23 | 
  24 |     // Verify student dashboard loads successfully
  25 |     await expect(page.getByRole('heading', { name: /dashboard|student innovation/i })).toBeVisible();
  26 |   });
  27 | 
  28 |   test('should test logout if application supports it', async ({ page }) => {
  29 |     await page.goto('/');
  30 | 
  31 |     // Locate logout button if present
  32 |     const logoutButton = page.getByRole('button', { name: /logout|sign out/i });
  33 |     await expect(logoutButton).toBeVisible();
  34 |     await logoutButton.click();
  35 | 
  36 |     // Verify returned to login page
  37 |     await expect(page.getByRole('heading', { name: /login|sign in/i })).toBeVisible();
  38 |   });
  39 | });
  40 | 
```