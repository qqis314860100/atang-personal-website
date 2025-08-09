import Image from 'next/image'

export const Picture = () => {
  return (
    <picture
      className="absolute inset-0 h-full w-full overflow-hidden"
      style={{ opacity: 1 }}
    >
      <source
        type="image/webp"
        srcSet="https://persistent.oaistatic.com/burrito-nux/640.webp 640w, https://persistent.oaistatic.com/burrito-nux/1280.webp 1280w, https://persistent.oaistatic.com/burrito-nux/1920.webp 1920w"
      />
      <Image
        className="absolute inset-0 h-full w-full scale-[1.02] object-cover opacity-50 blur-2xl dark:opacity-30"
        alt=""
        aria-hidden="true"
        src="https://persistent.oaistatic.com/burrito-nux/1920.webp"
        sizes="100vw"
        loading="eager"
        fetchPriority="high"
      />
      <div className="absolute inset-0 h-full w-full bg-gradient-to-b from-transparent to-white dark:to-black"></div>
    </picture>
  )
}

export default Picture
