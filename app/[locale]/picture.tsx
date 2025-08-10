import Image from 'next/image'

export const Picture = () => {
  return (
    <picture
      className="fixed inset-0 h-screen w-screen overflow-hidden -z-10"
      style={{ opacity: 1 }}
    >
      <source type="image/webp" srcSet="/images/bg.webp" />
      <img
        className="absolute inset-0 h-full w-full object-cover opacity-50 blur-2xl dark:opacity-30"
        width="100%"
        height="100%"
        aria-hidden="true"
        src="/images/bg.webp"
        sizes="100vw"
        loading="eager"
        fetchPriority="high"
        alt="Background"
      />
      <div className="absolute inset-0 h-full w-full bg-gradient-to-b from-transparent via-transparent to-white/80 dark:to-black/80"></div>
    </picture>
  )
}

export default Picture
