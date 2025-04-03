import { Resend } from 'resend'

import { UserRole } from '@prisma/client'

const resend = new Resend(process.env.RESEND_API_KEY)

export const sendVerificationToken = async (
  email: string,
  token: string,
  role: UserRole,
  storeId?: string
) => {
  const confirmLink = `${process.env.NEXT_PUBLIC_APP_URL}/verificar-email?token=${token}&role=${role}&storeId=${storeId}`

  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: email,
    subject: 'Confirme seu endereço de email',
    html: `<p>Acesse <a href="${confirmLink}">aqui</a> para confirmar seu cadastro.</p>`,
  })
}

export const sendVerificationTokenWithSlug = async (
  email: string,
  token: string,
  role: UserRole,
  slug: string,
  storeId: string
) => {
  const confirmLink = `${process.env.NEXT_PUBLIC_APP_URL}/loja/${slug}/verificar-email?token=${token}&role=${role}&storeId=${storeId}`

  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: email,
    subject: 'Confirme seu endereço de email',
    html: `<p>Acesse <a href="${confirmLink}">aqui</a> para confirmar seu cadastro.</p>`,
  })
}

export const sendTwoFactorTokenEmail = async (email: string, token: string) => {
  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: email,
    subject: 'Código 2FA',
    html: `<p>Seu código 2FA: ${token}</p>`,
  })
}

export const sendPasswordResetEmail = async (
  email: string,
  token: string,
  storeId?: string
) => {
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/redefinir-senha?token=${token}&storeId=${storeId}`

  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: email,
    subject: 'Reset your password',
    html: `<p>Acesse <a href="${resetLink}">aqui</a> para redefinir sua senha.</p>`,
  })
}

export const sendPasswordResetEmailWithSlug = async (
  email: string,
  token: string,
  slug: string,
  storeId: string
) => {
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/loja/${slug}/redefinir-senha?token=${token}&storeId=${storeId}`

  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: email,
    subject: 'Reset your password',
    html: `<p>Acesse <a href="${resetLink}">aqui</a> para redefinir sua senha.</p>`,
  })
}

export const sendPasswordSignInEmail = async (
  email: string,
  password: string
) => {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/entrar`

  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: email,
    subject: 'Acesso',
    html: `<p>Acesse sua loja <a href="${url}">aqui</a> e insira seu email e senha abaixo</p><p>Email: ${email} | Senha: ${password}</p>`,
  })
}
