import { useEffect, useRef } from 'react'
import { useSession, signOut } from 'next-auth/react'

import { useSignInValidate } from '@/features/auth/api/use-sign-in-validate'

export const useCurrentUser = (validationIntervalMinutes = 5) => {
  const { data, status, update } = useSession()
  const { mutate: validateUser } = useSignInValidate()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (data?.user?.id) {
      validateUser(
        {},
        {
          onSuccess: (res) => {
            if ('success' in res) {
              if (!res.success) {
                signOut()
              }
            }
          },
          onError: () => {
            signOut()
          },
        },
      )
    }
  }, [data?.user?.id])

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    if (data?.user?.id && status === 'authenticated') {
      const intervalMs = validationIntervalMinutes * 60 * 1000

      intervalRef.current = setInterval(() => {
        validateUser(
          {},
          {
            onSuccess: (res) => {
              if ('success' in res && !res.success) {
                signOut()
              }
            },
            onError: () => {
              signOut()
            },
          },
        )
      }, intervalMs)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [data?.user?.id, status, validationIntervalMinutes])

  return { session: data, user: data?.user, status, update }
}
