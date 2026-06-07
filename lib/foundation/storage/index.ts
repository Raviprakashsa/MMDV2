import path from 'node:path'
import type { StorageProvider } from '@/lib/foundation/storage/storage-provider'
import { LocalStorageProvider } from '@/lib/foundation/storage/providers/local-storage.provider'
import { S3StorageProvider } from '@/lib/foundation/storage/providers/s3-storage.provider'

function getStorageDriver() {
  return (process.env.STORAGE_DRIVER || 'local').toLowerCase()
}

export function createStorageProvider(): StorageProvider {
  const driver = getStorageDriver()

  if (driver === 's3') {
    // A0 scope: S3 adapter remains interface-only; local provider is production path for now.
    return new S3StorageProvider({
      bucket: process.env.S3_BUCKET || '',
      region: process.env.S3_REGION || 'us-east-1',
      accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
      endpoint: process.env.S3_ENDPOINT,
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
    })
  }

  const localRoot = process.env.LOCAL_STORAGE_ROOT || path.join(process.cwd(), '.storage')
  return new LocalStorageProvider(localRoot)
}
