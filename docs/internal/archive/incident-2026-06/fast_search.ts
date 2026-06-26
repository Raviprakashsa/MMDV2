import fs from 'fs'
import path from 'path'

const SEARCH_DIR = 'C:\\Users\\ravip\\.gemini\\antigravity\\brain'
const EXCLUDE_DIRS = ['node_modules', '.next', '.git', '.venv', 'dist', 'build']
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
    // Ignore binary or read errors
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

console.log(`Starting fast search in ${SEARCH_DIR}...`)
traverse(SEARCH_DIR)
console.log('Search complete.')
