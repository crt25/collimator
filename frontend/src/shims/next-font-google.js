const createFontMock = () => () => ({
  className: "mocked-font",
  style: {
    fontFamily: "sans-serif",
  },
  variable: "--font-mocked",
});

export const Inter = createFontMock();
