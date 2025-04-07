'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'
import { signOut } from 'next-auth/react'
import { VariantProps } from 'class-variance-authority'
import { Loader2, LogOut, Moon, Sun } from 'lucide-react'

import { Button, buttonVariants } from '@/components/ui/button'

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  blocked?: boolean
  asChild?: boolean
}

export const ButtonLoading = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, disabled, blocked, ...props },
    ref,
  ) => {
    return (
      <Button
        ref={ref}
        className={className}
        variant={variant}
        size={size}
        asChild={asChild}
        disabled={disabled || blocked}
        {...props}
      >
        {disabled || blocked ? (
          <>
            {!blocked ? (
              <>
                <Loader2 className="animate-spin size-4 text-slate-300" />
                Aguarde...
              </>
            ) : (
              props.children
            )}
          </>
        ) : (
          props.children
        )}
      </Button>
    )
  },
)
ButtonLoading.displayName = 'ButtonLoading'

export function ButthonTheme() {
  const { setTheme, theme } = useTheme()

  const toggleTheme = () => {
    theme === 'light' ? setTheme('dark') : setTheme('light')
  }

  return (
    <Button variant="ghost" onClick={toggleTheme}>
      <Moon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Sun className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  )
}

export const ButtonSignOut = () => {
  const handleSignOut = () => {
    signOut()
  }

  return (
    <Button variant="ghost" onClick={handleSignOut}>
      <LogOut className="h-[1.2rem] w-[1.2rem]" />
    </Button>
  )
}
