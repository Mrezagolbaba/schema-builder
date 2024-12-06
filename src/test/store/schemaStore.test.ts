import { describe, it, expect, beforeEach } from 'vitest';
import { useSchemaStore } from '../../store/schemaStore';
import { Runnable, Input, InputType } from '../../types/schema';

describe('SchemaStore', () => {
  beforeEach(() => {
    // Reset the store completely
    const store = useSchemaStore.getState();
    store.setSchema({ runnables: [] });
  });

  it('initializes with empty runnables', () => {
    const store = useSchemaStore.getState();
    expect(store.schema.runnables).toEqual([]);
  });

  it('adds a runnable', () => {
    const store = useSchemaStore.getState();
    const runnable: Runnable = {
      type: 'initial',
      path: '/test',
      inputs: []
    };

    store.addRunnable(runnable);
    
    // Wait for state update
    expect(useSchemaStore.getState().schema.runnables).toHaveLength(1);
    expect(useSchemaStore.getState().schema.runnables[0]).toEqual(runnable);
  });

  it('removes a runnable', () => {
    const store = useSchemaStore.getState();
    const runnable: Runnable = {
      type: 'initial',
      path: '/test',
      inputs: []
    };

    // Add and then remove
    store.addRunnable(runnable);
    expect(useSchemaStore.getState().schema.runnables).toHaveLength(1);

    store.removeRunnable(0);
    expect(useSchemaStore.getState().schema.runnables).toHaveLength(0);
  });

  it('adds an input to a runnable', () => {
    const store = useSchemaStore.getState();
    const runnable: Runnable = {
      type: 'initial',
      path: '/test',
      inputs: []
    };

    // First add a runnable
    store.addRunnable(runnable);
    
    // Verify runnable was added
    expect(useSchemaStore.getState().schema.runnables).toHaveLength(1);

    const input: Input = {
      name: 'testInput',
      label: 'Test Input',
      type: 'initialInput' as InputType,
      required: false,
      order: 0
    };

    // Then add input to runnable
    store.addInput(0, input);
    
    // Get fresh state
    const state = useSchemaStore.getState().schema;
    expect(state.runnables[0].inputs).toBeDefined();
    expect(state.runnables[0].inputs).toHaveLength(1);
    expect(state.runnables[0].inputs[0]).toEqual(input);
  });

  it('handles undo/redo operations', () => {
    const store = useSchemaStore.getState();
    const runnable: Runnable = {
      type: 'initial',
      path: '/test',
      inputs: []
    };

    // Add runnable and verify
    store.addRunnable(runnable);
    expect(useSchemaStore.getState().schema.runnables).toHaveLength(1);

    // Undo and verify
    store.undo();
    expect(useSchemaStore.getState().schema.runnables).toHaveLength(0);

    // Redo and verify
    store.redo();
    expect(useSchemaStore.getState().schema.runnables).toHaveLength(1);
  });

  it('updates a runnable', () => {
    const store = useSchemaStore.getState();
    const initialRunnable: Runnable = {
      type: 'initial',
      path: '/test',
      inputs: []
    };

    // Add initial runnable
    store.addRunnable(initialRunnable);
    expect(useSchemaStore.getState().schema.runnables).toHaveLength(1);

    const updatedRunnable: Runnable = {
      type: 'secondary',
      path: '/updated',
      inputs: []
    };

    // Update runnable
    store.updateRunnable(0, updatedRunnable);
    
    // Get fresh state and verify
    const state = useSchemaStore.getState().schema;
    expect(state.runnables[0].type).toBe('secondary');
    expect(state.runnables[0].path).toBe('/updated');
  });
});