import { Metadata } from 'next'

interface PageProps {
  params: {
    slug: string
    locale: string
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  return {
    title: `Blog - ${params.slug}`,
  }
}

export default function BlogPost({ params }: PageProps) {
  return (
    <div>
      <h1>Blog Post: {params.slug}</h1>
    </div>
  )
}
