let accessToken: string | null = null;

export const authTokenStore = {
  get: () => accessToken,
  set: (token: string | null) => { accessToken = token; },
  clear: () => { accessToken = null; },
};
