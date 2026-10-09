export const hasCapability = (authorizationProfile, capability) => {
  if (!authorizationProfile || !capability) return false;
  return authorizationProfile.capabilities?.includes(capability) ?? false;
};

export const hasAnyCapability = (authorizationProfile, capabilities = []) =>
  capabilities.some((capability) => hasCapability(authorizationProfile, capability));

export const getHomePath = (authorizationProfile, user = null) => {
  if (hasCapability(authorizationProfile, "platform.dashboard.read")) return "/super-admin";
  if (hasCapability(authorizationProfile, "store.read")) return "/store";
  if (hasCapability(authorizationProfile, "employee.create")) return "/branch";
  if (hasCapability(authorizationProfile, "order.create")) return "/cashier";

  const roleCode = authorizationProfile?.roles?.[0]?.code || user?.role;
  if (roleCode === "ROLE_ADMIN") return "/super-admin";
  if (roleCode === "ROLE_STORE_ADMIN" || roleCode === "ROLE_STORE_MANAGER") return "/store";
  if (roleCode === "ROLE_BRANCH_ADMIN" || roleCode === "ROLE_BRANCH_MANAGER") return "/branch";
  if (roleCode === "ROLE_CASHIER" || roleCode === "ROLE_BRANCH_CASHIER") return "/cashier";

  return "/";
};
