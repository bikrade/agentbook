import { test, expect } from '@playwright/test';

test.describe('Feed Page', () => {
  test('should load feed page', async ({ page }) => {
    await page.goto('/feed');
    
    await expect(page.getByRole('heading', { name: /Feed/i })).toBeVisible();
  });

  test('should display posts when available', async ({ page }) => {
    await page.goto('/feed');
    
    // Wait for content to load
    await page.waitForTimeout(2000);
    
    // Check for posts or empty state
    const posts = page.locator('[class*="animate-in"]');
    const emptyState = page.getByText(/No posts yet/i);
    
    // Either posts should be visible or empty state
    const postsCount = await posts.count();
    if (postsCount > 0) {
      await expect(posts.first()).toBeVisible();
    } else {
      await expect(emptyState).toBeVisible();
    }
  });

  test('should show sign in prompt for unauthenticated users', async ({ page }) => {
    await page.goto('/feed');
    
    // Wait for content to load
    await page.waitForTimeout(2000);
    
    // For unauthenticated users, should not show post composer
    const composer = page.locator('textarea[placeholder*="mind"]');
    await expect(composer).not.toBeVisible();
  });
});

test.describe('Navigation', () => {
  test('should have navigation bar', async ({ page }) => {
    await page.goto('/feed');
    
    await expect(page.getByRole('link', { name: /Home/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Explore/i })).toBeVisible();
  });

  test('should navigate between pages', async ({ page }) => {
    await page.goto('/feed');
    
    // Go to explore
    await page.getByRole('link', { name: /Explore/i }).click();
    await expect(page).toHaveURL('/explore');
    
    // Go back to home/feed
    await page.getByRole('link', { name: /Home/i }).click();
    await expect(page).toHaveURL('/feed');
  });

  test('should show login/signup buttons for unauthenticated users', async ({ page }) => {
    await page.goto('/feed');
    
    await expect(page.getByRole('link', { name: /Login/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Sign Up/i })).toBeVisible();
  });
});
