// make vars in .env available here
import 'dotenv/config';
import { config, createSchema } from '@keystone-next/keystone/schema';

const databaseUrl =
  process.env.DATABASE_URL || 'mongodb://localhost/keystone-sick-fits-tutorial';

const sessionConfig = {
  // how long does the cookie survives - how long users stay singed in
  maxAge: 60 * 60 * 24 * 360,
  // must be hidden
  secret: process.env.COOKIE_SECRET,
};

export default config({
  server: {
    cors: {
      origin: [process.env.FRONTEND_URL],
      credentials: true, // grabs the cookies
    },
  },
  db: {
    adapter: 'mongoose',
    url: databaseUrl,
    // TODO: Add data seeding here
  },
  // data types
  lists: createSchema({
    // Schema items go in here
  }),
  // can people access the ui
  ui: {
    // TODO: change this for roles
    isAccessAllowed: () => true,
  },
  // TODO: Add session values
});
