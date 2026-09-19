exports.contactUsPage = class contactUsPage {

    constructor(page) {
        this.page = page;
        this.contactButton1 = page.locator('#navbarExample > ul > li:nth-child(2) > a');
        this.emailInput = page.locator('id=recipient-email');
        this.nameInput = page.locator('id=recipient-name');
        this.msgInput = page.locator('id=message-text');
        this.signinButton2 = page.getByRole('button', { name: 'Send message' });

    }

    async contact() {

        await this.contactButton1.click();
        await this.emailInput.fill('rsk@gmail.com');
        await this.nameInput.fill('RSK');
        await this.msgInput.fill('This is the new message');
        await this.signinButton2.click();
      
    }

        async contact2() {

        await this.contactButton1.click();
        await this.emailInput.fill('rskgmail.com');
        await this.nameInput.fill('RSK');
        await this.msgInput.fill('This is the new message');
        await this.signinButton2.click();
      
    }


}