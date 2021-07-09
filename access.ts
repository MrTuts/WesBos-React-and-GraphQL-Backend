// At it's simplest, access control return a yer or no value depending on the user's session

import { permissionsList, Permission } from './schemas/fields';
import { ListAccessArgs } from './types';

export function isSignedIn({ session }: ListAccessArgs): boolean {
  return !!session;
}

type PermissionCheckers = {
  [key in Permission]: ({ session }: ListAccessArgs) => boolean;
};

const generatedPermissions = Object.fromEntries(
  permissionsList.map((permission) => [
    permission,
    function ({ session }: ListAccessArgs) {
      return !!session?.data.role?.[permission];
    },
  ])
) as PermissionCheckers;

// Permissions check if someone meets a criteria - yes or no
export const permissions = {
  ...generatedPermissions,
};

// Rule based functions
// Rules can return a boolean - yes or no - or a filter which limits which products they can CRUD.
export const rules = {
  canManageProducts({ session }: ListAccessArgs) {
    // Do they have the permissions of canManageProducts
    if (permissions.canManageProducts({ session })) {
      return true;
    }
    // If not, do they own this item? Return `where` filter
    return { user: { id: session.itemId } };
  },
  canReadProducts({ session }: ListAccessArgs) {
    if (permissions.canManageProducts({ session })) {
      return true; // They can read everything
    }
    // They should only see available products based on the status field
    return { status: 'AVAILABLE' };
  },
};
