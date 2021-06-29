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
      throw new Error(err.message);
    });
  // Convert the cartItems to OrderItems

  // Create the order and return it
}
