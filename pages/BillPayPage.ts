import { Page, Locator } from '@playwright/test';

/** Estructura para los datos de pago de servicios */
export interface BillPayData {
  payeeName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  account: string;
  verifyAccount: string;
  amount: string;
}


// -----Locators del formulario de pago -----
export class BillPayPage {
  readonly page: Page;
  readonly billPayLink: Locator;
  readonly payeeNameInput: Locator;
  readonly addressInput: Locator;
  readonly cityInput: Locator;
  readonly stateInput: Locator;
  readonly zipCodeInput: Locator;
  readonly phoneInput: Locator;
  readonly accountInput: Locator;
  readonly verifyAccountInput: Locator;
  readonly amountInput: Locator;
  readonly sendPaymentButton: Locator;
  readonly successTitle: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.billPayLink = page.getByRole('link', { name: 'Bill Pay' });
    this.payeeNameInput = page.locator('input[name="payee.name"]');
    this.addressInput = page.locator('input[name="payee.address.street"]');
    this.cityInput = page.locator('input[name="payee.address.city"]');
    this.stateInput = page.locator('input[name="payee.address.state"]');
    this.zipCodeInput = page.locator('input[name="payee.address.zipCode"]');
    this.phoneInput = page.locator('input[name="payee.phoneNumber"]');
    this.accountInput = page.locator('input[name="payee.accountNumber"]');
    this.verifyAccountInput = page.locator('input[name="verifyAccount"]');
    this.amountInput = page.locator('input[name="amount"]');
    this.sendPaymentButton = page.getByRole('button', { name: 'Send Payment' });
    this.successTitle = page.locator('#billpayResult .title');
    this.successMessage = page.locator('#billpayResult p').first();
  }


  // ------ Ingreso a modulo Billpay --------
  async goto() {
    await this.billPayLink.click();
  }

  async submitPayment(data: BillPayData) {
    await this.payeeNameInput.fill(data.payeeName);
    await this.addressInput.fill(data.address);
    await this.cityInput.fill(data.city);
    await this.stateInput.fill(data.state);
    await this.zipCodeInput.fill(data.zipCode);
    await this.phoneInput.fill(data.phone);
    await this.accountInput.fill(data.account);
    await this.verifyAccountInput.fill(data.verifyAccount);
    await this.amountInput.fill(data.amount);
    await this.sendPaymentButton.click();
  }
}