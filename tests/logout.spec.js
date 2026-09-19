import { test, expect } from '@playwright/test';
import { createSigninData } from '../data/signin.data';


test.beforeEach(async ({ page }) => {

    await page.goto('https://www.demoblaze.com/');

})

test('Successful logout(P)', async ({ page }) => {

    await page.locator('id=login2').click();
    await page.locator('id=loginusername').fill(createSigninData().username);
    await page.locator('id=loginpassword').fill(createSigninData().password);
    await page.getByRole('button', { name: 'Log in' }).click();
    await expect.poll(async () => (await page.locator('#nameofuser').textContent())?.trim(), {
        timeout: 15000,
    })
        .toBe(`Welcome ${createSigninData().username}`);
    await page.locator('id=logout2').click();
    await expect(page.locator('id=login2')).toBeVisible();

})