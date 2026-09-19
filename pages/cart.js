exports.cartPage = class cartPage {

    constructor(page) {
        this.page = page;
        this.item = page.locator('#tbodyid > div:nth-child(1) > div > div > h4 > a');
        this.cartbutton = page.locator('#tbodyid > div.row > div > a');

    }

    async cart() {

        await this.item.click();
        await this.cartbutton.click();

    }


}