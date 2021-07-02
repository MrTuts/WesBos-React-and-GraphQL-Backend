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
import { OrderItem } from './schemas/OrderItem';
import { Order } from './schemas/Order';
import { Role } from './schemas/Role';
import { CartItem } from './schemas/CartItem';
import { ProductImage } from './schemas/ProductImage';
import { insertSeedData } from './seed-data';
import { sendPasswordResetEmail } from './lib/mail';
import { extendGraphqlSchema } from './mutations';
import { permissionsList } from './schemas/fields';

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
  // activates the `sendUserPasswordResetLink` mutation
  passwordResetLink: {
    async sendToken(args: { itemId: string; identity: string; token: string }) {
      await sendPasswordResetEmail(args.token, args.identity);
    },
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
      async onConnect(keystone) {
        if (process.argv.includes('--seed-data')) {
          // seed data if argument was provided
          await insertSeedData(keystone);
        }
      },
    },
    // data types
    lists: createSchema({
      // Schema items go in here
      User,
      Product,
      ProductImage,
      CartItem,
      OrderItem,
      Order,
      Role,
    }),
    // custom graphql schemas
    extendGraphqlSchema,
    // can people access the keystone UI
    ui: {
      // show the UI only for people who pass this test
      isAccessAllowed: ({ session }) => !!session?.data,
    },
    session: withItemData(statelessSessions(sessionConfig), {
      // GraphQL query
      // pass following values with every request, these values can be accessed via `session` prop
      User: `id name email role { ${permissionsList.join(' ')} }`,
    }),
    // TODO: Add session values
  })
);
