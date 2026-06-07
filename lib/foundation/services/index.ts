import { userRepository } from '@/lib/foundation/repositories/user.repository'
import { roleRepository } from '@/lib/foundation/repositories/role.repository'
import { permissionRepository } from '@/lib/foundation/repositories/permission.repository'
import { rolePermissionRepository } from '@/lib/foundation/repositories/role-permission.repository'
import { sessionRepository } from '@/lib/foundation/repositories/session.repository'

import { UserService } from './user.service'
import { RoleService } from './role.service'
import { PermissionService } from './permission.service'
import { RolePermissionService } from './role-permission.service'
import { SessionService } from './session.service'
import { CompanyService } from './company.service'
import { ContactService } from './contact.service'
import { LeadService } from './lead.service'
import { jobPostingService } from './job-posting.service'
import { candidateService } from './candidate.service'
import { applicationService } from './application.service'
import { interviewService } from './interview.service'

export const userService = new UserService({ userRepo: userRepository, roleRepo: roleRepository })
export const roleService = new RoleService({ roleRepo: roleRepository })
export const permissionService = new PermissionService({ permissionRepo: permissionRepository })
export const rolePermissionService = new RolePermissionService({ roleRepo: roleRepository, permissionRepo: permissionRepository, rolePermissionRepo: rolePermissionRepository })
export const sessionService = new SessionService({ sessionRepo: sessionRepository, userRepo: userRepository })
export const companyService = new CompanyService()
export const contactService = new ContactService()
export const leadService = new LeadService()

export {
  jobPostingService,
  candidateService,
  applicationService,
  interviewService,
}

export default {
  userService,
  roleService,
  permissionService,
  rolePermissionService,
  sessionService,
  companyService,
  contactService,
  leadService,
  jobPostingService,
  candidateService,
  applicationService,
  interviewService,
}
