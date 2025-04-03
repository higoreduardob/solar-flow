'use client'

import { BadgeCheck, LayoutDashboard, Lock } from 'lucide-react'

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
    title: 'Painel',
    properties: [
      {
        title: 'Gestão',
        icon: LayoutDashboard,
        items: [
          {
            title: 'Início',
            url: '/gestao',
          },
          {
            title: 'Usuários',
            url: '/gestao/usuarios',
          },
        ],
      },
    ],
  },
]

const USER_ITEMS: NavUserProps[] = [
  {
    title: 'Conta',
    url: '/gestao/conta',
    icon: BadgeCheck,
  },
  {
    title: 'Segurança',
    url: '/gestao/seguranca',
    icon: Lock,
  },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar
        name="Higor"
        email="higor@email.com"
        href="/gestao"
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
