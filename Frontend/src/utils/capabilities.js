export const hasCapability = (authorizationProfile, capability) => {
  if (!authorizationProfile || !capability) return false;
  return authorizationProfile.capabilities?.includes(capability) ?? false;
};

export const hasAnyCapability = (authorizationProfile, capabilities = []) =>
  capabilities.some((capability) => hasCapability(authorizationProfile, capability));

export const getHomePath = (authorizationProfile) => {
  if (hasCapability(authorizationProfile, "platform.dashboard.read")) return "/super-admin";
  if (hasCapability(authorizationProfile, "store.read")) return "/store";
  if (hasCapability(authorizationProfile, "employee.create")) return "/branch";
  if (hasCapability(authorizationProfile, "order.create")) return "/cashier";
  return "/";
};
