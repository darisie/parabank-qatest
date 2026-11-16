import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPages';
import { BillPayPage } from '../pages/BillPayPage';
import billPayData from '../data/billPayData.json';


try {
  process.loadEnvFile();
} catch {
  // En CI/CD las variables se toman de GitHub Secrets
}

const USERNAME = process.env.PARABANK_USER;
const PASSWORD = process.env.PARABANK_PASS;

if (!USERNAME || !PASSWORD) {
  throw new Error('Missing required environment variables: PARABANK_USER or PARABANK_PASS');
}

test.describe('Módulo Bill Pay - ParaBank', () => {
  let loginPage: LoginPage;
  let billPayPage: BillPayPage;

  // Se ejecuta automáticamente antes de cada test, como un hook para garantizar que las pruebas arranquen desde estado limpio
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    billPayPage = new BillPayPage(page);
    await loginPage.goto();
  });

  test('CP-01: Inicio de sesion exitoso con credenciales validas de cliente', {
    tag: ['@smoke', '@login'],
  }, async ({ page }) => {
    const data = billPayData.CP01_LOGIN_VALIDO;

    await test.step('GIVEN el usuario esta en LoginPage', async () => {
      await expect(page).toHaveURL(/index\.htm/);
    });    
    
    await test.step('WHEN ingresa credenciales válidas y presiona Log In', async () => {
      await loginPage.login(USERNAME, PASSWORD);
    });

    await test.step('THEN el sistema autentica la sesión y muestra el saludo', async () => {
      await expect(page).toHaveURL(/overview\.htm/);
      await expect(loginPage.welcomeMessage).toContainText(data.expectedGreeting);
    });
  });

  test('CP-02: Pago de servicio exitoso con datos dinamicos validos y cuenta con fondos', {
    tag: ['@smoke', '@billpay'],
  }, async () => {
    const data = billPayData.CP02_PAGO_VALIDO;

    await test.step('GIVEN el socio esta en BillPayPage', async () => {
      await loginPage.login(USERNAME, PASSWORD);
      await billPayPage.goto();
    });

    await test.step('WHEN completa los datos incrementales del beneficiario, confirma cuenta 111001, ingresa monto 15.50 seleccionando la cuenta con fondos y envia el pago', async () => {
      await billPayPage.submitPayment(data);
    });

    await test.step('THEN se muestra la confirmacion Bill Payment Complete', async () => {
      await expect(billPayPage.successTitle).toHaveText('Bill Payment Complete');
      await expect(billPayPage.successMessage).toContainText(
        `Bill Payment to ${data.payeeName} in the amount of $${data.amount}`
      );
    });
  });

  test('CP-03: Rechazo de pago cuando el monto ingresado es igual a cero', {
    tag: ['@negativo', '@billpay'],
    annotation: {
      type: 'Regla de negocio',
      description: 'El monto debe ser mayor al valor 0. Detecta si ParaBank permite realizar pagos en $0.',
    },
  }, async ({ page }) => {
    const data = billPayData.CP03_MONTO_CERO;

    await test.step('GIVEN El monto debe ser mayor que cero. Evidencia defecto real si ParaBank lo procesa como exitoso.', async () => {
      await loginPage.login(USERNAME, PASSWORD);
      await billPayPage.goto();
    });

    await test.step('WHEN ingresa 0 en Amount y presiona Send Payment', async () => {
      await billPayPage.submitPayment(data);
    });

    await test.step('THEN el sistema rechaza el pago y muestra error de monto invalido', async () => {
      await page.waitForTimeout(1500);
      await expect(billPayPage.successTitle).not.toBeVisible();
    });
  });

});