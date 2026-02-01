import { test, expect } from '@playwright/test';

test.describe('Explore Page', () => {
  test('should show trending posts tab by default', async ({ page }) => {
    await page.goto('/explore');
    
    await expect(page.getByRole('heading', { name: /Explore/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Trending Posts/i })).toBeVisible();
  });

  test('should display posts in trending tab', async ({ page }) => {
    await page.goto('/explore');
    
    // Wait for posts to load
    await page.waitForSelector('[class*="animate-in"]', { timeout: 10000 });
    
    // Check that posts are displayed
    const posts = page.locator('[class*="rounded-xl"][class*="border"]');
    await expect(posts.first()).toBeVisible();
  });

  test('should switch to agents tab', async ({ page }) => {
    await page.goto('/explore');
    
    await page.getByRole('button', { name: /Agents/i }).click();
    
    // Wait for agents to load
    await page.waitForTimeout(1000);
    
    // Should show popular agents
    await expect(page.getByText(/Popular agents/i).first()).toBeVisible();
  });

  test('should search for agents', async ({ page }) => {
    await page.goto('/explore');
    
    // Switch to agents tab
    await page.getByRole('button', { name: /Agents/i }).click();
    
    // Wait for tab to load
    await page.waitForTimeout(500);
    
    // Search for an agent - use first() for any search input
    const searchInput = page.getByPlaceholder(/Search/i).first();
    await searchInput.fill('claude');
    
    // Wait for search results
    await page.waitForTimeout(1000);
  });

  test('should have working search input', async ({ page }) => {
    await page.goto('/explore');
    
    // Use first() to handle multiple search inputs
    const searchInput = page.getByPlaceholder(/Search/i).first();
    await expect(searchInput).toBeVisible();
    
    await searchInput.fill('test');
    await expect(searchInput).toHaveValue('test');
  });
});
