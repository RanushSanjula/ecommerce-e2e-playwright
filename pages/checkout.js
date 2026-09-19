exports.checkoutPage = class checkoutPage {

    constructor(page) {
        this.page = page;
        this.cart = page.locator('#navbarExample > ul > li:nth-child(4) > a');
        this.placeorderbutton = page.locator('#page-wrapper > div > div.col-lg-1 > button');
        this.name = page.locator('id=name');
        this.country = page.locator('id=country');
        this.city = page.locator('id=city');
        this.cardNo = page.locator('id=card');
        this.Month = page.locator('id=month');
        this.year = page.locator('id=year');
        this.purchaseButton = page.locator('#orderModal > div > div > div.modal-footer > button.btn.btn-primary');

    }

    async checkout() {

        await this.cart.click();
        await this.placeorderbutton.click();
        await this.name.fill('RSK');
        await this.country.fill('Sri Lanka');
        await this.city.fill('Colombo');
        await this.cardNo.fill('1234567890');
        await this.Month.fill('10');
        await this.year.fill('2026');
        await this.purchaseButton.click();

    }


}