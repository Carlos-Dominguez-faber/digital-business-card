import { redirect } from 'next/navigation'

// Signup disabled - internal use only
export default function SignupPage() {
  redirect('/login')
}
