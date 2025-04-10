import { Hono, Context } from 'hono'
import { handle } from 'hono/vercel'
import { initAuthConfig, type AuthConfig } from '@hono/auth-js'

import authConfig from '@/auth.config'

import users from './users'
import teams from './teams'
import works from './works'
import uploads from './uploads'
import manager from './manager'
import materials from './materials'
import summaries from './summaries'
import equipaments from './equipaments'
import authenticate from './authenticate'
import measures from './materials/measures'
import categories from './materials/categories'
import transactions from './works/transactions'

const app = new Hono().basePath('/api')

app.use('*', initAuthConfig(getAuthConfig))

const routes = app
  .route('/users', users)
  .route('/teams', teams)
  .route('/works', works)
  .route('/uploads', uploads)
  .route('/manager', manager)
  .route('/measures', measures)
  .route('/materials', materials)
  .route('/summaries', summaries)
  .route('/categories', categories)
  .route('/equipaments', equipaments)
  .route('/authenticate', authenticate)
  .route('/transactions', transactions)

// @ts-ignor
function getAuthConfig(c: Context): AuthConfig {
  return { ...authConfig }
}
export const GET = handle(app)
export const POST = handle(app)
export const PATCH = handle(app)
export const DELETE = handle(app)

export type AppType = typeof routes
