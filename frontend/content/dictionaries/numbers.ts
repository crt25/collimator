const excludedNumbers = new Set([
  4, // unlucky in Chinese, Japanese, and Korean cultures (sounds like "death")
  9, // unlucky in Japanese (sounds like "suffering")
  13, // unlucky in Western cultures
  14, // white supremacist reference ("14 words" slogan)
  17, // unlucky in some wester cultures
  18, // neo-Nazi code (1=A, 8=H → "Adolf Hitler")
  28, // neo-Nazi code ("Blood & Honour")
  43, // unlucky in Japanese (sounds like "stillbirth")
  49, // unlucky in Japanese and Chinese
  69, // sexual connotation
  88, // neo-Nazi code (8=H, 88="Heil Hitler")
]);

// Static list of numbers 0-99, excluding problematic numbers
const numbers: string[] = Array.from({ length: 100 }, (_value, i) => i)
  .filter((n) => !excludedNumbers.has(n))
  .map(String);

export default numbers;
