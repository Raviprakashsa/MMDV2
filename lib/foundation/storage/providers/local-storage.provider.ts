import { promises as fs } from 'node:fs'
import path from 'node:path'
import type { StorageProvider, UploadObjectInput } from '@/lib/foundation/storage/storage-provider'

export class LocalStorageProvider implements StorageProvider {
  constructor(private readonly rootDir: string) {}

  private resolvePath(key: string) {
    const safeKey = key.replace(/\\/g, '/').replace(/\.\./g, '')
    return path.resolve(this.rootDir, safeKey)
  }

  async putObject(input: UploadObjectInput): Promise<void> {
    const outputPath = this.resolvePath(input.key)
    await fs.mkdir(path.dirname(outputPath), { recursive: true })
    await fs.writeFile(outputPath, input.body)
  }

  async getObject(key: string): Promise<Buffer> {
    return fs.readFile(this.resolvePath(key))
  }

  async deleteObject(key: string): Promise<void> {
    await fs.rm(this.resolvePath(key), { force: true })
  }

  getPublicUrl(key: string): string {
    return `/storage/${key}`
  }
}
