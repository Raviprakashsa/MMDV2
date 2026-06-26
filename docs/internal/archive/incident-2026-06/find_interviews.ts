import fs from 'fs'
import path from 'path'

const SEARCH_DIR = 'C:\\Users\\ravip\\.gemini\\antigravity\\brain'
const PATTERNS = ['L-01', 'L-04', 'L-05', 'L-06', 'L-07', 'L-08', 'L-09', 'L-10']

function searchFile(filePath: string) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    // Check if it's a log or a system generated file
    const isSystemGenerated = filePath.includes('.system_generated') || filePath.includes('node_modules') || filePath.includes('.next')
    
    // We are looking for files containing multiple of these pattern terms
    let matchCount = 0
    for (const pattern of PATTERNS) {
      if (content.includes(pattern)) {
        matchCount++
      }
    }
    
    // If it contains multiple lead patterns and is NOT a system generated file, it is highly likely to be our interview text!
    if (matchCount >= 2 && !isSystemGenerated) {
      console.log(`\n==================================================`)
      console.log(`POSSIBLE INTERVIEW FILE FOUND: ${filePath}`)
      console.log(`Match Count: ${matchCount}`)
      console.log(`--------------------------------------------------`)
      console.log(content.substring(0, 2000)) // Print first 2000 chars of the file
      console.log(`==================================================\n`)
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
        traverse(fullPath)
      } else if (stat.isFile()) {
        searchFile(fullPath)
      }
    }
  } catch (err) {
    // Ignore read errors
  }
}

console.log(`Starting scan in ${SEARCH_DIR}...`)
traverse(SEARCH_DIR)
console.log('Scan complete.')
