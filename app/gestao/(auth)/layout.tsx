'use client'

import { useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'

import { useCurrentUser } from '@/features/auth/hooks/use-current-user'

import { Skeleton } from '@/components/ui/skeleton'
import { Container } from '@/components/container'

function AuthLayoutComponent({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, status } = useCurrentUser()

  useEffect(() => {
    if (status === 'authenticated' && user) {
      router.push('/gestao')
    }
  }, [user, status, router])

  if (status === 'loading') {
    return (
      <section className="relative bg-[url('/auth-bg.png')] bg-center bg-no-repeat bg-cover">
        <div className="absolute inset-0 bg-black/40 dark:bg-black/60 z-0" />
        <Container className="relative z-10 min-h-screen grid grid-cols-1 justify-center items-center">
          <Skeleton className="h-[250px] w-full max-w-md mx-auto" />
        </Container>
      </section>
    )
  }

  if (status === 'authenticated' && user) {
    return null
  }

  return (
    <section className="relative bg-[url('/auth-bg.png')] bg-center bg-no-repeat bg-cover">
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60 z-0" />
      <Container className="relative z-10 min-h-screen grid grid-cols-1 justify-center items-center">
        {children}
      </Container>
    </section>
  )
}

const AuthLayout = dynamic(() => Promise.resolve(AuthLayoutComponent), {
  ssr: false,
})

export default AuthLayout
