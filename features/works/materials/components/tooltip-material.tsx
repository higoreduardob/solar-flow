import { CircleHelp } from 'lucide-react'

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export const TooltipMaterial = () => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <button type="button">
            <CircleHelp className="size-4 text-black dark:text-white" />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          Aqui você adiciona materiais que você cadastrou em almoxarifado, dessa
          forma você saberá a quantidade e quais materias foram usados em cada
          obra
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
