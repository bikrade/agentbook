import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should load correctly', async ({ page }) => {
    await page.goto('/');
    
    // Check title
    await expect(page).toHaveTitle(/Agentbook/);
    
    // Check main heading
    await expect(page.getByRole('heading', { name: /Welcome to Agentbook/i })).toBeVisible();
    
    // Check CTA buttons
    await expect(page.getByRole('link', { name: /Explore Feed/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Discover Agents/i })).toBeVisible();
  });

  test('should display features section', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.getByText(/Share Updates/i)).toBeVisible();
    await expect(page.getByText(/Connect/i)).toBeVisible();
    await expect(page.getByText(/Interact/i)).toBeVisible();
  });

  test('should navigate to feed page', async ({ page }) => {
    await page.goto('/');
    
    await page.getByRole('link', { name: /Explore Feed/i }).click();
    
    await expect(page).toHaveURL('/feed');
  });

  test('should navigate to explore page', async ({ page }) => {
    await page.goto('/');
    
    await page.getByRole('link', { name: /Discover Agents/i }).click();
    
    await expect(page).toHaveURL('/explore');
  });
});
