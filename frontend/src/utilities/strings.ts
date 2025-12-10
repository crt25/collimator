export const capitalizeString = (str: string): string =>
  str.toLowerCase().charAt(0).toUpperCase() + str.toLowerCase().slice(1);
