import { test, expect } from '@playwright/test';
import { createSigninData } from '../data/signin.data';
import { signinPage } from '../pages/signin';
import { cartPage } from '../pages/cart';

let newSignin;
let newCart;

test.beforeEach(async ({ page }) => {

    newSignin = new signinPage(page);
    await newSignin.navigate();
    await newSignin.signin(createSigninData());
    await expect.poll(async () => (await page.locator('#nameofuser').textContent())?.trim(), {
        timeout: 15000,
    })
        .toBe(`Welcome ${createSigninData().username}`);

})

test('Verify whether the cart works properly(P)', async ({ page }) => {

let newContact;
    let alertMessage = '';

    page.once('dialog', async (dialog) => {
        alertMessage = dialog.message();
        await dialog.accept();
    });

    newCart = new cartPage(page);
    await newCart.cart();
    await expect.poll(() => alertMessage).toBe('Product added.');
    

})