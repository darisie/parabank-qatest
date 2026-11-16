<!-- -->
# Diseño de Casos de Prueba - Flujo Pago de Servicios (ParaBank Bill Pay)
Esta  descripcion contiene la matriz de diseño y estrategia de pruebas (`TC-Parabank-Billpay.xlsx`) elaborada para validar el flujo de pago de servicios en ParaBank

## 1. Estructura del Archivo Excel (Pestañas)

- Resumen_estrategia: Portada ejecutiva con el enfoque metodológico (SDD, BDD, POM), criterios de aislamiento de datos, selección de automatización y tabla resumen de cobertura 
- Happy_path: Casos funcionales positivos que validan el acceso autenticado y el flujo exitoso de pago de servicios 
- Negative_tests: Casos de validación de reglas de negocio y manejo de errores financieros (monto cero y monto negativo) 
- Regression_tests: Casos de integridad financiera para verificar el débito exacto en saldos y el registro del movimiento en el historial de transacciones 

## 2. Resumen de Casos (Manuales vs. Automatizables)

El diseño contempla un total de 6 casos de prueba atómicos e independientes[cite: 3]:

- Happy_path: 2 casos totales (2 automatizados en Web, 0 manuales). Cubre CP-01 (Login válido) y CP-02 (Pago de servicio exitoso por $15.50) 
- Negative_tests: 2 casos totales (1 automatizado en Web, 1 manual). Cubre CP-03 (Pago con monto 0, automatizado para evidenciar defecto real) y CP-04 (Pago con monto negativo -$25.00, manual) 
- Regression_tests: 2 casos totales (0 automatizados en Web, 2 manuales). Cubre CP-05 (Integridad de saldos en cuentas) y CP-06 (Registro de débito en historial de cuenta) 

Total general: 6 casos diseñados (3 automatizados en Playwright y 3 de ejecución manual) 

## 3. Enfoque Metodológico Aplicado

- SDD y BDD: Casos derivados directamente de los criterios de aceptación del negocio y redactados en formato GIVEN / WHEN / THEN para trazabilidad directa con los bloques test.step() de Playwright 
- Aislamiento por Page Object Model (POM): Cada caso evalúa una sola condición aislada por página (LoginPage, BillPayPage, AccountsOverviewPage, AccountActivityPage) utilizando datos deterministas e incrementales (Name001 a Name003, cuentas 111001 a 111003) 



# Automatización QA - ParaBank (Bill Pay)
Suite de pruebas automatizadas para el flujo de Pago de Servicios en ParaBank (Web con Playwright y API con Postman/Newman).

## 1. Estructura del Proyecto

- /casos: Matriz de casos de prueba en Excel (TC-Parabank-Billpay.xlsx).
- /web: Automatización Web con Playwright (pages/, data/, tests/).
- /api: Colección y entorno de Postman (.json).
- /performance: Plan de pruebas en Apache JMeter (.jmx).
- /evidencias: Capturas de reportes y defectos encontrados.
- /.github/workflows: Pipeline CI/CD en GitHub Actions (qa-pipeline.yml).

## 2. Actividades Completadas

- Diseño de 6 casos de prueba (3 automatizados y 3 manuales).
- Automatización Web con Playwright bajo patrón POM y pasos BDD (CP-01 Login, CP-02 Pago válido y CP-03 Pago $0).
- Automatización API con Postman y Newman para autenticación, consulta de cuentas, pagos y movimientos.
- Configuración de pipeline en GitHub Actions con uso de Secrets y guardado de reportes.
- Diseño de plan de rendimiento en JMeter (sin carga aplicada) y propuesta técnica de automatización móvil con Appium 2.

## 3. Cómo Reproducir las Pruebas

Requisitos: Node.js 20 o superior.

Ejecución Web (Playwright):
cd web
npm install
npx playwright install chromium
Crear archivo web/.env con PARABANK_USER y PARABANK_PASS.
npx playwright test --project=chromium

Ejecución API (Newman):
npx newman run api/ParaBank_API_Tests.postman_collection.json -e api/Parabank_testenv.postman_environment.json

## 4. Obstáculos y Limitaciones

-Defecto funcional en ParaBank (CP-03): El sistema acepta pagos con monto $0 mostrando confirmación de éxito. El test CP-03 falla de forma esperada para reportar este error.
- Reinicio del entorno público: La base de datos de ParaBank se reinicia periódicamente borrando usuarios creados. Se resolvió usando variables de entorno y selección dinámica de cuenta origen.
-Carga y Mobile: No se ejecutaron pruebas de carga en JMeter para no afectar el servidor público. La estrategia móvil quedó documentada para Android local y granjas cloud (BrowserStack/Sauce Labs) al no disponer de macOS ni instalador móvil.




# Pruebas de API (Postman / Newman)
Para validar la capa de servicios de ParaBank se armó una colección en Postman automatizada con scripts de validación y configurada para ejecutarse por consola mediante Newman dentro del flujo de CI/CD.

### Archivos principales (carpetas dentro del proyecto)
-api/ParaBank_API_Tests.postman_collection.json: Colección con los endpoints bajo prueba y sus aserciones.
-api/Parabank_testenv.postman_environment.json: Variables de entorno (baseUrl, customerId, accountId).

### Casos cubiertos y validaciones
-Consulta de cuentas (GET /customers/{customerId}/accounts): Valida respuesta -200 OK-, estructura del arreglo JSON, tipos de datos de los campos (id, customerId, type, balance) y que la cuenta pertenezca al cliente consultado.
-Historial de transacciones (GET /accounts/{accountId}/transactions): Valida estado -200 OK- y estructura de respuesta. Debido a que la base de datos de demostración de ParaBank se reinicia periódicamente, el script verifica dinámicamente si existen movimientos registrados antes de validar las propiedades de la transacción (id, accountId, type, date, amount, description) y el registro del débito (Bill Payment), evitando fallos por datos reiniciados en el servidor.

### Ejecución local
Para correr la colección desde la raíz del proyecto:

Terminal->
npx newman run api/ParaBank_API_Tests.postman_collection.json -e api/Parabank_testenv.postman_environment.json



# Pipeline CI/CD - GitHub Actions
Archivo: .github/workflows/qa-pipeline.yml

## Disparadores

- Push hacia las ramas main o master.
- Pull Request hacia main o master.
- Ejecución manual desde la pestaña Actions (workflow_dispatch).

## Pasos del Pipeline

- Descarga del código del repositorio y configuración de Node.js 20.
- Instalación de dependencias y del navegador Chromium en la carpeta web/.
- Ejecución de las pruebas automatizadas Web con Playwright usando los Secrets PARABANK_USER y PARABANK_PASS.
- Ejecución de la colección de pruebas API con Newman generando el reporte HTML.
- Publicación de los reportes de Playwright y Newman como artefactos descargables (Artifacts) en cada ejecución.



# Resultados, Evidencias y Defectos
## Ubicación de Evidencias y Documentación

- Carpeta /evidencias: Contiene las capturas de pantalla de los reportes HTML de Playwright, las capturas de ejecución de Postman Runner, los archivos JSON de resultados y las evidencias del defecto encontrado.
- Archivos README por módulo: El detalle técnico, pasos de ejecución, errores o fallas, y análisis específico de cada punto de la evaluación (casos, web, api, performance, pipeline y propuesta mobile) se encuentra documentado en su respectivo README dentro de cada carpeta del repositorio.
- GitHub Actions: Los reportes generados en cada ejecución del pipeline quedan disponibles para descarga en la sección/carpeta evidencias.



# Plan de Pruebas de Rendimiento - ParaBank (Apache JMeter)
Aqui explico el plan de pruebas de rendimiento (Get_Account_Transactions.jmx) diseñado en Apache JMeter 5.6.3 para evaluar el comportamiento de la API de consulta de movimientos de ParaBank.

--Nota de cumplimiento: El script queda listo para ejecutarse en un entorno autorizado. No se ejecutaron pruebas de carga ni estrés contra el entorno público de ParaBank.--

## 1. Endpoint Seleccionado y Justificación

Endpoint: GET /parabank/services/bank/accounts/{accountId}/transactions (Header Accept: application/json)

Frecuencia: Es la operación más consultada después de cada pago o transferencia para confirmar movimientos. Todos quieren saber el estado en que quedo la cuenta, saldos por salida de dinero o por ingreso.

Importancia: Si responde lento o falla, el usuario puede reintentar la operación y generar pagos dobles, a la misma cuenta sin necesidad de requerirlo.

Riesgo técnico: Devuelve todo el historial sin paginación, lo que incrementa el tamaño del payload y la carga de serialización bajo concurrencia.

## 2. Configuración del Script (.jmx)

Variables del Test Plan: HOST = parabank.parasoft.com y ACCOUNT_ID = 14898 (parametrizadas para evitar datos quemados).

Componentes: HTTP Header Manager, HTTP Request, Response Assertion (HTTP 200) y listeners (Summary Report, Aggregate Report).

Escenarios:
1. Carga Base: 5 usuarios virtuales, ramp-up de 10 s, 3 iteraciones (5 usuario * 3 iteraciones = 15 peticiones totales).
2. Carga Incremental: 20 usuarios virtuales, ramp-up de 40 s, 5 iteraciones (20 usuarios * 5 iteraciones = 100 peticiones totales).

## 3. Métricas Clave a Examinar

1. Tiempo de respuesta promedio (Average): Latencia media en milisegundos como referencia general.
2. Percentil 95 (95% Line): Tiempo máximo en el que responde el 95 % de las peticiones, descartando el 5 % de picos atípicos.
3. Throughput: Cantidad de peticiones por segundo atendidas por el servidor; detecta estancamientos o cuellos de botella.
4. Porcentaje de errores (Error %): Proporción de respuestas fallidas (HTTP 4xx/5xx o timeouts), cuyo umbral esperado en banca es 0 %.

## 4. Análisis de Escenario Simulado (Datos de Referencia)

Datos simulados: Con 5 usuarios el promedio es 450 ms, y 0% de errores; con 10 usuarios sube a 1.800 ms, y 8% de errores.

Riesgos: Degradación no lineal (4x más lento al duplicar usuarios), indisponibilidad inaceptable en banca (1 de cada 12 peticiones falla con carga mínima) y riesgo de sobrecarga por reintentos del usuario.

Investigación propuesta: Revisar códigos HTTP exactos en logs del servidor (500/503/504), analizar índices SQL, bloqueos (locks) y tamaño del pool de conexiones de BD, y monitorear CPU/memoria/hilos de la JVM.

Decisión de despliegue: Bloquear el paso a producción hasta optimizar la consulta/infraestructura y verificar que el error vuelva a 0 % con tiempos estables.


# Automatizacion mobile para posible APP ParaBank
#Guía Práctica de Automatización Mobile (Appium 2 + TypeScript)

Este documento reúne el flujo completo para configurar el entorno local, estructurar el framework de pruebas bajo Page Object Model (POM), y estructura BDD usado en la suite de pruebas



##1. Stack Técnico y Por Qué lo Elegimos

- Motor: Appium 2.x + Driver 'UiAutomator2' --> (Android).
- Cliente y Lenguaje: WebdriverIO con TypeScript en VS Code.
- No se eleige iOS, porque no tengo una maquina donde poderlo ejecutar, ni Mac ni celular Iphone

--Estrategia de Ejecución:--
- En local (Windows): Usamos el emulador de Android Studio (o un teléfono físico por USB) para escribir y depurar los scripts sin gastar recursos en la nube.
- En CI/CD (Bitbucket/Github): Como correr pruebas de iOS requiere una Mac física y correr muchas pruebas en paralelo consume demasiada memoria, desacoplamos las capabilities para mandar la ejecución a una granja cloud -> (BrowserStack / Sauce Labs). Esto permite validar simultáneamente distintos modelos físicos de Android (iOS no poque no hay una Mac) y obtener grabaciones de video y logs de red automáticos por cada ejecución.



##2. Preparación del Entorno Local (Windows)

Antes de codificar, necesitamos que Windows reconozca Java, Node y las herramientas de Android.

2.1. Instalaciones Base
- Descargar el instalador .msi de Node.js (v20 LTS o superior): Verifica en consola con 'node -v' y 'npm -v', la respuesta debe ser la version que se instalo.
- Java JDK (v17 o v21): Appium y las herramientas de Android necesitan Java para compilar y comunicarse con el teléfono. Instala el JDK y crea la variable de entorno 'JAVA_HOME' apuntando a la ruta de instalación (ej. 'C:\Program Files\Java\jdk-17').  Verifica con este texto en consola: java -version
- Android Studio + SDK:
   * Descarga e instalación: Descarga el instalador e instálalo con las opciones por defecto. Durante el asistente inicial (Setup Wizard), Android Studio descargará automáticamente la carpeta base del Android SDK (el kit de desarrollo que contiene los emuladores y herramientas de conexión con el celular).
   * Abrir SDK Manager y descarga una versión estable de Android.
   * En la pestaña SDK Platforms: Marca una versión estable de Android (ej. Android 14.0 ("UpsideDownCake") - API Level 34) y haz clic en Apply para que descargue la imagen del sistema.
     En la pestaña SDK Tools: Marca Android SDK Platform-Tools (aquí viene adb.exe para detectar dispositivos), Android Emulator y Android SDK Build-Tools, y haz clic en Apply para descargarlos.
   * Configura las variables de entorno en Windows:
     'ANDROID_HOME': 'C:\Users\<USUARIO>\AppData\Local\Android\Sdk'
     Edita la variable 'Path' y agrega:
       --> '%ANDROID_HOME%\platform-tools'
       --> '%ANDROID_HOME%\emulator'

Reinicia la terminal de windows para tomar los cambios.

2.2. Instalación de Appium 2 y Herramientas
Abre la terminal en VS Code y ejecuta:

Usando powershell
-Instalar Appium 2 de forma global
npm install -g appium

-Instalar el driver de Android
appium driver install uiautomator2

-Validar que todo esté bien conectado (no debe marcar errores en rojo)
appium driver doctor uiautomator2


NOTA: DescargaR también Appium Inspector desde su repositorio oficial en GitHub. Lo necesitarás para capturar los selectores de la pantalla.



#3. El Emulador y la APK de Prueba

A diferencia de una web que se abre en Chrome, aquí probamos una app nativa. Eso significa que debemos instalar el archivo '.apk' dentro del teléfono virtual.

-Encender el dispositivo: Abre el Virtual Device Manager en Android Studio y arranca tu dispositivo virtual (o conecta tu celular real con la Depuración USB activa).
-Verificar conexión con ADB: En la terminal ejecuta:  adb devices
     -- Debes ver algo como 'emulator-5554 device'. Si no aparece, el script no tendrá dónde correr. --

-Instalar la APK: Guarda el archivo '.apk' dentro de una carpeta '/apps' en tu proyecto. Puedes probar que la app sirve instalándola a mano una vez:  adb install ./apps/parabank.apk
   

#4. Estructura del Proyecto (POM en TypeScript)

¿Qué son las Capabilities ('config/capabilities.config.ts')?
Es el objeto de configuración que le dice a Appium qué teléfono abrir y qué app instalar. Aquí dejamos preparado el archivo para que funcione tanto en tu PC como en la nube (Granja):

**Aqui un ejemplo de archivo wdio.conf.ts (Configuración base y Local):**

import path from 'path';
import type { Options } from '@wdio/types';

export const config: Options.Testrunner = {
  runner: 'local',
  hostname: '127.0.0.1',
  port: 4723,
  path: '/',
  specs: ['./tests/**/*.ts'],
  maxInstances: 1,
  capabilities: [{
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:deviceName': 'emulator-5554',
    'appium:app': path.resolve(__dirname, './apps/parabank.apk'),
    'appium:autoGrantPermissions': true
  }],
  framework: 'mocha',
  reporters: ['spec']
};

**Un ejemplo de documento wdio.ci.conf.ts (Hereda la base y sobrescribe para Pipeline / Cloud):**

import { config as baseConfig } from './wdio.conf';

export const config = {
  ...baseConfig,
  user: process.env.BROWSERSTACK_USERNAME,
  key: process.env.BROWSERSTACK_ACCESS_KEY,
  services: ['browserstack'],
  capabilities: [{
    platformName: 'Android',
    'appium:deviceName': 'Samsung Galaxy S23',
    'appium:platformVersion': '13.0',
    'appium:automationName': 'UiAutomator2',
    'appium:app': process.env.BROWSERSTACK_APP_ID,
    'bstack:options': {
      projectName: 'ParaBank Mobile',
      buildName: 'CI Pipeline'
    }
  }]
};


#5. Flujo de Trabajo Diario en Local

- Levantar el servidor de Appium: En una terminal de VS Code escribe 'appium'. Puedes confirmar que está vivo entrando en tu navegador a 'http://127.0.0.1:4723/status'.
- Inspeccionar elementos: Abre Appium Inspector, pon los mismos datos de tu emulador local ('127.0.0.1', puerto '4723') y dale a Start Session. Prioriza siempre buscar por Accessibility ID ('-id') o Resource ID antes que usar XPaths largos.
- Programar el Page Object ('src/pages/billpay.page.ts'): Mapea los botones e inputs y crea métodos limpios (ej. 'completarPago(cuenta, monto)'). Nunca se pone un 'expect' aquí adentro.
- Programar el Test ('tests/billpay.test.ts'): Importa la página, ejecuta el flujo de usuario y al final haz las validaciones ('expect').
- Ejecutar la prueba: Abre una segunda terminal y ejecuta 'npm test'.


#6. Integración con CI/CD (Bitbucket/ Github Pipelines)

Cuando termines tus pruebas en local y subas tu Pull Request (PR) a Bitbucket/Github, el pipeline automatizará la ejecución en la granja de dispositivos.

6.1. Configurar Variables Secretas en Bitbucket/Github
Nunca escribas tus usuarios o contraseñas en el código, en ninguna carpeta ni clase.
- Ve a tu repositorio en Bitbucket/github-> Repository Settings ->Repository variables
- Crea 'BS_USER' y 'BS_KEY' con tus credenciales de la granja y marca la casilla Secured

6.2. Archivo 'bitbucket-pipelines.yml'
Como el celular real está en la granja (en otro servidor) y no dentro de Bitbucket, el primer paso del pipeline es enviarle la APK por internet usando 'curl' antes de correr los tests:

6.3 Archivo '.github/workflows/mobile-tests.yml' en github. Este archivo .yml debe estar dentro de .github/workflows/


#7. Revisión de Resultados y Evidencias

- En Local: Revisa los logs directos en la terminal de VS Code o abre el reporte HTML generado.
- En Bitbucket: Entra a la pestaña Pipelines, haz clic en la ejecución de tu PR y ve al panel derecho ('Artifacts') para descargar el '.zip' con los reportes y capturas de pantalla.
- En Github hay que ir hasta el cuadro Checks, y ver el estado del workflow.
- En la Granja (BrowserStack / Sauce Labs): Entra a su plataforma web para ver el video completo de la ejecución en el celular real, los logs de red y la traza exacta en caso de que algún paso haya fallado.
