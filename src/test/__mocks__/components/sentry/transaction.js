export const startTransaction = () => ({
  setData: jest.fn(),
  setTag: jest.fn(),
  setStatus: jest.fn(),
  finish: jest.fn(),
});
