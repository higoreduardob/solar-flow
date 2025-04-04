'use client'

import dynamic from 'next/dynamic'
import { useEffect } from 'react'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

import { UserRole } from '@prisma/client'

import { useCurrentUser } from '@/features/auth/hooks/use-current-user'

import { DialogProvider } from '@/app/gestao/_providers/dialog-provider'

import { Skeleton } from '@/components/ui/skeleton'

function ProtectedLayoutComponent({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, status } = useCurrentUser()
  const url = '/plataforma/entrar'

  useEffect(() => {
    if (!user) {
      router.push(url)
    }

    const allowedRoles: UserRole[] = ['OWNER', 'MANAGER', 'EMPLOYEE']
    if (user && user.role && !allowedRoles.includes(user.role)) {
      signOut()
      router.push(url)
    }
  }, [user, status, router])

  if (status === 'loading' || !user) {
    return (
      <section className="grid min-h-svh">
        <Skeleton className="h-full w-full" />
      </section>
    )
  }

  return (
    <>
      <DialogProvider />
      {children}
    </>
  )
}

const ProtectedLayout = dynamic(
  () => Promise.resolve(ProtectedLayoutComponent),
  {
    ssr: false,
  },
)

export default ProtectedLayout
