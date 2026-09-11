# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: signup.spec.js >> Student Signup Flow >> should load signup page and display registration form
- Location: tests\signup.spec.js:4:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: /sign up|register|create account/i })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('heading', { name: /sign up|register|create account/i }) with timeout 5000ms
  - waiting for getByRole('heading', { name: /sign up|register|create account/i })

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
  3  | test.describe('Student Signup Flow', () => {
  4  |   test('should load signup page and display registration form', async ({ page }) => {
  5  |     await page.goto('/signup');
  6  | 
  7  |     // Verify registration heading
  8  |     const signupHeading = page.getByRole('heading', { name: /sign up|register|create account/i });
> 9  |     await expect(signupHeading).toBeVisible();
     |                                 ^ Error: expect(locator).toBeVisible() failed
  10 | 
  11 |     // Verify name, email, password input fields
  12 |     const nameInput = page.getByLabel(/name/i).or(page.getByPlaceholder(/name/i));
  13 |     const emailInput = page.getByLabel(/email/i).or(page.getByPlaceholder(/email/i));
  14 |     const passwordInput = page.getByLabel(/password/i).or(page.getByPlaceholder(/password/i));
  15 | 
  16 |     await expect(nameInput).toBeVisible();
  17 |     await expect(emailInput).toBeVisible();
  18 |     await expect(passwordInput).toBeVisible();
  19 | 
  20 |     // Submit registration button
  21 |     const signupButton = page.getByRole('button', { name: /sign up|register/i });
  22 |     await expect(signupButton).toBeVisible();
  23 |   });
  24 | });
  25 | 
```