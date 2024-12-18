export const collection = jest.fn();
export const addDoc = jest.fn().mockResolvedValue({ id: 'test-doc-id' });
export const serverTimestamp = jest.fn().mockReturnValue(new Date());
export const getFirestore = jest.fn().mockReturnValue({
  app: {
    name: 'test-app',
    options: {}
  },
  type: 'firestore'
});
