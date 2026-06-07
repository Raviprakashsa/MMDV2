type TenantContext = { tenantId: string; userId?: string; roles?: string[] }

export class RolePermissionService {
  private roleRepo: any
  private permissionRepo: any
  private rolePermissionRepo: any

  constructor(opts: { roleRepo: any; permissionRepo: any; rolePermissionRepo: any }) {
    this.roleRepo = opts.roleRepo
    this.permissionRepo = opts.permissionRepo
    this.rolePermissionRepo = opts.rolePermissionRepo
  }

  private ensureTenant(ctx: TenantContext, tenantId: string) {
    if (!ctx || ctx.tenantId !== tenantId) throw new Error('Tenant mismatch')
  }

  async assign(ctx: TenantContext, roleId: string, permissionId: string) {
    const role = await this.roleRepo.findById(ctx, roleId)
    if (!role) throw new Error('Role not found')
    if (role.tenantId !== ctx.tenantId) throw new Error('Role belongs to different tenant')
    const perm = await this.permissionRepo.findById(permissionId)
    if (!perm) throw new Error('Permission not found')
    // prevent duplicate
    const existing = await this.rolePermissionRepo.find(roleId, permissionId)
    if (existing) return existing
    // repository exposes assign(roleId, permissionId)
    return this.rolePermissionRepo.assign(roleId, permissionId)
  }

  async remove(ctx: TenantContext, roleId: string, permissionId: string) {
    const role = await this.roleRepo.findById(ctx, roleId)
    if (!role) throw new Error('Role not found')
    if (role.tenantId !== ctx.tenantId) throw new Error('Role belongs to different tenant')
    return this.rolePermissionRepo.unassign(roleId, permissionId)
  }
}
