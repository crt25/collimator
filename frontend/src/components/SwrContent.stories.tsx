import SwrContent from "./SwrContent";

type Args = Parameters<typeof SwrContent>[0];

export default {
  component: SwrContent,
  title: "SwrContent",
};

const children = (data: string) => <div>data: {data}</div>;
const error = new Error("something bad happened");

export const Default = {
  args: {
    data: "some data",
    error: undefined,
    isLoading: false,
    children,
  } as Args,
};

export const WhenLoadingWithStaleData = {
  args: {
    data: "some data",
    error: undefined,
    isLoading: true,
    children,
  } as Args,
};

export const WhenLoadingWithoutStaleData = {
  args: {
    data: undefined,
    error: undefined,
    isLoading: true,
    children,
  } as Args,
};

export const WhenErroredWithStaleDataWhileLoading = {
  args: {
    data: "some data",
    error: error,
    isLoading: true,
    children,
  } as Args,
};

export const WhenErroredWithStaleDataWhileNotLoading = {
  args: {
    data: "some data",
    error: error,
    isLoading: false,
    children,
  } as Args,
};

export const WhenErroredWithoutStaleDataWhileLoading = {
  args: {
    data: undefined,
    error: error,
    isLoading: true,
    children,
  } as Args,
};

export const WhenErroredWithoutStaleDataWhileNotLoading = {
  args: {
    data: undefined,
    error: error,
    isLoading: false,
    children,
  } as Args,
};
