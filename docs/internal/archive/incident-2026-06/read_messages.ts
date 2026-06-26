import fs from 'fs'
import path from 'path'

const MESSAGES_DIR = 'C:\\Users\\ravip\\.gemini\\antigravity\\brain\\b0d98e3d-627e-4107-9472-47f8797c5328\\.system_generated\\messages'

try {
  const files = fs.readdirSync(MESSAGES_DIR)
  for (const file of files) {
    if (file.endsWith('.json') && file !== 'cursor.json' && file !== 'read.json') {
      const filePath = path.join(MESSAGES_DIR, file)
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
      
      // Let's print summary of message
      const content = data.content || ''
      if (content.includes('L-01') || content.includes('interview') || content.includes('recruiter') || content.includes('Apex')) {
        console.log(`==================================================`)
        console.log(`MESSAGE FILE: ${file}`)
        console.log(`SENDER: ${data.sender} | RECIPIENT: ${data.recipient}`)
        console.log(`CONTENT EXCERPT:`)
        console.log(content.substring(0, 1000))
        console.log(`==================================================\n`)
      }
    }
  }
} catch (err) {
  console.error(err)
}
