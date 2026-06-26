const fs = require('fs');
const readline = require('readline');

const logPath = 'C:/Users/ravip/.gemini/antigravity/brain/b0d98e3d-627e-4107-9472-47f8797c5328/.system_generated/logs/transcript.jsonl';

const fileStream = fs.createReadStream(logPath);
const rl = readline.createInterface({
  input: fileStream,
  crlfDelay: Infinity
});

let lineNumber = 0;
rl.on('line', (line) => {
  lineNumber++;
  if (line.includes('mongodb+srv') || line.includes('mongodb.net')) {
    console.log(`Line ${lineNumber} matches:`);
    // Find strings matching mongodb+srv
    const match = line.match(/mongodb\+srv:\/\/[^\s"']+/g);
    if (match) {
      console.log('Found URIs:', match);
    } else {
      console.log(line.substring(0, 500));
    }
  }
});

rl.on('close', () => {
  console.log('Search complete.');
});
