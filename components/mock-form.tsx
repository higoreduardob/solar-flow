'use client'

import { FormProvider, useForm } from 'react-hook-form'

export const MockForm = ({ children }: { children: React.ReactNode }) => {
  const methods = useForm({
    defaultValues: {},
  })

  return <FormProvider {...methods}>{children}</FormProvider>
}
