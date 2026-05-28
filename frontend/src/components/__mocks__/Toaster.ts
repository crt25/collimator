/**
 * Manual Jest mock for Toaster.
 *
 * The real toaster is a Chakra UI object whose .success/.error methods are not
 * Jest mock functions, so assertions like toHaveBeenCalledWith would throw.
 * Which is why we mock it.
 */
export const toaster = {
  success: jest.fn(),
  error: jest.fn(),
};
