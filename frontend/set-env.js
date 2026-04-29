const fs = require('fs');
const path = require('path');

const environmentFilePath = path.join(__dirname, '../src/environments/environment.ts');

const apiHostIp = process.env.APP_HOST_IP || 'localhost'; // Default to localhost if not set
const apiUrl = `http://${apiHostIp}:3001/api`;

const environmentContent = `export const environment = {
  production: false,
  apiUrl: '${apiUrl}',
};
`;

fs.writeFileSync(environmentFilePath, environmentContent);
console.log(`Generated environment.ts with apiUrl: ${apiUrl}`);