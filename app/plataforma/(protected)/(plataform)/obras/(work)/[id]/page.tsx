'use client'

import { useParams } from 'next/navigation'

import { Card, CardContent } from '@/components/ui/card'
import { FormEditWork } from '@/features/works/components/form-edit-work'
import { TableTransaction } from '@/features/works/transactions/components/table-transaction'
import { FormEditWorkEquipament } from '@/features/works/equipaments/components/form-edit-work-equipament'

export default function WorkOpenPage() {
  const { id } = useParams<{ id: string }>()

  return (
    <section>
      <div className="flex flex-col gap-4">
        <Card className="p-4 bg-transparent">
          <CardContent>
            <FormEditWork id={id} />
          </CardContent>
        </Card>

        <Card className="p-4 bg-transparent">
          <CardContent>
            <FormEditWorkEquipament id={id} />
          </CardContent>
        </Card>

        <TableTransaction workId={id} />
      </div>
    </section>
  )
}
