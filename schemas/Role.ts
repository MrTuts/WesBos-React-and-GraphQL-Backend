import { relationship, text } from '@keystone-next/fields';
import { list } from '@keystone-next/keystone/schema';
import { permissionFields } from './fields';
import { permissions } from '../access';

export const Role = list({
  access: {
    create: permissions.canManageUsers,
    read: permissions.canManageUsers,
    update: permissions.canManageUsers,
    delete: permissions.canManageUsers,
  },
  ui: {
    // hide Roles ui from regular users
    hideCreate: (args) => !permissions.canManageRoles(args),
    hideDelete: (args) => !permissions.canManageRoles(args),
    isHidden: (args) => !permissions.canManageRoles(args),
  },
  fields: {
    name: text({ isRequired: true }),
    assignedTo: relationship({
      ref: 'User.role', // TODO: Add this to the user
      many: true,
      ui: {
        itemView: { fieldMode: 'read' },
      },
    }),
    ...permissionFields,
  },
});
