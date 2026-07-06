import { useEffect, useState } from "react"
import Lottie from "lottie-react"
import Icon from "@/components/ui/icon"

interface Props {
  url: string
  loop: boolean
  className?: string
}

export default function SplashLottiePreview({ url, loop, className }: Props) {
  const [animationData, setAnimationData] = useState<object | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    setAnimationData(null)
    setFailed(false)

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setAnimationData(data)
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })

    return () => {
      cancelled = true
    }
  }, [url])

  if (failed) {
    return <Icon name="FileWarning" size={28} className="text-white/40" />
  }

  if (!animationData) {
    return <Icon name="Loader2" size={28} className="text-white/40 animate-spin" />
  }

  return <Lottie animationData={animationData} loop={loop} autoplay className={className} />
}
