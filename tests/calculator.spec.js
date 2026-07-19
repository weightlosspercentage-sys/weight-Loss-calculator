import { test, expect } from '@playwright/test';

test.describe('Weight Loss Percentage Calculator', () => {
  test('verifies hero styling and footer flags', async ({ page }) => {
    // The baseURL is handled by playwright.config.js, but let's be explicit for with_server.py just in case
    await page.goto('http://localhost:4321');
    await page.waitForLoadState('networkidle');

    // 1. Check title
    await expect(page).toHaveTitle(/Weight Loss Percentage Calculator/);

    // 2. Check H1 has font-weight 900
    const h1 = page.locator('h1').first();
    await expect(h1).toHaveText(/Weight Loss Percentage Calculator/);
    
    const fontWeight = await h1.evaluate((el) => window.getComputedStyle(el).fontWeight);
    expect(fontWeight).toBe('900');

    // 3. Check Footer flags
    const usLink = page.locator('footer a', { hasText: '🇺🇸 English (US)' });
    await expect(usLink).toBeVisible();

    const ukLink = page.locator('footer a', { hasText: '🇬🇧 English (UK)' });
    await expect(ukLink).toBeVisible();
    
    console.log("All UI tests passed! The bold hero and footer flags are rendering correctly.");
  });
});
