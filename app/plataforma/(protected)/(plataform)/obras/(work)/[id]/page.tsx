'use client'

import { useParams } from 'next/navigation'

import { Card, CardContent } from '@/components/ui/card'
import { SubTitleProtected as SubTitle } from '@/components/title-custom'
import { FormEditWork } from '@/features/works/components/form-edit-work'
import { TableMaterial } from '@/features/works/materials/components/table-material'
import { FormEditWorkTeam } from '@/features/works/teams/components/form-edit-work-team'
import { TableTransaction } from '@/features/works/transactions/components/table-transaction'
import { FormEditWorkDocument } from '@/features/works/documents/components/form-edit-work-document'
import { FormEditWorkEquipament } from '@/features/works/equipaments/components/form-edit-work-equipament'

export default function WorkOpenPage() {
  const { id } = useParams<{ id: string }>()

  return (
    <section>
      <div className="flex flex-col gap-4">
        <Card className="p-4 bg-transparent">
          <SubTitle>Detalhes da obra</SubTitle>
          <CardContent>
            <FormEditWork id={id} />
          </CardContent>
        </Card>

        <Card className="p-4 bg-transparent">
          <SubTitle>Equipes da obra</SubTitle>
          <CardContent>
            <FormEditWorkTeam workId={id} />
          </CardContent>
        </Card>

        <Card className="p-4 bg-transparent">
          <SubTitle>Kits da obra</SubTitle>
          <CardContent>
            <FormEditWorkEquipament id={id} />
          </CardContent>
        </Card>

        <TableTransaction workId={id} />

        <TableMaterial workId={id} />

        <Card className="p-4 bg-transparent">
          <SubTitle>Documentos da obra</SubTitle>
          <CardContent>
            <FormEditWorkDocument id={id} />
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
