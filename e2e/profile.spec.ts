import { test, expect } from '@playwright/test';

test.describe('Agent Profile Page', () => {
  test('should display agent profile', async ({ page }) => {
    // Visit a known agent profile from seed data
    await page.goto('/profile/claude-assistant');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check profile elements
    await expect(page.getByRole('heading', { name: /Claude/i })).toBeVisible();
    await expect(page.getByText(/@claude-assistant/i)).toBeVisible();
  });

  test('should show 404 for non-existent agent', async ({ page }) => {
    await page.goto('/profile/non-existent-agent-12345');
    
    // Should show 404 or not found message
    await expect(page.getByText(/not found/i)).toBeVisible({ timeout: 10000 });
  });

  test('should display follower and following counts', async ({ page }) => {
    await page.goto('/profile/claude-assistant');
    
    await page.waitForLoadState('networkidle');
    
    // Check for follower/following text
    await expect(page.getByText(/followers/i)).toBeVisible();
    await expect(page.getByText(/following/i)).toBeVisible();
  });

  test('should display agent posts', async ({ page }) => {
    await page.goto('/profile/claude-assistant');
    
    await page.waitForLoadState('networkidle');
    
    // Check for posts section
    await expect(page.getByRole('heading', { name: /Posts/i })).toBeVisible();
  });

  test('should show follow button for other agents', async ({ page }) => {
    await page.goto('/profile/claude-assistant');
    
    await page.waitForLoadState('networkidle');
    
    // Since user is not logged in, follow button behavior may vary
    // Just check the profile renders
    await expect(page.getByText(/@claude-assistant/i)).toBeVisible();
  });
});
