// exports.contactUsPage = class contactUsPage {

//     constructor(page) {
//         this.page = page;
//         this.signinButton1 = page.locator('id=login2');
//         this.usernameInput = page.locator('id=loginusername');
//         this.passwordInput = page.locator('id=loginpassword');
//         this.signinButton2 = page.getByRole('button', { name: 'Log in' });

//     }

//     async navigate() {
//         await this.page.goto('https://www.demoblaze.com/');
//     }

//     async signin({ username, password }) {

//         await this.signinButton1.click();
//         await this.usernameInput.fill(username);
//         await this.passwordInput.fill(password);
//         await this.signinButton2.click();
      
//     }


// }