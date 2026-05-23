"use client"

import { usePathname } from "next/navigation"

export function GlobalBackground() {
  const pathname = usePathname()

  const isLanding = pathname === "/"
  const showVideo = isLanding
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""
  const videoSrc = `${basePath}/assets/bgm-light.mp4`
  const imageSrc = `${basePath}/assets/img-light.PNG`

  return (
    <div className="fixed inset-0 -z-50 overflow-hidden bg-[#FFF7FA]">
      {showVideo ? (
        <video
          key={videoSrc}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          className="global-video-bg opacity-0 transition-opacity duration-1000"
          onCanPlay={(e) => (e.currentTarget.style.opacity = "1")}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      ) : (
        <div className="relative w-full h-full">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-70"
            style={{ backgroundImage: `url(${imageSrc})` }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(223,0,89,0.16),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(224,110,156,0.16),transparent_30%),linear-gradient(180deg,rgba(255,247,250,0.94),rgba(255,233,242,0.86))]" />
        </div>
      )}
    </div>
  )
}
