type TenantContext = { tenantId: string; userId?: string; roles?: string[] }

export class UserService {
  private userRepo: any
  private roleRepo: any

  constructor(opts: { userRepo: any; roleRepo: any }) {
    this.userRepo = opts.userRepo
    this.roleRepo = opts.roleRepo
  }

  private ensureTenant(ctx: TenantContext, tenantId: string) {
    if (!ctx || ctx.tenantId !== tenantId) throw new Error('Tenant mismatch')
  }

  async create(ctx: TenantContext, data: { tenantId: string; email: string; name?: string; passwordHash: string; roleId?: string }) {
    this.ensureTenant(ctx, data.tenantId)
    // business rule: unique email per tenant
    const existing = await this.userRepo.findByEmail(ctx, data.email)
    if (existing) throw new Error('User with that email already exists')
    // prepare repository input (ensure required fields have defaults if omitted)
    const input = {
      email: data.email,
      passwordHash: data.passwordHash,
      name: data.name ?? '',
      roleId: data.roleId ?? '',
    }
    // delegate to repository with TenantContext
    return this.userRepo.create(ctx, input)
  }

  async list(ctx: TenantContext) {
    return this.userRepo.listByTenant(ctx)
  }

  async get(ctx: TenantContext, id: string) {
    const u = await this.userRepo.findById(ctx, id)
    if (!u) throw new Error('User not found')
    this.ensureTenant(ctx, u.tenantId)
    return u
  }

  async update(ctx: TenantContext, id: string, updates: Record<string, any>) {
    const u = await this.userRepo.findById(ctx, id)
    if (!u) throw new Error('User not found')
    this.ensureTenant(ctx, u.tenantId)
    return this.userRepo.updateById(id, updates)
  }

  async activate(ctx: TenantContext, id: string) {
    const u = await this.userRepo.findById(ctx, id)
    if (!u) throw new Error('User not found')
    this.ensureTenant(ctx, u.tenantId)
    return this.userRepo.updateById(id, { ... ( { active: true } as any) })
  }

  async deactivate(ctx: TenantContext, id: string) {
    const u = await this.userRepo.findById(ctx, id)
    if (!u) throw new Error('User not found')
    this.ensureTenant(ctx, u.tenantId)
    return this.userRepo.updateById(id, { ... ( { active: false } as any) })
  }

  async assignRole(ctx: TenantContext, userId: string, roleId: string) {
    const u = await this.userRepo.findById(ctx, userId)
    if (!u) throw new Error('User not found')
    this.ensureTenant(ctx, u.tenantId)
    const role = await this.roleRepo.findById(ctx, roleId)
    if (!role) throw new Error('Role not found')
    if (role.tenantId !== ctx.tenantId) throw new Error('Role belongs to different tenant')
    // repository does not expose assignRole; update user's role via updateById
    return this.userRepo.updateById(userId, { roleId })
  }
}
