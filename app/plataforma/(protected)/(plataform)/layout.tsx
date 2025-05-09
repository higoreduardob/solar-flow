'use client'

import {
  BadgeCheck,
  ClipboardList,
  LayoutDashboard,
  Lock,
  Users,
} from 'lucide-react'

import { useCurrentUser } from '@/features/auth/hooks/use-current-user'

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import {
  AppSidebar,
  NavMainProps,
  NavUserProps,
} from '@/components/app-sidebar'
import { Separator } from '@/components/ui/separator'
import { ButthonTheme, ButtonSignOut } from '@/components/button-custom'

const NAV_ITEMS: NavMainProps[] = [
  {
    title: 'Plataforma',
    properties: [
      {
        title: 'Gestão',
        icon: LayoutDashboard,
        items: [
          {
            title: 'Início',
            url: '/plataforma',
          },
        ],
      },
      {
        title: 'Obras',
        icon: ClipboardList,
        items: [
          {
            title: 'Em progresso',
            url: '/plataforma/obras',
          },
          {
            title: 'Equipamentos',
            url: '/plataforma/obras/equipamentos',
          },
          {
            title: 'Almoxarifado',
            url: '/plataforma/obras/almoxarifado',
          },
          // {
          //   title: 'Calendário',
          //   url: '/plataforma/obras/calendario',
          // },
          // {
          //   title: 'Desempenho',
          //   url: '/plataforma/obras/desempenho',
          // },
        ],
      },
      {
        title: 'Usuários',
        icon: Users,
        items: [
          {
            title: 'Equipe',
            url: '/plataforma/usuarios',
          },
          {
            title: 'Clientes',
            url: '/plataforma/usuarios/clientes',
          },
        ],
      },
    ],
  },
]

const USER_ITEMS: NavUserProps[] = [
  {
    title: 'Conta',
    url: '/plataforma/conta',
    icon: BadgeCheck,
  },
  {
    title: 'Segurança',
    url: '/plataforma/seguranca',
    icon: Lock,
  },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user } = useCurrentUser()

  if (!user) return null

  const { name, email } = user

  return (
    <SidebarProvider>
      <AppSidebar
        name={name!}
        email={email!}
        href="/plataforma"
        navItems={NAV_ITEMS}
        userItems={USER_ITEMS}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex justify-between items-center gap-2 px-4 w-full">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="h-4" />
            </div>
            <div className="flex items-center gap-2">
              <ButthonTheme />
              <Separator orientation="vertical" className="h-4" />
              <ButtonSignOut />
            </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
