interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'destructive'
  onClick?: () => void
  disabled?: boolean
  className?: string
}

export function Button({ children, variant = 'primary', onClick, disabled = false, className = '' }: ButtonProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return disabled ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 text-white'
      case 'secondary':
        return disabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-600 hover:bg-gray-700 text-white'
      case 'destructive':
        return disabled ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 text-white'
      default:
        return disabled ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 text-white'
    }
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-6 py-3 rounded-lg font-semibold transition-colors duration-200 ${getVariantClasses()} ${className}`}
    >
      {children}
    </button>
  )
}