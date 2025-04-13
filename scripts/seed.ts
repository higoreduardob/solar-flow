import { readFileSync } from 'fs'
import { join } from 'path'

import { db } from '@/lib/db'

async function run() {
  const seed = JSON.parse(
    readFileSync(join(__dirname, '../prisma/seed.json'), 'utf-8'),
  )

  await Promise.all(
    seed.users.map((user: any) =>
      db.user.create({
        data: { ...user, selectedStore: undefined },
      }),
    ),
  )

  await db.address.createMany({ data: seed.addresses, skipDuplicates: true })
}

run()
  .then(async () => {
    await prisma?.$disconnect()
    console.log('Seed completed')
  })
  .catch(async (err) => {
    console.log('Error during seed', err)
    await prisma?.$disconnect()
    process.exit(1)
  })
