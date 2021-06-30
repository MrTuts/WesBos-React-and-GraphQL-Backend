import { KeystoneContext } from '@keystone-next/types';
import { OrderCreateInput } from '../.keystone/schema-types';
import stripeConfig from '../lib/stripe';
import { Session } from '../types';

const graphql = String.raw;

type User = {
  id: string;
  name: string;
  email: string;
  cart: Array<{
    id: string;
    quantity: number;
    product: {
      id: string;
      name: string;
      price: number;
      description: string;
      photo: {
        id: string;
        image: {
          id: string;
          publicUrlTransformed: string;
        };
      };
    };
  }>;
};

export default async function checkout(
  root: any,
  { token }: { token: string },
  context: KeystoneContext
): Promise<OrderCreateInput> {
  // Make sure they are signed in
  const sesh = context.session as Session;
  const userId = sesh.itemId;
  if (!userId) {
    throw new Error('Sorry! You must be signed in to create an order!');
  }
  // Query the current user
  const user: User = await context.lists.User.findOne({
    where: { id: userId },
    resolveFields: graphql`
      id
      name
      email
      cart {
        id
        quantity
        product {
          id
          name
          price
          description
          photo {
            id
            image {
              id
              publicUrlTransformed
            }
          }
        }
      }
    `,
  });

  // filter cart items with null product
  const cartItems = user.cart.filter((cartItem) => cartItem.product);
  // Calculate the total price for their order
  const amount = cartItems.reduce(
    (acc: number, item) => acc + item.quantity * item.product.price,
    0
  );

  // Create the charge with the stripe library
  const charge = await stripeConfig.paymentIntents
    .create({
      amount,
      currency: 'USD',
      confirm: true,
      payment_method: token,
    })
    .catch((err) => {
      console.log(err);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      throw new Error(err.message);
    });

  // Convert the cartItems to OrderItems
  const orderItems = cartItems.map((cartItem) => ({
    name: cartItem.product.name,
    description: cartItem.product.description,
    price: cartItem.product.price,
    quantity: cartItem.quantity,
    // relationship connection
    photo: { connect: { id: cartItem.product.photo.id } },
  }));

  // Create the order
  const order: OrderCreateInput = await context.lists.Order.createOne({
    data: {
      total: charge.amount,
      charge: charge.id,
      // create relationship to items. GraphQL first create orderItems, then connects them here
      items: { create: orderItems },
      user: { connect: { id: userId } },
    },
  });
  // clean any old cart items
  const cartItemIds = cartItems.map((cartItem) => cartItem.id);
  await context.lists.CartItem.deleteMany({ ids: cartItemIds });

  return order;
}
