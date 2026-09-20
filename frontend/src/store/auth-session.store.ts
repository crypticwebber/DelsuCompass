const KEY = "delsu.auth.session";

// This is only a cookie selector, never a refresh token. Each new login gets
// a new selector, including logins in a duplicated browser tab.
export const authSessionStore = {
  get: () => sessionStorage.getItem(KEY),
  set: (id: string) => sessionStorage.setItem(KEY, id),
  clear: () => sessionStorage.removeItem(KEY),
};
