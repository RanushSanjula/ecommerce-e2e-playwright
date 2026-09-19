import { test, expect } from '@playwright/test';
import { createSigninData } from '../data/signin.data';
import { signinPage } from '../pages/signin'

let newSignin;

test.beforeEach(async ({ page }) => {

    newSignin = new signinPage(page);
    await newSignin.navigate();

})

test('Successful logout(P)', async ({ page }) => {

    await newSignin.signin(createSigninData());
    await page.locator('id=logout2').click();
    await expect(page.locator('id=login2')).toBeVisible();

})