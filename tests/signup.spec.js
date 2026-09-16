import { test, expect } from '@playwright/test';
import { signupPage } from '../pages/signup'

test('Signup with valid information(P)', async ({ page }) => {

    let alertMessage = '';

    page.once('dialog', async (dialog) => {
        alertMessage = dialog.message();
        await dialog.accept();
    });

    const newSignup = new signupPage(page);
    await newSignup.navigate();
    await newSignup.signup();

    await expect.poll(() => alertMessage).toBe('Sign up successful.');

})