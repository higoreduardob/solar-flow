import { Loader2 } from 'lucide-react'

export const Loader = () => {
  return (
    <div className="w-full h-[500px] flex items-center justify-center">
      <Loader2 className="animate-spin size-6 text-slate-300" />
    </div>
  )
}
