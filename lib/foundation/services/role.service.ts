type TenantContext = { tenantId: string; userId?: string; roles?: string[] }

export class RoleService {
  private roleRepo: any

  constructor(opts: { roleRepo: any }) {
    this.roleRepo = opts.roleRepo
  }

  async list(ctx: TenantContext) {
    return this.roleRepo.listByTenant(ctx)
  }

  async get(ctx: TenantContext, id: string) {
    const r = await this.roleRepo.findById(ctx, id)
    if (!r) throw new Error('Role not found')
    this.ensureTenant(ctx, r.tenantId)
    return r
  }

  private ensureTenant(ctx: TenantContext, tenantId: string) {
    if (!ctx || ctx.tenantId !== tenantId) throw new Error('Tenant mismatch')
  }

  async create(ctx: TenantContext, data: { tenantId: string; name: string; description?: string }) {
    this.ensureTenant(ctx, data.tenantId)
    // repository exposes findByCode(context, code) and create(context, input)
    // prefer to require `code` in input for uniqueness; if only name provided, skip code-check
    const code = (data as any).code
    if (code) {
      const existing = await this.roleRepo.findByCode(ctx, code)
      if (existing) throw new Error('Role already exists')
    }
    return this.roleRepo.create(ctx, { code: code ?? '', name: data.name, description: data.description, isSystem: false })
  }

  async update(ctx: TenantContext, id: string, updates: Record<string, any>) {
    const r = await this.roleRepo.findById(ctx, id)
    if (!r) throw new Error('Role not found')
    this.ensureTenant(ctx, r.tenantId)
    return this.roleRepo.updateById(id, updates)
  }

  async activate(ctx: TenantContext, id: string) {
    const r = await this.roleRepo.findById(ctx, id)
    if (!r) throw new Error('Role not found')
    this.ensureTenant(ctx, r.tenantId)
    return this.roleRepo.updateById(id, { ... ( { active: true } as any) })
  }

  async deactivate(ctx: TenantContext, id: string) {
    const r = await this.roleRepo.findById(ctx, id)
    if (!r) throw new Error('Role not found')
    this.ensureTenant(ctx, r.tenantId)
    return this.roleRepo.updateById(id, { ... ( { active: false } as any) })
  }
}
