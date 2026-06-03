import { readFileSync, readdirSync, statSync } from 'fs'
import { join, extname } from 'path'

const SRC = join(import.meta.dirname, '..', 'src')
const MAX_LINES = 500
const MAX_FILE_SIZE_BYTES = 100 * 1024

let failed = false

function walk(dir: string): void {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '__tests__') walk(full)
    } else if (entry.isFile()) {
      const ext = extname(entry.name)
      if (['.ts', '.tsx'].includes(ext)) {
        const content = readFileSync(full, 'utf8')
        const lines = content.split('\n').length
        if (lines > MAX_LINES) {
          console.error(`FAIL: ${full.replace(SRC + '\\', '')} has ${lines} lines (max ${MAX_LINES})`)
          failed = true
        }
      } else if (entry.name === 'pixel.css') {
        const size = statSync(full).size
        if (size > MAX_FILE_SIZE_BYTES) {
          console.error(`FAIL: ${full.replace(SRC + '\\', '')} is ${size} bytes (max ${MAX_FILE_SIZE_BYTES})`)
          failed = true
        }
      }
    }
  }
}

walk(SRC)

if (failed) {
  console.error('\nSome files exceed limits.')
  process.exit(1)
} else {
  console.log('All files within limits.')
}
