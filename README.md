### Proyecto QA Automation - ParaBank (Bill Pay)

Este repositorio contiene la resolución de la prueba técnica de QA Automation para el flujo de pago de servicios (Bill Pay) en ParaBank. Cubre diseño de pruebas, automatización Web y API, pruebas de rendimiento, propuesta Mobile y pipeline CI/CD.

### 1. Estructura del Repositorio
- /casos: Matriz de diseño (TC-Parabank-Billpay.xlsx).
- /web: Proyecto de automatización UI con Playwright.
- /api: Colección y entorno de Postman.
- /performance: Script de pruebas de carga en Apache JMeter.
- /evidencias: Capturas, reportes y evidencias de bugs.
- /.github/workflows: Pipeline de GitHub Actions.
- .env:  Se que no se debe enviar este archivo por motivos de seguridad, pero subo la informacion que contiene solo por motivos de test 

### 2. Diseño de Casos de Prueba
Se diseñaron 6 casos atómicos bajo el enfoque BDD (Given/When/Then) y Page Object Model (POM):
- 3 automatizados (Web): Login válido (CP-01), Pago exitoso de $15.50 (CP-02) y Rechazo de pago con $0 (CP-03).
- 3 manuales: Pago con monto negativo, integridad de saldos y validación del historial de transacciones.

### 3. Automatización Web (Playwright) y API (Postman/Newman)
**Web:** Se implementó Playwright con TypeScript. Valida el flujo E2E desde el login hasta el comprobante de pago.
**API:** Se automatizaron las consultas `GET /customers/{customerId}/accounts` y `GET /accounts/{accountId}/transactions`. Los scripts validan el código HTTP 200, la estructura del JSON y las reglas de negocio (saldos numéricos y persistencia del pago), evadiendo los reinicios de la base de datos pública.

**Ejecución local:**
- Web:
  cd web
  npm install
  npx playwright install chromium
  (Crear archivo web/.env con PARABANK_USER y PARABANK_PASS)
  npx playwright test --project=chromium

- API: (Desde la raíz del proyecto)
  npx newman run api/ParaBank_API_Tests.postman_collection.json -e api/Parabank_testenv.postman_environment.json

### 4. Pruebas de Rendimiento (Apache JMeter)
Se analizó el endpoint `GET /parabank/services/bank/accounts/{accountId}/transactions` por ser crítico y carecer de paginación. 
*Nota: El script (.jmx) está listo para entornos autorizados. No se ejecutó estrés contra el servidor público para no afectar el servicio.*

- Escenarios configurados: Carga base (5 usuarios, 15 peticiones totales) y Carga incremental (20 usuarios, 100 peticiones totales).
- Métricas a examinar: Tiempo promedio, Percentil 95, Throughput (peticiones/seg) y Porcentaje de errores.
- Análisis de datos simulados: Con 5 usuarios la latencia es 450ms (0% error). Al subir a 10 usuarios, sube a 1800ms con un 8% de error (500/504). 
- Conclusión técnica: Existe degradación no lineal. Se decide bloquear el pase a producción hasta analizar los índices de BD y el pool de conexiones.

### 5. Automatización Mobile (Estrategia)
Debido a la falta de instalador oficial y hardware macOS, la automatización móvil se diseña bajo esta arquitectura:
- Stack: Appium 2 + UiAutomator2 + WebdriverIO (TypeScript).
- Entorno Local: Ejecución y mapeo de elementos en emulador de Android Studio sobre Windows.
- Entorno CI/CD: Las *capabilities* se desacoplan para ejecutar las pruebas en dispositivos reales alojados en granjas cloud (BrowserStack / Sauce Labs), permitiendo probar en iOS y Android en paralelo sin hardware local.

### 6. Pipeline CI/CD (GitHub Actions)
El archivo `qa-pipeline.yml` se dispara mediante Push o Pull Request a la rama main. 
Automatiza la instalación de Node 20, ejecuta Playwright y Newman utilizando repositorios de Secrets para las credenciales, y finaliza guardando los reportes HTML y JSON como Artifacts descargables.

### 7. Resultados, Evidencias y Defectos
- Ejecución: La suite API pasó al 100%. La suite Web detectó 1 defecto crítico esperado.
- Bug reportado (CP-03): ParaBank no valida los montos en el backend. Permite realizar pagos por $0.00 y muestra el mensaje de éxito "Bill Payment Complete".
- Evidencias: En la carpeta `/evidencias` se encuentran las capturas del reporte de Playwright con el fallo visual del bug, la ejecución exitosa en Postman Runner, y los reportes JSON generados.
