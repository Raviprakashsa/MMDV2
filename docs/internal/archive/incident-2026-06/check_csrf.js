const https = require('https');

const url = 'https://mmd-recruit-crm.blackbay-54673e45.centralindia.azurecontainerapps.io/api/auth/csrf';

https.get(url, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`Response body:`, data);
  });
}).on('error', (err) => {
  console.error('Error connecting:', err.message);
});
