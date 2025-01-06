import { DecoratorFunction } from "storybook/internal/types";
import type { ReactRenderer } from "@storybook/react";

export type StorybookDecorator = DecoratorFunction<ReactRenderer>;
