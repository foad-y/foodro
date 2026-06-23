import config from '../../site.config.json'

interface AppLogoProps {
  className?: string
}

export default function AppLogo({ className }: AppLogoProps) {
  return (
    <img
      src={config.logo}
      alt={config.marketName}
      className={className}
    />
  )
}