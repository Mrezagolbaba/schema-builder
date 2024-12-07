export interface Schema {
  runnables: Runnable[];
}

export interface Runnable {
  type: 'initial' | 'secondary';
  path: string;
  inputs: Input[];
  output?: {
    dataTitle?: string;
    tip?: string;
  };
}

export interface Input {
  name: string;
  label: string;
  type: InputType|undefined;
  order: number;
  required: boolean;
  description?: string;
  defaultValue?: string | number | boolean;
  options?: Option[];
  min?: number;
  max?: number;
  step?: number;
  mark?: string;
  actionType?: string;
  outputKey?: string;
  initialInputKey?: string;
  rows?: number;
  value?: string | number | boolean;
}

export type InputType =
  | "dropdown"
  | "slider"
  | "textarea"
  | "toggle"
  | "action"
  | "output"
  | "initialInput";

export interface Option {
  label: string;
  value: string;
}
export interface OutputConfig {
  dataTitle?: string;
  tip?: string;
}
