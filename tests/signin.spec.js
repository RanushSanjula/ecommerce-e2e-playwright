import { test, expect } from '@playwright/test';
import { signinPage } from '../pages/signin'
import { createSigninData } from '../data/signin.data';


test('Log in with valid credentials(P)', async ({ page }) => {

    const newSignin = new signinPage(page);
    await newSignin.navigate();
    await newSignin.signin(createSigninData());
    await expect.poll(async () => (await page.locator('#nameofuser').textContent())?.trim(), {
        timeout: 15000,
    })
        .toBe(`Welcome ${createSigninData().username}`);

})