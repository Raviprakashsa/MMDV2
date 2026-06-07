type TenantContext = { tenantId: string; userId?: string; roles?: string[] }

export class SessionService {
  private sessionRepo: any
  private userRepo: any

  constructor(opts: { sessionRepo: any; userRepo: any }) {
    this.sessionRepo = opts.sessionRepo
    this.userRepo = opts.userRepo
  }

  private ensureTenant(ctx: TenantContext, tenantId: string) {
    if (!ctx || ctx.tenantId !== tenantId) throw new Error('Tenant mismatch')
  }

  async create(ctx: TenantContext, data: { tenantId: string; userId: string; expiresAt: string }) {
    this.ensureTenant(ctx, data.tenantId)
    const u = await this.userRepo.findById(ctx, data.userId)
    if (!u) throw new Error('User not found')
    if (u.tenantId !== ctx.tenantId) throw new Error('User belongs to different tenant')
    return this.sessionRepo.create(ctx, { id: (data as any).id ?? '', userId: data.userId, refreshTokenHash: null, expiresAt: new Date(data.expiresAt) })
  }

  async revoke(ctx: TenantContext, sessionId: string) {
    const s = await this.sessionRepo.findById(ctx, sessionId)
    if (!s) throw new Error('Session not found')
    this.ensureTenant(ctx, s.tenantId)
    return this.sessionRepo.revokeById(ctx, sessionId)
  }

  async cleanupExpired() {
    // system-level operation; find expired sessions and revoke/delete
    // repository exposes cleanupExpired(now) which marks expired sessions deleted
    const now = new Date()
    const result = await this.sessionRepo.cleanupExpired(now)
    // repo returns a prisma update result; service will return number of affected records if available
    if (result && (result as any).count !== undefined) return (result as any).count
    return 0
  }

  async list(ctx: TenantContext) {
    return this.sessionRepo.listByTenant(ctx)
  }
}
