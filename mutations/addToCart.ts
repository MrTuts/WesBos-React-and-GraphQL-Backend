import { KeystoneContext } from '@keystone-next/types';
import { CartItemCreateInput } from '../.keystone/schema-types';
import { Session } from '../types';

type CartItem = {
  id: string;
  quantity: number;
};

export default async function addToCart(
  root: any,
  { productId }: { productId: string },
  context: KeystoneContext
): Promise<CartItemCreateInput> {
  // query the current user and see if they are signed in
  const sesh = context.session as Session;
  if (!sesh.itemId) {
    throw new Error('You must be logged in to do this');
  }

  // query the current user's cart
  const allCartItems: readonly CartItem[] = await context.lists.CartItem.findMany(
    {
      where: { user: { id: sesh.itemId }, product: { id: productId } },
      resolveFields: 'id,quantity',
    }
  );
  console.log(allCartItems);

  // See if the current item is in their cart
  const [existingCartItem] = allCartItems;

  // if it is is, increment by 1
  if (existingCartItem) {
    console.log(`was ${existingCartItem.quantity}, increment by 1`);
    return (await context.lists.CartItem.updateOne({
      id: existingCartItem.id,
      data: { quantity: existingCartItem.quantity + 1 },
    })) as CartItemCreateInput;
  }

  // if it isn't, create a new cart item
  return (await context.lists.CartItem.createOne({
    data: {
      product: { connect: { id: productId } },
      user: { connect: { id: sesh.itemId } },
    },
  })) as CartItemCreateInput;
}
