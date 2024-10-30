export const mockAuthStateChanged = jest.fn();
export const mockSignOut = jest.fn().mockResolvedValue(undefined);
export const mockCredential = jest.fn();
export const mockSignInWithCredential = jest.fn();

export const getAuth = jest.fn(() => ({
  currentUser: null,
  signOut: mockSignOut,
}));

export const onAuthStateChanged = jest.fn((_auth, callback) => {
  mockAuthStateChanged.mockImplementation(callback);
  callback(null);
  return jest.fn(); // unsubscribe
});

export const GoogleAuthProvider = {
  credential: mockCredential,
};

export const signInWithCredential = mockSignInWithCredential;