import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SchemaPreview } from '../../components/SchemaPreview';
import { useSchemaStore } from '../../store/schemaStore';
import { ChakraProvider } from '@chakra-ui/react';
import '@testing-library/jest-dom';
import React from 'react';
import { Runnable } from '../../types/schema';

const createMockStore = () => ({
  schema: {
    runnables: [] as Runnable[]
  },
  history: {
    past: Array<{ runnables: Runnable[] }>(),
    present: { runnables: [] as Runnable[] },
    future: Array<{ runnables: Runnable[] }>()
  },
  setSchema: vi.fn(),
  addRunnable: vi.fn(),
  removeRunnable: vi.fn(),
  addInput: vi.fn(),
  removeInput: vi.fn(),
  updateInput: vi.fn(),
  reorderInput: vi.fn(),
  reorderRunnable: vi.fn(),
  undo: vi.fn(),
  redo: vi.fn(),
  updateRunnable: vi.fn()
});

// Mock the store
vi.mock('../../store/schemaStore', () => ({
  useSchemaStore: vi.fn()
}));

describe('SchemaPreview', () => {
  let mockStore: ReturnType<typeof createMockStore>;

  beforeEach(() => {
    mockStore = createMockStore();
    (useSchemaStore as unknown as Mock).mockImplementation(() => mockStore);
  });




  it('enables undo button when history exists', () => {
    // Mock history with past actions
    mockStore.history.past = [{ runnables: [] }];

    render(
      <ChakraProvider>
        <SchemaPreview />
      </ChakraProvider>
    );

    const undoButton = screen.getByLabelText(/undo/i);
    expect(undoButton).not.toBeDisabled();
  });
});