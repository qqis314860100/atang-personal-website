import Image from 'next/image'

export const Picture = () => {
  return (
    <picture
      className="absolute inset-0 h-full w-full overflow-hidden"
      style={{ opacity: 1 }}
    >
      <source type="image/webp" srcSet="/images/bg.webp" />
      <Image
        className="absolute inset-0 h-full w-full scale-[1.02] object-cover opacity-50 blur-2xl dark:opacity-30"
        alt="bg"
        width={1920}
        height={1080}
        aria-hidden="true"
        src="/images/bg.webp"
        sizes="100vw"
        loading="eager"
        fetchPriority="high"
      />
      <div className="absolute inset-0 h-full w-full bg-gradient-to-b from-transparent to-white dark:to-black"></div>
    </picture>
  )
}

export default Picture
