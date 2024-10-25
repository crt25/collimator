import type { ReactRenderer } from "@storybook/react";
import { DecoratorFunction } from "storybook/internal/types";

export type StorybookDecorator = DecoratorFunction<ReactRenderer>;
