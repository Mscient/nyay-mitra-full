import https from 'https';
import fs from 'fs';
import path from 'path';

let apiKey = 'dummy_key';
try {
  const envFile = fs.readFileSync(path.resolve('.env'), 'utf8');
  const match = envFile.match(/^SARVAM_API_KEY=(.*)$/m);
  if (match && match[1]) {
    apiKey = match[1].trim();
  }
} catch (e) {
  console.warn("Could not read .env file, using dummy key.");
}

const data = JSON.stringify({
  model: "sarvam-m",
  messages: [{ role: "user", content: "hello" }],
  temperature: 0.4,
  max_tokens: 10
});

const options = {
  hostname: 'api.sarvam.ai',
  path: '/v1/chat/completions',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'API-Subscription-Key': apiKey
  }
};

const req = https.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`);
  res.on('data', d => process.stdout.write(d));
});

req.on('error', error => console.error(error));
req.write(data);
req.end();
