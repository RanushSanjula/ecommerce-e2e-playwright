exports.signupPage = class signupPage {

    constructor(page) {
        this.page = page;
        this.signupButton1 = page.locator('id=signin2');
        this.usernameInput = page.locator('id=sign-username');
        this.passwordInput = page.locator('id=sign-password');
        this.signupButton2 = page.getByRole('button', { name: 'Sign up' });
    }

    async navigate() {
        await this.page.goto('https://www.demoblaze.com/');
    }

    async signup() {
        await this.signupButton1.click();
        await this.usernameInput.fill('klgy96gj');
        await this.passwordInput.fill('jguj78ygu');
        await this.signupButton2.click();
    }


}