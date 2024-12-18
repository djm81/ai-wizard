import { mockUser } from '../auth';

export const getAuth = jest.fn().mockReturnValue({
  currentUser: mockUser,
  onAuthStateChanged: jest.fn(),
  signInWithCredential: jest.fn(),
  signOut: jest.fn()
});

export { mockUser };
export const GoogleAuthProvider = {
  credential: jest.fn()
};
