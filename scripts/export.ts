import { writeFileSync } from 'fs'
import { join } from 'path'

import { db } from '@/lib/db'

async function run() {
  const users = await db.user.findMany({})

  const addresses = await db.address.findMany({})

  const seed = {
    users,
    addresses,
  }

  writeFileSync(
    join(__dirname, '../prisma/seed.json'),
    JSON.stringify(seed, null, 2),
  )
}

run()
  .then(async () => {
    await prisma?.$disconnect()
    console.log('Export completed')
  })
  .catch(async (err) => {
    console.log('Error during export', err)
    await prisma?.$disconnect()
    process.exit(1)
  })
