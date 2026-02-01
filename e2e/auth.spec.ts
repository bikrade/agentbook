import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.describe('Registration', () => {
    test('should display registration form', async ({ page }) => {
      await page.goto('/register');
      
      await expect(page.getByRole('heading', { name: /Join Agentbook/i })).toBeVisible();
      await expect(page.getByLabel(/Handle/i)).toBeVisible();
      await expect(page.getByLabel(/Display Name/i)).toBeVisible();
      await expect(page.getByLabel(/Email/i)).toBeVisible();
      await expect(page.getByLabel(/^Password$/i)).toBeVisible();
      await expect(page.getByLabel(/Confirm Password/i)).toBeVisible();
    });

    test('should show validation error for mismatched passwords', async ({ page }) => {
      await page.goto('/register');
      
      await page.getByLabel(/Handle/i).fill('test-agent');
      await page.getByLabel(/Display Name/i).fill('Test Agent');
      await page.getByLabel(/Email/i).fill('test@example.com');
      await page.getByLabel(/^Password$/i).fill('password123');
      await page.getByLabel(/Confirm Password/i).fill('differentpassword');
      
      await page.getByRole('button', { name: /Create Account/i }).click();
      
      await expect(page.getByText(/Passwords do not match/i)).toBeVisible();
    });

    test('should show validation error for short password', async ({ page }) => {
      await page.goto('/register');
      
      await page.getByLabel(/Handle/i).fill('test-agent');
      await page.getByLabel(/Display Name/i).fill('Test Agent');
      await page.getByLabel(/Email/i).fill('test@example.com');
      await page.getByLabel(/^Password$/i).fill('short');
      await page.getByLabel(/Confirm Password/i).fill('short');
      
      await page.getByRole('button', { name: /Create Account/i }).click();
      
      await expect(page.getByText(/Password must be at least 8 characters/i)).toBeVisible();
    });

    test('should have link to login page', async ({ page }) => {
      await page.goto('/register');
      
      await page.getByRole('link', { name: /Sign In/i }).click();
      
      await expect(page).toHaveURL('/login');
    });
  });

  test.describe('Login', () => {
    test('should display login form', async ({ page }) => {
      await page.goto('/login');
      
      await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible();
      await expect(page.getByLabel(/Email/i)).toBeVisible();
      await expect(page.getByLabel(/Password/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /Sign In/i })).toBeVisible();
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/login');
      
      await page.getByLabel(/Email/i).fill('nonexistent@example.com');
      await page.getByLabel(/Password/i).fill('wrongpassword');
      
      await page.getByRole('button', { name: /Sign In/i }).click();
      
      // Wait for error message
      await expect(page.getByText(/Invalid email or password/i)).toBeVisible({ timeout: 5000 });
    });

    test('should have link to registration page', async ({ page }) => {
      await page.goto('/login');
      
      await page.getByRole('link', { name: /Register/i }).click();
      
      await expect(page).toHaveURL('/register');
    });
  });
});
