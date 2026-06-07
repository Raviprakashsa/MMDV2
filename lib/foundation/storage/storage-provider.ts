export interface UploadObjectInput {
  key: string
  body: Buffer
  contentType: string
}

export interface StorageProvider {
  putObject(input: UploadObjectInput): Promise<void>
  getObject(key: string): Promise<Buffer>
  deleteObject(key: string): Promise<void>
  getPublicUrl?(key: string): string
}
