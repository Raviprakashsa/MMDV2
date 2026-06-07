import type { StorageProvider, UploadObjectInput } from '@/lib/foundation/storage/storage-provider'

interface S3Config {
  bucket: string
  region: string
  accessKeyId: string
  secretAccessKey: string
  endpoint?: string
  forcePathStyle?: boolean
}

export class S3StorageProvider implements StorageProvider {
  constructor(private readonly config: S3Config) {}

  async putObject(_input: UploadObjectInput): Promise<void> {
    throw new Error('S3 provider is interface-only in A0. Enable in a later phase.')
  }

  async getObject(_key: string): Promise<Buffer> {
    throw new Error('S3 provider is interface-only in A0. Enable in a later phase.')
  }

  async deleteObject(_key: string): Promise<void> {
    throw new Error('S3 provider is interface-only in A0. Enable in a later phase.')
  }

  getPublicUrl(key: string): string {
    return `https://${this.config.bucket}.s3.${this.config.region}.amazonaws.com/${key}`
  }
}
