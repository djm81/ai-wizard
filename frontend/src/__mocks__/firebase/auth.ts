export const getAuth = jest.fn(() => ({
  currentUser: null,
  signOut: jest.fn().mockResolvedValue(undefined),
}));

export const signInWithCredential = jest.fn();

export const GoogleAuthProvider = {
  credential: jest.fn(),
};

export const onAuthStateChanged = jest.fn();