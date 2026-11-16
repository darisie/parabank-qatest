# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: billpay.spec.ts >> Módulo Bill Pay - ParaBank >> CP-03: Rechazo de pago cuando el monto ingresado es igual a cero
- Location: tests\billpay.spec.ts:67:3

# Error details

```
Error: expect(locator).not.toBeVisible() failed

Locator:  locator('#billpayResult .title')
Expected: not visible
Received: visible
Timeout:  5000ms

Call log:
  - Expect "not toBeVisible" locator('#billpayResult .title') with timeout 5000ms
  - waiting for locator('#billpayResult .title')
    14 × locator resolved to <h1 class="title">Bill Payment Complete</h1>
       - unexpected value "visible"

```

```yaml
- heading "Bill Payment Complete" [level=1]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { LoginPage } from '../pages/LoginPages';
  3  | import { BillPayPage } from '../pages/BillPayPage';
  4  | import billPayData from '../data/billPayData.json';
  5  | 
  6  | try {
  7  |   process.loadEnvFile();
  8  | } catch {
  9  |   // En CI/CD las variables se toman de GitHub Secrets
  10 | }
  11 | 
  12 | const USERNAME = process.env.PARABANK_USER || 'qanetbytest';
  13 | const PASSWORD = process.env.PARABANK_PASS || 'Pass123';
  14 | 
  15 | test.describe('Módulo Bill Pay - ParaBank', () => {
  16 |   let loginPage: LoginPage;
  17 |   let billPayPage: BillPayPage;
  18 | 
  19 |   // Se ejecuta automáticamente antes de cada test, como un hook para garantizar que las pruebas arranquen desde estado limpio
  20 |   test.beforeEach(async ({ page }) => {
  21 |     loginPage = new LoginPage(page);
  22 |     billPayPage = new BillPayPage(page);
  23 |     await loginPage.goto();
  24 |   });
  25 | 
  26 |   test('CP-01: Inicio de sesion exitoso con credenciales validas de cliente', {
  27 |     tag: ['@smoke', '@login'],
  28 |   }, async ({ page }) => {
  29 |     const data = billPayData.CP01_LOGIN_VALIDO;
  30 | 
  31 |     await test.step('GIVEN el usuario esta en LoginPage', async () => {
  32 |       await expect(page).toHaveURL(/index\.htm/);
  33 |     });    
  34 |     
  35 |     await test.step('WHEN ingresa credenciales válidas y presiona Log In', async () => {
  36 |       await loginPage.login(USERNAME, PASSWORD);
  37 |     });
  38 | 
  39 |     await test.step('THEN el sistema autentica la sesión y muestra el saludo', async () => {
  40 |       await expect(page).toHaveURL(/overview\.htm/);
  41 |       await expect(loginPage.welcomeMessage).toContainText(data.expectedGreeting);
  42 |     });
  43 |   });
  44 | 
  45 |   test('CP-02: Pago de servicio exitoso con datos dinamicos validos y cuenta con fondos', {
  46 |     tag: ['@smoke', '@billpay'],
  47 |   }, async () => {
  48 |     const data = billPayData.CP02_PAGO_VALIDO;
  49 | 
  50 |     await test.step('GIVEN el socio esta en BillPayPage', async () => {
  51 |       await loginPage.login(USERNAME, PASSWORD);
  52 |       await billPayPage.goto();
  53 |     });
  54 | 
  55 |     await test.step('WHEN completa los datos incrementales del beneficiario, confirma cuenta 111001, ingresa monto 15.50 seleccionando la cuenta con fondos y envia el pago', async () => {
  56 |       await billPayPage.submitPayment(data);
  57 |     });
  58 | 
  59 |     await test.step('THEN se muestra la confirmacion Bill Payment Complete', async () => {
  60 |       await expect(billPayPage.successTitle).toHaveText('Bill Payment Complete');
  61 |       await expect(billPayPage.successMessage).toContainText(
  62 |         `Bill Payment to ${data.payeeName} in the amount of $${data.amount}`
  63 |       );
  64 |     });
  65 |   });
  66 | 
  67 |   test('CP-03: Rechazo de pago cuando el monto ingresado es igual a cero', {
  68 |     tag: ['@negativo', '@billpay'],
  69 |     annotation: {
  70 |       type: 'Regla de negocio',
  71 |       description: 'El monto debe ser mayor al valor 0. Detecta si ParaBank permite realizar pagos en $0.',
  72 |     },
  73 |   }, async ({ page }) => {
  74 |     const data = billPayData.CP03_MONTO_CERO;
  75 | 
  76 |     await test.step('GIVEN El monto debe ser mayor que cero. Evidencia defecto real si ParaBank lo procesa como exitoso.', async () => {
  77 |       await loginPage.login(USERNAME, PASSWORD);
  78 |       await billPayPage.goto();
  79 |     });
  80 | 
  81 |     await test.step('WHEN ingresa 0 en Amount y presiona Send Payment', async () => {
  82 |       await billPayPage.submitPayment(data);
  83 |     });
  84 | 
  85 |     await test.step('THEN el sistema rechaza el pago y muestra error de monto invalido', async () => {
  86 |       await page.waitForTimeout(1500);
> 87 |       await expect(billPayPage.successTitle).not.toBeVisible();
     |                                                  ^ Error: expect(locator).not.toBeVisible() failed
  88 |     });
  89 |   });
  90 | 
  91 | });
```