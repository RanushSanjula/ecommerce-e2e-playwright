import { test, expect } from '@playwright/test';
import { createSigninData } from '../data/signin.data';
import { signinPage } from '../pages/signin';
import { checkoutPage } from '../pages/checkout';
import { cartPage } from '../pages/cart';

let newSignin;
let newCheckout;
let newCart;

test.beforeEach(async ({ page }) => {

    newSignin = new signinPage(page);
    newCart = new cartPage(page);
    await newSignin.navigate();
    await newSignin.signin(createSigninData());
    await expect.poll(async () => (await page.locator('#nameofuser').textContent())?.trim(), {
        timeout: 15000,
    })
        .toBe(`Welcome ${createSigninData().username}`);
    await newCart.cart();

    let alertMessage = '';

    page.once('dialog', async (dialog) => {
        alertMessage = dialog.message();
        await dialog.accept();
    });

    await expect.poll(() => alertMessage).toBe('Product added.');
    await page.locator('#navbarExample > ul > li.nav-item.active > a').click();

})

test('Verify whether the checkout works properly(P)', async ({ page }) => {

    newCheckout = new checkoutPage(page);
    await newCheckout.checkout();
    await expect(page.locator('body')).toContainText('Thank you for your purchase!');
    await page.getByRole('button', { name: 'OK' }).click();

})