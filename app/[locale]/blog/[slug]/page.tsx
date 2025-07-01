interface PageProps {
  params: {
    slug: string
  }
}

const Page = ({ params }: PageProps) => {
  const { slug } = params
  console.log(slug)
  return <div>Hello World</div>
}

export default Page
