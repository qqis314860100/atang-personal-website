import { redirect } from 'next/navigation'

export async function generateMetadata() {
  return {
    title: '正在努力加载中...',
  }
}

export default async function Page() {
  return redirect('/zh/dashboard')
}
