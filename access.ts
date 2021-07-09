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

// Rule based function
