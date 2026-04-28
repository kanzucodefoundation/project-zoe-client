type UserWithCapabilities =
  | {
      permissions?: string[] | null;
      roles?: string[] | null;
    }
  | null
  | undefined;

export const getUserCapabilities = (user: UserWithCapabilities) => {
  const permissions = Array.isArray(user?.permissions) ? user.permissions : [];
  const roles = Array.isArray(user?.roles) ? user.roles : [];

  return new Set([...permissions, ...roles]);
};

export const hasAnyCapability = (
  user: UserWithCapabilities,
  requiredCapabilities?: string[],
) => {
  if (!requiredCapabilities || requiredCapabilities.length === 0) {
    return true;
  }

  const userCapabilities = getUserCapabilities(user);

  return requiredCapabilities.some((capability) =>
    userCapabilities.has(capability),
  );
};
