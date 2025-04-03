import { translatePasswordOptionsProps } from '@/lib/i18n'

import { Progress } from '@/components/ui/progress'

const calculatePasswordStrength = (
  password: string,
): {
  strength: number
  description: PasswordOptionsProps
  indicatorColor: string
} => {
  let strength = 0

  if (password.length >= 6) strength += 25
  if (password.match(/[A-Z]/)) strength += 25
  if (password.match(/[0-9]/)) strength += 25
  if (password.match(/[^A-Za-z0-9]/)) strength += 25

  if (strength > 75)
    return { strength, description: 'STRONG', indicatorColor: 'bg-green-500' }
  else if (strength > 50)
    return { strength, description: 'GOOD', indicatorColor: 'bg-yellow-500' }

  return { strength, description: 'WEAK', indicatorColor: 'bg-red-500' }
}

export const ProgressPassword = ({ password }: { password: string }) => {
  const { strength, description, indicatorColor } =
    calculatePasswordStrength(password)

  return (
    <div className="space-y-1">
      <Progress
        value={strength}
        className="mt-2"
        indicatorColor={indicatorColor}
      />

      <p className="text-xs text-muted-foreground">
        Força da senha: {translatePasswordOptionsProps(description)}
      </p>
    </div>
  )
}
