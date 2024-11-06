import MultiSwrContent from "./MultiSwrContent";

export default {
  component: MultiSwrContent,
  title: "MultiSwrContent",
};

const children = ([data1, data2]: [string, string]) => (
  <div>
    <p>data1: {data1}</p>
    <p>data2: {data2}</p>
  </div>
);
const error = new Error("something bad happened");

export const Default = {
  args: {
    data: ["some data", "some other data"],
    errors: [undefined, undefined],
    isLoading: [false, false],
    children,
  },
};

export const WhenSomeLoadingWithStaleData = {
  args: {
    data: ["some data", "some other data"],
    errors: [undefined, undefined],
    isLoading: [true, false],
    children,
  },
};

export const WhenAllLoadingWithStaleData = {
  args: {
    data: ["some data", "some other data"],
    errors: [undefined, undefined],
    isLoading: [true, true],
    children,
  },
};

export const WhenSomeLoadingWithoutStaleData = {
  args: {
    data: [undefined, "some other data"],
    errors: [undefined, undefined],
    isLoading: [true, false],
    children,
  },
};

export const WhenAllLoadingWithoutStaleData = {
  args: {
    data: [undefined, undefined],
    errors: [undefined, undefined],
    isLoading: [true, true],
    children,
  },
};

export const WhenSomeErroredWithStaleDataWhileLoading = {
  args: {
    data: ["some data", "some other data"],
    errors: [error, undefined],
    isLoading: [true, false],
    children,
  },
};

export const WhenAllErroredWithStaleDataWhileLoading = {
  args: {
    data: ["some data", "some other data"],
    errors: [error, error],
    isLoading: [true, true],
    children,
  },
};

export const WhenSomeErroredWithStaleDataWhileNotLoading = {
  args: {
    data: ["some data", "some other data"],
    errors: [error, undefined],
    isLoading: [false, false],
    children,
  },
};

export const WhenAllErroredWithStaleDataWhileNotLoading = {
  args: {
    data: ["some data", "some other data"],
    errors: [error, error],
    isLoading: [false, false],
    children,
  },
};

export const WhenSomeErroredWithoutStaleDataWhileLoading = {
  args: {
    data: [undefined, "some other data"],
    errors: [error, undefined],
    isLoading: [true, false],
    children,
  },
};

export const WhenAllErroredWithoutStaleDataWhileLoading = {
  args: {
    data: [undefined, undefined],
    errors: [error, error],
    isLoading: [true, true],
    children,
  },
};

export const WhenSomeErroredWithoutStaleDataWhileNotLoading = {
  args: {
    data: [undefined, "some other data"],
    errors: [error, undefined],
    isLoading: [false, true],
    children,
  },
};

export const WhenAllErroredWithoutStaleDataWhileNotLoading = {
  args: {
    data: [undefined, undefined],
    errors: [error, error],
    isLoading: [false, false],
    children,
  },
};
