import { test, expect } from '@playwright/test';
import { createSigninData } from '../data/signin.data';
import { signinPage } from '../pages/signin'
import { contactUsPage } from '../pages/contactus'

let newSignin;

test.describe('Contact us Group 1',()=>{

test.beforeEach(async ({ page }) => {

    newSignin = new signinPage(page);
    await newSignin.navigate();
    await newSignin.signin(createSigninData());
    await expect.poll(async () => (await page.locator('#nameofuser').textContent())?.trim(), {
        timeout: 15000,
    })
        .toBe(`Welcome ${createSigninData().username}`);

})

test('Verify whether the contact page works properly(P)', async ({ page }) => {

    let newContact;
    let alertMessage = '';

    page.once('dialog', async (dialog) => {
        alertMessage = dialog.message();
        await dialog.accept();
    });
    newContact = new contactUsPage(page);
    await newContact.contact();
    await expect.poll(() => alertMessage).toBe('Thanks for the message!!');

})

test('Verify whether the user cannot enter invalid email format(N)', async ({ page }) => {

    let newContact;
    let alertMessage = '';

    page.once('dialog', async (dialog) => {
        alertMessage = dialog.message();
        await dialog.accept();
    });
    newContact = new contactUsPage(page);
    await newContact.contact2();
    await expect.poll(() => alertMessage).toBe('Invalid email format');

})

})