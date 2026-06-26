import fs from 'fs'
import path from 'path'

const SIBLINGS = [
  'C:\\Users\\ravip\\.gemini\\antigravity\\brain\\e553d4e1-fe9f-453c-bda4-66b1fcd0a2a5',
  'C:\\Users\\ravip\\.gemini\\antigravity\\brain\\ecf0785e-b725-43ca-a2db-84cf38a140c1',
  'C:\\Users\\ravip\\.gemini\\antigravity\\brain\\fa84fd53-fc3c-48ad-b7ce-437f3a17b8cf'
]
const EXCLUDE_DIRS = ['node_modules', '.next', '.git', '.venv']
const PATTERNS = ['Apex Staffing', 'Priya Sharma', 'Rajesh Kumar', 'L-01', 'L-04', 'L-05', 'L-10']

function searchFile(filePath: string) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    for (const pattern of PATTERNS) {
      if (content.includes(pattern)) {
        console.log(`FOUND "${pattern}" in: ${filePath}`)
      }
    }
  } catch (err) {
    // Ignore binary/read errors
  }
}

function traverse(dir: string) {
  try {
    const files = fs.readdirSync(dir)
    for (const file of files) {
      const fullPath = path.join(dir, file)
      const stat = fs.statSync(fullPath)
      if (stat.isDirectory()) {
        if (!EXCLUDE_DIRS.includes(file)) {
          traverse(fullPath)
        }
      } else if (stat.isFile()) {
        searchFile(fullPath)
      }
    }
  } catch (err) {
    // Ignore read errors
  }
}

for (const sibling of SIBLINGS) {
  console.log(`Searching sibling brain: ${sibling}...`)
  traverse(sibling)
}
console.log('Search complete.')
