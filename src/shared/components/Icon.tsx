import Image from 'next/image'

export type IconName =
  | 'users'
  | 'eye'
  | 'clock'
  | 'link'
  | 'warning'
  | 'card'
  | 'settings'
  | 'chart'
  | 'inbox'
  | 'briefcase'

interface IconProps {
  name: IconName
  size?: number
  className?: string
}

export function Icon({ name, size = 24, className = '' }: IconProps) {
  return (
    <Image
      src={`/icons/${name}.svg`}
      alt={name}
      width={size}
      height={size}
      className={className}
    />
  )
}
