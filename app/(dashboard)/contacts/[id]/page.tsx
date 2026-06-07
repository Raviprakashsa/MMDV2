"use server"

import { getContactById } from "@/lib/actions/module15-contacts"
import { getCompanies } from "@/lib/actions/module3-company"
import { notFound } from "next/navigation"
import ContactDetailClient from "./ContactDetailClient"

interface ContactDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ContactDetailPage({ params }: ContactDetailPageProps) {
  const { id } = await params
  
  const [contactRes, companiesRes] = await Promise.all([
    getContactById({ id }),
    getCompanies({})
  ])

  if (!contactRes.success || !contactRes.data) {
    notFound()
  }

  const contact = contactRes.data
  const companies = Array.isArray(companiesRes.data) ? companiesRes.data : []

  return (
    <div className="p-6">
      <ContactDetailClient contact={contact as any} companies={companies} />
    </div>
  )
}
