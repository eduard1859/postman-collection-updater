const axios = require('axios');
const XLSX = require('xlsx');

require('dotenv').config();

// Ruta al archivo Excel
const excelFilePath = process.env.EXCEL_FILE_PATH;;

// Clave de API de Postman
const postmanApiKey = process.env.POSTMAN_API_KEY;;

// Función para leer los datos desde el Excel
function readDataFromExcel(filePath) {
  const workbook = XLSX.readFile(filePath);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
  // Se asume que la primera fila contiene cabeceras
  const headers = rows[0];
  const data = rows.slice(1).map((row) => {
    const rowData = {};
    headers.forEach((header, index) => {
      rowData[header] = row[index];
    });
    return rowData;
  });

  return data;
}

// Validar si el workspace existe
async function getWorkspaceIdByName(name) {
  try {
    const response = await axios.get('https://api.getpostman.com/workspaces', {
      headers: { 'X-API-Key': postmanApiKey },
    });
    const workspace = response.data.workspaces.find((ws) => ws.name === name);
    return workspace ? workspace.id : null;
  } catch (error) {
    console.error('Error fetching workspaces:', error.response?.data || error.message);
    throw error;
  }
}

// Crear un nuevo workspace
async function createWorkspace(name) {
  try {
    const response = await axios.post(
      'https://api.getpostman.com/workspaces',
      {
        workspace: {
          name,
          type: 'personal', // Cambiar a 'team' si se trabaja en equipo
          description: `Workspace created for ${name}`,
        },
      },
      {
        headers: {
          'X-API-Key': postmanApiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.workspace.id;
  } catch (error) {
    console.error('Error creating workspace:', error.response?.data || error.message);
    throw error;
  }
}

// Importar el archivo OpenAPI
async function importOpenApi(workspaceId, yamlUrl, defaultBaseUrl) {
  try {
    console.log('Fetching YAML from:', yamlUrl);
    const yamlResponse = await axios.get(yamlUrl);
    const yamlContent = yamlResponse.data;

    if (!yamlContent.servers || yamlContent.servers.length === 0) {
      console.log(`No se encontraron servidores en la especificación. Añadiendo URL base por defecto: ${defaultBaseUrl}`);
      yamlContent.servers = [{ url: defaultBaseUrl, description: 'Default server' }];
    }

    console.log('Creating collection in workspace:', workspaceId);
    const postmanResponse = await axios.post(
      `https://api.getpostman.com/import/openapi?workspace=${workspaceId}`,
      { type: 'file', input: yamlContent },
      {
        headers: {
          'X-API-Key': postmanApiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Collection imported successfully:', postmanResponse.data);
  } catch (error) {
    console.error('Error importing OpenAPI spec:', error.response?.data || error.message);
  }
}

// Procesar una fila del Excel
async function processWorkspaceRow(rowData) {
  let { workspaceName, defaultBaseUrl, yamlUrl, environment } = rowData;

  workspaceName = workspaceName + "-" + environment
  // Muestra la información leída
  console.log(`\nProcesando Workspace: ${workspaceName}`);
  console.log(`Entorno: ${environment}`);
  console.log(`Base URL por defecto: ${defaultBaseUrl}`);
  console.log(`YAML URL: ${yamlUrl}`);

  try {
    console.log(`Checking if workspace "${workspaceName}" exists...`);
    let workspaceId = await getWorkspaceIdByName(workspaceName);

    if (!workspaceId) {
      console.log(`Workspace "${workspaceName}" not found. Creating it...`);
      workspaceId = await createWorkspace(workspaceName);
      console.log(`Workspace "${workspaceName}" created with ID: ${workspaceId}`);
    } else {
      console.log(`Workspace "${workspaceName}" already exists with ID: ${workspaceId}`);
    }

    // Importar la especificación al workspace
    await importOpenApi(workspaceId, yamlUrl, defaultBaseUrl);

  } catch (error) {
    console.error('Error in process:', error.message);
  }
}

// Flujo principal
(async () => {
  // Leer datos del archivo Excel
  const rows = readDataFromExcel(excelFilePath);

  // Por cada fila, procesar el workspace correspondiente
  for (const row of rows) {
    // Asegurarse de que la fila contenga los campos necesarios
    if (row.workspaceName && row.defaultBaseUrl && row.yamlUrl && row.environment) {
      await processWorkspaceRow(row);
    } else {
      console.warn('Fila inválida o faltan campos requeridos:', row);
    }
  }
})();
