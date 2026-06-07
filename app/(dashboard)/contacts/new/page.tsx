"use server"

import { getCompanies } from "@/lib/actions/module3-company"
import ContactForm from "./ContactForm"

export default async function NewContactPage() {
  const result = await getCompanies({})
  const companies = Array.isArray(result.data) ? result.data : []

  return (
    <div className="p-6">
      <ContactForm companies={companies} />
    </div>
  )
}
