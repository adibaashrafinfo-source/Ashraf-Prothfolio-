interface LogoProps {
  text: string
  imageUrl: string | null
  className?: string
}

export function Logo({ text, imageUrl, className }: LogoProps) {
  if (imageUrl) {
    return <img src={imageUrl} alt={text} className={className ?? 'h-8 w-auto'} />
  }

  return (
    <span className={className ?? 'font-display text-lg font-bold'}>
      {text}
      <span className="text-primary">.</span>
    </span>
  )
}
