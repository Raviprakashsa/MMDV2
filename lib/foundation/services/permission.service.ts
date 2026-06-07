export class PermissionService {
  private permissionRepo: any

  constructor(opts: { permissionRepo: any }) {
    this.permissionRepo = opts.permissionRepo
  }

  async list() {
    return this.permissionRepo.listAll()
  }

  async lookup(id: string) {
    const p = await this.permissionRepo.findById(id)
    if (!p) throw new Error('Permission not found')
    return p
  }
}
