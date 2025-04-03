import { Switch } from '@/components/ui/switch'
import { MockForm } from '@/components/mock-form'
import { FormControl, FormItem, FormLabel } from '@/components/ui/form'

type Props = {
  isTwoFactorEnabled?: boolean
  isPending?: boolean
  onSubmit: () => void
}

export const FormUpdate2FA = ({
  isTwoFactorEnabled,
  isPending,
  onSubmit,
}: Props) => {
  return (
    <MockForm>
      <FormItem className="flex items-center gap-3">
        <FormLabel htmlFor="2FA" className="mt-2">
          Autenticação de dois fatores
        </FormLabel>
        <FormControl>
          <Switch
            id="2FA"
            checked={isTwoFactorEnabled}
            disabled={isPending}
            onCheckedChange={onSubmit}
          />
        </FormControl>
      </FormItem>
    </MockForm>
  )
}
