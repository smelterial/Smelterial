import { getContext, setContext } from "svelte";

export type IconStyle = "outlined" | "rounded" | "sharp" | `custom__${string}`;

export type IconSize = 20 | 24 | 40 | 48 | `${20 | 24 | 40 | 48}`;

export type IconWeight =
  | 100
  | 200
  | 300
  | 400
  | 500
  | 600
  | 700
  | `${100 | 200 | 300 | 400 | 500 | 600 | 700}`;

export type IconGrade = number | `${number}`;

export type IconContext =
  | {
      style: IconStyle;
      fill: boolean;
      weight: IconWeight;
      size: IconSize;
      grade: IconGrade;
    }
  | undefined;

export const defaultIconContext = {
  style: "outlined",
  fill: false,
  weight: 400,
  size: 24,
  grade: 0,
} satisfies NonNullable<IconContext>;

const contextKey = Symbol("iconContext");

export const iconContext = {
  get: () => getContext<IconContext>(contextKey) ?? defaultIconContext,
  set: (context: IconContext): void =>
    void setContext(contextKey, { ...iconContext.get(), ...context }),
};
