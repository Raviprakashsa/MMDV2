const https = require('https');

const baseUrl = 'https://mmd-recruit-crm.blackbay-54673e45.centralindia.azurecontainerapps.io';
const adminEmail = 'admin@magnuscopo.com';
const adminPassword = 'Admin123!';

function makeRequest(url, method, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: method,
      headers: headers
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(body);
    }
    req.end();
  });
}

async function run() {
  try {
    console.log('1. Fetching CSRF Token...');
    const csrfRes = await makeRequest(`${baseUrl}/api/auth/csrf`, 'GET');
    console.log(`CSRF Status: ${csrfRes.status}`);
    const csrfData = JSON.parse(csrfRes.body);
    const csrfToken = csrfData.csrfToken;
    console.log(`CSRF Token: ${csrfToken}`);
    
    // Grab cookies from CSRF response
    const csrfCookies = csrfRes.headers['set-cookie'] || [];
    console.log('CSRF Cookies:', csrfCookies);
    const cookieHeader = csrfCookies.map(c => c.split(';')[0]).join('; ');

    console.log('\n2. Posting Credentials Callback...');
    const postBody = new URLSearchParams();
    postBody.set('email', adminEmail);
    postBody.set('password', adminPassword);
    postBody.set('csrfToken', csrfToken);
    postBody.set('callbackUrl', `${baseUrl}/dashboard`);
    postBody.set('json', 'true');

    const callbackRes = await makeRequest(
      `${baseUrl}/api/auth/callback/credentials`,
      'POST',
      {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': cookieHeader
      },
      postBody.toString()
    );

    console.log(`Callback Status: ${callbackRes.status}`);
    console.log(`Callback Headers:`, callbackRes.headers);
    console.log(`Callback Body:`, callbackRes.body);

    const sessionCookies = callbackRes.headers['set-cookie'] || [];
    console.log('Session Cookies:', sessionCookies);

    const allCookies = [...csrfCookies, ...sessionCookies].map(c => c.split(';')[0]).join('; ');

    console.log('\n3. Fetching Session Status...');
    const sessionRes = await makeRequest(
      `${baseUrl}/api/auth/session`,
      'GET',
      {
        'Cookie': allCookies
      }
    );

    console.log(`Session Status: ${sessionRes.status}`);
    console.log(`Session Body:`, sessionRes.body);
  } catch (err) {
    console.error('Error during test:', err);
  }
}

run();
