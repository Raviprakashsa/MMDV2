import runApi from '@/lib/core/route-utils'
import { permissionService } from '@/lib/foundation/services'

export async function GET(request: Request) {
  return runApi(async () => {
    return permissionService.list()
  })
}
