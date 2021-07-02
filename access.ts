// At it's simplest, access control return a yer or no value depending on the user's session

import { ListAccessArgs } from './types';

export function isSignedIn({ session }: ListAccessArgs): boolean {
  return !!session;
}
