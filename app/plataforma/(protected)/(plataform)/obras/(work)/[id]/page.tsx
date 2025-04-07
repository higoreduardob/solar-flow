'use client'

import { useParams } from 'next/navigation'

import { FormEditWork } from '@/features/works/components/form-edit-work'

export default function WorkOpenPage() {
  const { id } = useParams<{ id: string }>()

  return (
    <section>
      <FormEditWork id={id} />
    </section>
  )
}
