import { Works } from '@/app/plataforma/(protected)/(plataform)//obras/(work)/page'
import { Message } from '@/app/plataforma/(protected)/(plataform)/(dashboard)/_components/message'
import { Summaries } from '@/app/plataforma/(protected)/(plataform)/(dashboard)/_components/summaries'

export default function DashboardPage() {
  return (
    <section>
      <div className="w-full flex flex-col gap-2">
        <Message />
        <Summaries />
        <Works />
      </div>
    </section>
  )
}
