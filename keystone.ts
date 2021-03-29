// make vars in .env available here
import 'dotenv/config';
import { createAuth } from '@keystone-next/auth';
import { config, createSchema } from '@keystone-next/keystone/schema';
import {
  withItemData,
  statelessSessions,
} from '@keystone-next/keystone/session';
import { User } from './schemas/User';
import { Product } from './schemas/Product';
import { ProductImage } from './schemas/ProductImage';

const databaseUrl =
  process.env.DATABASE_URL || 'mongodb://localhost/keystone-sick-fits-tutorial';

const sessionConfig = {
  // how long does the cookie survives - how long users stay singed in
  maxAge: 60 * 60 * 24 * 360,
  // must be hidden
  secret: process.env.COOKIE_SECRET,
};

const { withAuth } = createAuth({
  listKey: 'User', // which schema is responsible for logging
  identityField: 'email', // which field in User identifies the person
  secretField: 'password', // which field is asked to log in,
  initFirstItem: {
    fields: ['name', 'email', 'password'], // fields to fill to register
    // TODO: Add in initial roles here
  },
});

export default withAuth(
  config({
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
      User,
      Product,
      ProductImage,
    }),
    // can people access the keystone UI
    ui: {
      // show the UI only for people who pass this test
      isAccessAllowed: ({ session }) => !!session?.data,
    },
    session: withItemData(statelessSessions(sessionConfig), {
      // GraphQL query
      User: 'id', // pass the id with every request
    }),
    // TODO: Add session values
  })
);
