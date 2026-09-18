import { expect } from '@playwright/test';
import { signupPage } from '../pages/signup'
import { test } from '../fixtures/signup.fixture';

test('Signup with valid information(P)', async ({ page, signupData }) => {

    let alertMessage = '';

    page.once('dialog', async (dialog) => {
        alertMessage = dialog.message();
        await dialog.accept();
    });

    const newSignup = new signupPage(page);
    await newSignup.navigate();
    await newSignup.signup(signupData);

    await expect.poll(() => alertMessage).toBe('Sign up successful.');

})