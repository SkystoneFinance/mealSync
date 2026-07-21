// import 'dotenv/config'

// const databaseUrl = process.env.DATABASE_URL
// if (!databaseUrl) {
//   throw new Error('DATABASE_URL is not set in .env file')
// }

// export default {
//   datasource: {
//     url: databaseUrl,  // Now guaranteed to be defined
//   },
// }

import 'dotenv/config'
import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: './prisma/schema.prisma',
})