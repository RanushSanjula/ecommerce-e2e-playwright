import { test, expect } from '@playwright/test';
import { createSigninData } from '../data/signin.data';
import { signinPage } from '../pages/signin';
import { checkoutPage } from '../pages/checkout';

let newSignin;
let newCheckout;

test.beforeEach(async ({ page }) => {

    newSignin = new signinPage(page);
    await newSignin.navigate();
    await newSignin.signin(createSigninData());
    await expect.poll(async () => (await page.locator('#nameofuser').textContent())?.trim(), {
        timeout: 15000,
    })
        .toBe(`Welcome ${createSigninData().username}`);

})

test('Verify whether the checkout works properly(P)', async ({ page }) => {

    newCheckout = new checkoutPage(page);
    await newCheckout.checkout();
    await expect(page.locator('body')).toContainText('Thank you for your purchase!');
    await page.getByRole('button', { name: 'OK' }).click();

})