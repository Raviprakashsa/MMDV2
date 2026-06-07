import { z } from 'zod'

export const createUserSchema = z.object({ email: z.string().email(), name: z.string().optional(), passwordHash: z.string(), roleId: z.string().optional() })
export const updateUserSchema = z.object({ name: z.string().optional(), roleId: z.string().optional() })

export const createRoleSchema = z.object({ name: z.string().min(1), description: z.string().optional() })
export const updateRoleSchema = z.object({ name: z.string().min(1).optional(), description: z.string().optional() })

export const assignPermissionSchema = z.object({ permissionId: z.string().min(1) })
