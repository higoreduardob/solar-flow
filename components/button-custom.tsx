import * as React from 'react'
import { Loader2 } from 'lucide-react'

import { VariantProps } from 'class-variance-authority'

import { Button, buttonVariants } from '@/components/ui/button'

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export const ButtonLoading = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        className={className}
        variant={variant}
        size={size}
        asChild={asChild}
        {...props}
      >
        {props.disabled ? (
          <>
            <Loader2 className="animate-spin size-4 text-slate-300" />
            Aguarde...
          </>
        ) : (
          props.children
        )}
      </Button>
    )
  },
)
ButtonLoading.displayName = 'ButtonLoading'
