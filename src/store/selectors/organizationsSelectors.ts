import { RootState } from "../index";

export const selectOrganizations = (state: RootState) =>
  state.organization.organizations;
export const selectCurrentOrganization = (state: RootState) =>
  state.organization.currentOrganization;
export const selectWalletBalance = (state: RootState) =>
  state.organization.walletBalance;
export const selectWalletLoading = (state: RootState) =>
  state.organization.walletLoading;
export const selectWalletError = (state: RootState) =>
  state.organization.walletError;
export const selectWalletSilentLoading = (state: RootState) =>
  state.organization.walletSilentLoading;

export const selectCurrentUserRole = (state: RootState) =>
  state.organization.currentOrganization?.role || null;

export const selectIsCurrentOrgOwner = (state: RootState) =>
  state.organization.currentOrganization?.role === "owner";
