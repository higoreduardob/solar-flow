'use client'

import {
  isServer,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { toast } from 'sonner'

function makeQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error) => {
        if (error instanceof Error) {
          toast.error(
            error.message || 'Erro inesperado, contate o administrador',
          )
        }
      },
    }),
    defaultOptions: {
      queries: {
        retry: 3,
        refetchOnWindowFocus: false,
        staleTime: 60 * 1000,
      },
      mutations: {
        retry: 0,
        onError: (error: unknown) => {
          if (error instanceof Error) {
            toast.error(
              error.message || 'Erro inesperado, contate o administrador',
            )
          }
        },
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined = undefined

function getQueryClient() {
  if (isServer) {
    return makeQueryClient()
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient
  }
}

type Props = {
  children: React.ReactNode
}

export function QueryProvider({ children }: Props) {
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
