
# Postman Collection Updater

Postman Collection Updater es una herramienta automatizada para la creación y actualización de workspaces en Postman a partir de especificaciones OpenAPI. Permite gestionar múltiples APIs, centralizando su configuración y despliegue a través de un solo proceso. Este proyecto está orientado a desarrolladores que necesiten mantener actualizadas las colecciones de Postman en diversos entornos y workspaces.

## Índice de Contenidos

- [Introducción](#introducción)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Uso](#uso)
- [Despliegue](#despliegue)
- [Dependencias](#dependencias)
- [Errores Comunes y Soluciones](#errores-comunes-y-soluciones)
- [Contribución](#contribución)
- [Licencia](#licencia)

## Introducción

Este proyecto facilita la integración continua de colecciones Postman mediante el uso de un archivo Excel que contiene información sobre workspaces, entornos y las rutas de las especificaciones OpenAPI. El script:

1. Lee un archivo Excel con la información de workspaces y entornos.
2. Valida la existencia de cada workspace en Postman; si no existe, lo crea.
3. Importa las especificaciones OpenAPI correspondientes a cada workspace, actualizando las colecciones según la información proveída.

Está dirigido principalmente a desarrolladores que gestionan múltiples APIs en Postman y desean automatizar la creación, validación y actualización de colecciones y entornos.

## Requisitos Previos

- **Node.js**: versión 14 o superior.
- **npm**: para instalación de dependencias.
- **Clave de API de Postman**: necesaria para interactuar con la API de Postman.
- **Archivo Excel (data.xlsx)**: con el listado de workspaces, entornos y URLs de especificaciones.

## Instalación

Para instalar el proyecto, ejecute los siguientes comandos:

```bash
git clone <URL-del-repositorio>
cd postman-collection-updater
npm install
```

## Configuración

Antes de ejecutar el proyecto, es necesario configurar las variables de entorno en un archivo `.env`:

```env
POSTMAN_API_KEY=<Tu-clave-de-API>
EXCEL_FILE_PATH=./data.xlsx
```

Asegúrese de colocar la clave de API de Postman en `POSTMAN_API_KEY` y ajustar la ruta del archivo Excel si fuera necesario.

### Estructura del Archivo Excel

El archivo Excel debe contener una hoja (por defecto `Sheet1`) con las siguientes columnas:

| workspaceName | defaultBaseUrl     | yamlUrl                            | environment |
|---------------|--------------------|-------------------------------------|-------------|
| MyAPI         | https://api.test   | https://example.com/openapi.json    | dev         |
| MyAPI         | https://api.prod   | https://example.com/openapi.yaml    | prod        |

- **workspaceName**: Nombre del workspace en Postman.
- **defaultBaseUrl**: URL base por defecto del entorno.
- **yamlUrl**: URL del archivo OpenAPI en formato json.
- **environment**: Nombre del entorno (ej. `dev`, `prod`).

## Uso

Para ejecutar el script, utilice el siguiente comando:

```bash
node updateCollection.js
```

Al ejecutarse, el script realizará las siguientes acciones:

1. **Lectura del Excel**: Carga la información de workspaces, entornos y URLs YAML.
2. **Validación o Creación de Workspaces**: Verifica si los workspaces existen en Postman y los crea en caso contrario.
3. **Importación de Especificaciones**: Carga las especificaciones OpenAPI en el workspace correspondiente, actualizando o creando las colecciones.

Una vez finalizado, tendrá actualizados sus workspaces en Postman con las colecciones generadas a partir de las especificaciones indicadas.

## Despliegue

Para un entorno de producción o servidor:

1. **Preparar Entorno**:  
   - Instalar Node.js en el servidor.
   - Clonar el repositorio y ejecutar `npm install`.
   
2. **Configurar Variables de Entorno**:  
   Ajuste el `.env` con la clave de API de Postman y la ruta correcta del archivo Excel.

3. **Automatización (Opcional)**:  
   Puede configurar un cron job para ejecutar `node updateCollection.js` periódicamente. Por ejemplo, usando `crontab` en Linux:

   ```bash
   # Ejecutar el script todos los días a las 02:00 AM
   0 2 * * * /usr/bin/node /ruta/a/postman-collection-updater/updateCollection.js
   ```

## Dependencias

El proyecto utiliza las siguientes dependencias:

- [axios](https://www.npmjs.com/package/axios): Para realizar solicitudes HTTP a la API de Postman.
- [xlsx](https://www.npmjs.com/package/xlsx): Para leer y procesar el archivo Excel.
- [dotenv](https://www.npmjs.com/package/dotenv): Para la carga de variables de entorno desde el archivo `.env`.

## Errores Comunes y Soluciones

- **Archivo Excel no encontrado**:  
  Asegúrese de que `EXCEL_FILE_PATH` en el `.env` apunte a la ubicación correcta del archivo. Por defecto es `./data.xlsx`.

- **Clave de API inválida**:  
  Verifique que `POSTMAN_API_KEY` sea correcta y siga las pautas de autenticación de la [API de Postman](https://www.postman.com/postman/workspace/postman-public-api/overview).

- **URLs YAML inaccesibles**:  
  Compruebe que las URLs proporcionadas en el Excel sean correctas y accesibles. Si existe un problema de SSL, verifique los certificados o pruebe con conexiones HTTP.

