export const selectOrganizations = (state) => state.organization.organizations;
export const selectCurrentOrganization = (state) => state.organization.currentOrganization;
export const selectWalletBalance = (state) => state.organization.walletBalance;
export const selectWalletLoading = (state) => state.organization.walletLoading;
export const selectWalletError = (state) => state.organization.walletError;
export const selectWalletSilentLoading = (state) => state.organization.walletSilentLoading;

export const selectCurrentUserRole = (state) =>
  state.organization.currentOrganization?.role || null;

export const selectIsCurrentOrgOwner = (state) =>
  state.organization.currentOrganization?.role === "owner";