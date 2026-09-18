import { test as base } from '@playwright/test';
import { createSignupData } from '../data/signup.data';

export const test = base.extend({
    signupData: async ({}, use) => {
        await use(createSignupData());
    },
});
