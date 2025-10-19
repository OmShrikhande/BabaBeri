export const formatRoleLabel = (role) => {
  if (!role) return 'Unknown';

  switch (role) {
    case 'master-agency':
      return 'Master Agency';
    case 'agency':
      return 'Agency';
    case 'sub-admin':
      return 'Sub Admin';
    default:
      return role
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
  }
};