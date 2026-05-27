import { redirect } from 'next/navigation'

export default function AdminTreatmentBookingsRedirect() {
  redirect('/admin/appointments?kind=treatment')
}
