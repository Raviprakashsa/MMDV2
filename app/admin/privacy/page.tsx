import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import PrivacyCenterClient from './PrivacyCenterClient'

export default async function PrivacyCenterPage() {
  const session = await auth()
  if (!session?.user || !['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) {
    redirect('/forbidden')
  }

  return <PrivacyCenterClient />
}
