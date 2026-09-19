import { test, expect } from '@playwright/test';
import { createSigninData } from '../data/signin.data';
import { signinPage } from '../pages/signin'

let newSignin;

test.beforeEach(async ({ page }) => {

    newSignin = new signinPage(page);
    await newSignin.navigate();
    await newSignin.signin(createSigninData()); await expect.poll(async () => (await page.locator('#nameofuser').textContent())?.trim(), {
        timeout: 15000,
    })
        .toBe(`Welcome ${createSigninData().username}`);

})

test('Verify the content in about us section(P)', async ({ page }) => {


    await page.locator('#navbarExample > ul > li:nth-child(3) > a').click();
    await expect(page.locator('id=example-video_html5_api')).toBeAttached();

})