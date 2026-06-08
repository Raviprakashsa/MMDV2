import { Types } from "mongoose";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getDashboardMetrics } from "@/lib/actions/dashboard";
import { PageTransition } from "@/components/layout/PageTransition";
import Dashboard from "@/components/dashboards/design/Dashboard";
import connectDB from "@/lib/db/mongodb";
import User from "@/lib/db/models/User";

type InsightsRole = 'SUPER_ADMIN' | 'ADMIN' | 'COORDINATOR' | 'RECRUITER' | 'SCRAPER'

function normalizeInsightsRole(role?: string): InsightsRole {
  if (role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'COORDINATOR' || role === 'RECRUITER' || role === 'SCRAPER') {
    return role
  }

  return 'RECRUITER'
}

export default async function InsightsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const role = normalizeInsightsRole(session.user.role)
  // Resolve MongoDB user ID by email since NextAuth uses PostgreSQL CUIDs
  await connectDB()
  const mongoUser = await User.findOne({ email: session.user.email?.toLowerCase() })
  const mongoUserId = mongoUser?._id || new Types.ObjectId()

  const user = {
    _id: mongoUserId,
    role,
    assignedGroup: null,
  }

  const metrics = await getDashboardMetrics(user)

  return (
    <PageTransition>
      <div className="p-4 md:p-6 w-full h-full min-h-screen bg-slate-50 overflow-y-auto overflow-x-hidden">
        <Dashboard backendData={metrics} />
      </div>
    </PageTransition>
  )
}
