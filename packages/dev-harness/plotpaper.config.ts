// =============================================================================
// Plotpaper Dev Harness Configuration
//
// Fill in your InstantDB app ID to use a real database.
// Create a free InstantDB app at https://instantdb.com
// =============================================================================

export default {
  /** Your InstantDB app ID (from https://instantdb.com/dash) */
  instantdbAppId: "65cf50d1-ed04-4ee4-b3b8-e436ac76091a",

  /** Mock user info returned by sdk.getUserInfo() */
  user: {
    displayName: "Dev User",
    imageUrl: null as string | null,
    profileId: "dev-user-001",
  },

  /** Mock credits balance */
  credits: 10000,

  /** App metadata returned by sdk.getAppInfo() */
  app: {
    appId: "dev-app-001",
    appName: "My Dev App",
  },
};
