import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const db = drizzle(process.env.DATABASE_URL!, { schema });

export {db};


//synchronous connection 
// import { neon } from '@neondatabase/serverless';
// import { drizzle } from 'drizzle-orm/neon-http';
// const sql = neon(process.env.DATABASE_URL!);
// const db = drizzle({ client: sql });