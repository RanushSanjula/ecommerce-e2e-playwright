import { test, expect } from '@playwright/test';
import { signinPage } from '../pages/signin'
import { createSigninData, EmptyData } from '../data/signin.data';
import { describe } from 'node:test';

test.describe('Test Group 1', () => {

    let newSignin;

    test.beforeEach(async ({ page }) => {
        newSignin = new signinPage(page);
        await newSignin.navigate();
    })

    test('Log in with valid credentials(P)', async ({ page }) => {


        await newSignin.signin(createSigninData());
        await expect.poll(async () => (await page.locator('#nameofuser').textContent())?.trim(), {
            timeout: 15000,
        })
            .toBe(`Welcome ${createSigninData().username}`);

    })

    test('Log in with empty credentials(N)', async ({ page }) => {

        let alertMessage = '';

        page.once('dialog', async (dialog) => {
            alertMessage = dialog.message();
            await dialog.accept();
        });


        await newSignin.signin(EmptyData());
        await expect.poll(() => alertMessage).toBe('Please fill out Username and Password.');


    })


})