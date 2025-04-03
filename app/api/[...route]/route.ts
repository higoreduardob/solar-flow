import { Hono, Context } from 'hono'
import { handle } from 'hono/vercel'
import { initAuthConfig, type AuthConfig } from '@hono/auth-js'

import authConfig from '@/auth.config'

import manager from './manager'
import authenticate from './authenticate'

const app = new Hono().basePath('/api')

app.use('*', initAuthConfig(getAuthConfig))

const routes = app
  .route('/manager', manager)
  .route('/authenticate', authenticate)

// @ts-ignor
function getAuthConfig(c: Context): AuthConfig {
  return { ...authConfig }
}
export const GET = handle(app)
export const POST = handle(app)
export const PATCH = handle(app)
export const DELETE = handle(app)

export type AppType = typeof routes
