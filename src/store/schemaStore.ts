import { create } from 'zustand';
import { Schema, Runnable, Input } from '../types/schema';

interface History {
  past: Schema[];
  present: Schema;
  future: Schema[];
}

export interface SchemaStore {
  schema: Schema;
  history: History;
  setSchema: (schema: Schema) => void;
  addRunnable: (runnable: Runnable) => void;
  removeRunnable: (index: number) => void;
  addInput: (runnableIndex: number, input: Input) => void;
  removeInput: (runnableIndex: number, inputIndex: number) => void;
  updateInput: (runnableIndex: number, inputIndex: number, input: Input) => void;
  reorderInput: (runnableIndex: number, fromIndex: number, toIndex: number) => void;
  reorderRunnable: (fromIndex: number, toIndex: number) => void;
  undo: () => void;
  redo: () => void;
  updateRunnable: (index: number, updatedRunnable: any) => void;
}

const saveHistory = (state: History, newPresent: Schema): History => ({
  past: [...state.past, state.present],
  present: newPresent,
  future: [],
});

export const useSchemaStore = create<SchemaStore>((set) => ({
  schema: { runnables: [] },
  history: {
    past: [],
    present: { runnables: [] },
    future: [],
  },
  
  setSchema: (schema) =>
    set((state) => ({
      schema,
      history: saveHistory(state.history, schema),
    })),

  addRunnable: (runnable) =>
    set((state) => {
      const newSchema = {
        ...state.schema,
        runnables: [...state.schema.runnables, runnable],
      };
      return {
        schema: newSchema,
        history: saveHistory(state.history, newSchema),
      };
    }),

  removeRunnable: (index) =>
    set((state) => {
      const newSchema = {
        ...state.schema,
        runnables: state.schema.runnables.filter((_, i) => i !== index),
      };
      return {
        schema: newSchema,
        history: saveHistory(state.history, newSchema),
      };
    }),

  addInput: (runnableIndex, input) =>
    set((state) => {
      const newSchema = {
        ...state.schema,
        runnables: state.schema.runnables.map((runnable, index) =>
          index === runnableIndex
            ? { ...runnable, inputs: [...runnable.inputs, input] }
            : runnable
        ),
      };
      return {
        schema: newSchema,
        history: saveHistory(state.history, newSchema),
      };
    }),

  removeInput: (runnableIndex, inputIndex) =>
    set((state) => {
      const newSchema = {
        ...state.schema,
        runnables: state.schema.runnables.map((runnable, index) =>
          index === runnableIndex
            ? {
              ...runnable,
              inputs: runnable.inputs.filter((_, i) => i !== inputIndex),
            }
            : runnable
        ),
      };
      return {
        schema: newSchema,
        history: saveHistory(state.history, newSchema),
      };
    }),

  updateInput: (runnableIndex, inputIndex, input) =>
    set((state) => {
      const newSchema = {
        ...state.schema,
        runnables: state.schema.runnables.map((runnable, index) =>
          index === runnableIndex
            ? {
              ...runnable,
              inputs: runnable.inputs.map((i, idx) =>
                idx === inputIndex ? input : i
              ),
            }
            : runnable
        ),
      };
      return {
        schema: newSchema,
        history: saveHistory(state.history, newSchema),
      };
    }),

  reorderInput: (runnableIndex, fromIndex, toIndex) =>
    set((state) => {
      const runnable = state.schema.runnables[runnableIndex];
      const inputs = [...runnable.inputs];
      const [removed] = inputs.splice(fromIndex, 1);
      inputs.splice(toIndex, 0, removed);

      const newSchema = {
        ...state.schema,
        runnables: state.schema.runnables.map((r, index) =>
          index === runnableIndex ? { ...r, inputs } : r
        ),
      };
      return {
        schema: newSchema,
        history: saveHistory(state.history, newSchema),
      };
    }),

  reorderRunnable: (fromIndex: number, toIndex: number) =>
    set((state) => {
      const runnables = [...state.schema.runnables];
      const [removed] = runnables.splice(fromIndex, 1);
      runnables.splice(toIndex, 0, removed);

      const newSchema = {
        ...state.schema,
        runnables,
      };
      return {
        schema: newSchema,
        history: saveHistory(state.history, newSchema),
      };
    }),

  undo: () =>
    set((state) => {
      const previous = state.history.past[state.history.past.length - 1];
      if (!previous) return state;

      return {
        schema: previous,
        history: {
          past: state.history.past.slice(0, -1),
          present: previous,
          future: [state.history.present, ...state.history.future],
        },
      };
    }),

  redo: () =>
    set((state) => {
      const next = state.history.future[0];
      if (!next) return state;

      return {
        schema: next,
        history: {
          past: [...state.history.past, state.history.present],
          present: next,
          future: state.history.future.slice(1),
        },
      };
    }),

  updateRunnable: (index: number, updatedRunnable: any) =>
    set((state) => {
      const newSchema = { ...state.schema };
      newSchema.runnables[index] = updatedRunnable;
      return {
        schema: newSchema,
        history: {
          past: [...state.history.past, state.schema],
          present: newSchema,
          future: []
        }
      };
    }),
}));