import { Page, Locator } from  '@playwright/test'


/**POM para la pantalla de inicio de sesion de ParaBanak */
export class LoginPage {

    // -----Locators----
    readonly page:Page;
    readonly userInput: Locator;
    readonly passInput: Locator;
    readonly loginButton: Locator;
    readonly welcomeMessage: Locator;

    constructor(page: Page) {
    this.page = page;
    this.userInput = page.locator('input[name="username"]');
    this.passInput = page.locator('input[name="password"]');
    this.loginButton = page.getByRole('button', { name: 'Log In' });
    this.welcomeMessage = page.locator('#leftPanel .smallText');
  }

  // ---- Navega a la pagina principal de inicio de sesion ------
  async goto() {
    await this.page.goto('https://parabank.parasoft.com/parabank/index.htm');
  }
  
  // ----Completa credenciales del cliente para el acceso-----
  async login(username: string, password: string) {
    await this.userInput.fill(username);
    await this.passInput.fill(password);
    await this.loginButton.click();
  }
}
