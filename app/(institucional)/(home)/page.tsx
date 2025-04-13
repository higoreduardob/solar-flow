import { Poppins } from 'next/font/google'

import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { ButtonSignIn } from '@/components/button-custom'

const font = Poppins({
  subsets: ['latin'],
  weight: ['600'],
})

export default function HomePage() {
  return (
    <section>
      <div className="flex flex-col items-center justify-center min-h-svh w-full">
        <div className="space-y-6 text-center">
          <h1
            className={cn(
              'font-medium text-6xl drop-shadow-sm',
              font.className,
            )}
          >
            🔐 Acesso
          </h1>
          <p className="text-lg">Simples serviço de autenticação</p>
          <ButtonSignIn>
            <Button variant="default" size="sm" className="mt-6">
              Entrar
            </Button>
          </ButtonSignIn>
        </div>
      </div>
    </section>
  )
}
