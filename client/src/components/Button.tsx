interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'destructive'
  onClick?: () => void
  className?: string
}

export function Button({ children, variant = 'primary', onClick, className = '' }: ButtonProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-purple-600 hover:bg-purple-700 text-white'
      case 'secondary':
        return 'bg-gray-600 hover:bg-gray-700 text-white'
      case 'destructive':
        return 'bg-red-600 hover:bg-red-700 text-white'
      default:
        return 'bg-purple-600 hover:bg-purple-700 text-white'
    }
  }

  return (
    <button
      onClick={onClick}
      className={`px-6 py-3 rounded-lg font-semibold transition-colors duration-200 ${getVariantClasses()} ${className}`}
    >
      {children}
    </button>
  )
}