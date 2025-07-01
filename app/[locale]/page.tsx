import { redirect } from 'next/navigation'

export async function generateMetadata() {
  return {
    title: 'Redirecting...',
  }
}

export default async function Page() {
  return redirect('/zh/blog')
}
