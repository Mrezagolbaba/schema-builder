import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RunnableForm } from '../../components/RunnableForm';
import { useSchemaStore } from '../../store/schemaStore';
import { ChakraProvider } from '@chakra-ui/react';
import React from 'react';
import '@testing-library/jest-dom';

// Mock the store
vi.mock('../../store/schemaStore', () => ({
  useSchemaStore: vi.fn(() => ({
    addRunnable: vi.fn(),
    removeRunnable: vi.fn(),
    addInput: vi.fn(),
    removeInput: vi.fn(),
    schema: {
      runnables: []
    }
  }))
}));

// Mock the toast
vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => vi.fn(),
  };
});

describe('RunnableForm', () => {
  const mockOnClose = vi.fn();
  let mockStore: {
    addRunnable: ReturnType<typeof vi.fn>;
    removeRunnable: ReturnType<typeof vi.fn>;
    addInput: ReturnType<typeof vi.fn>;
    removeInput: ReturnType<typeof vi.fn>;
    schema: { runnables: any[] };
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockStore = {
      addRunnable: vi.fn(),
      removeRunnable: vi.fn(),
      addInput: vi.fn(),
      removeInput: vi.fn(),
      schema: {
        runnables: []
      }
    };
    (useSchemaStore as any).mockImplementation(() => mockStore);
  });

  it('handles input addition and removal', async () => {
    const existingRunnable = {
      type: 'initial',
      path: '/test/path',
      inputs: [
        {
          name: 'input0',
          type: 'string',
          label: '',
          required: false,
          order: 0
        }
      ]
    };

    mockStore.schema.runnables = [existingRunnable];

    render(
      <ChakraProvider>
        <RunnableForm runnableIndex={0} onClose={mockOnClose} />
      </ChakraProvider>
    );

    // Verify the initial input is rendered
    expect(screen.getByText('input0')).toBeInTheDocument();

    // Delete the first input
    const deleteButton = screen.getByTestId('delete-input-button-0');
    fireEvent.click(deleteButton);
    expect(mockStore.removeInput).toHaveBeenCalledWith(0, 0);

    // Update the runnable's inputs to reflect the deletion
    mockStore.schema.runnables[0].inputs = [];

    // Add new input
    const addButton = screen.getByTestId('add-input-button');
    fireEvent.click(addButton);

    // Check that addInput was called with exactly these arguments
    expect(mockStore.addInput).toHaveBeenCalledWith(0, {
      name: 'input0',
      type: undefined,
      label: '',
      required: false,
      order: 0
    });

    // Alternative assertion that's less strict about the exact object structure
    expect(mockStore.addInput).toHaveBeenCalledWith(
      expect.any(Number),
      expect.objectContaining({
        name: expect.any(String),
        type: undefined,
        label: expect.any(String),
        required: expect.any(Boolean),
        order: expect.any(Number)
      })
    );
  });

  // Add separate test specifically for adding input
  it('adds input with correct parameters', async () => {
    const existingRunnable = {
      type: 'initial',
      path: '/test/path',
      inputs: []
    };

    mockStore.schema.runnables = [existingRunnable];

    render(
      <ChakraProvider>
        <RunnableForm runnableIndex={0} onClose={mockOnClose} />
      </ChakraProvider>
    );

    const addButton = screen.getByTestId('add-input-button');
    fireEvent.click(addButton);

    // Log the actual calls to help debug
    console.log('addInput calls:', mockStore.addInput.mock.calls);

    expect(mockStore.addInput).toHaveBeenCalledWith(0, {
      name: 'input0',
      type: undefined,
      label: '',
      required: false,
      order: 0
    });
  });

  it('submits form with valid data', async () => {
    render(
      <ChakraProvider>
        <RunnableForm onClose={mockOnClose} />
      </ChakraProvider>
    );

    // Fill in form fields
    const typeInput = screen.getByTestId('runnable-type-select');
    const pathInput = screen.getByTestId('runnable-path-input');
    
    fireEvent.change(typeInput, { target: { value: 'initial' } });
    fireEvent.change(pathInput, { target: { value: '/test/path' } });

    // Submit form
    const submitButton = screen.getByTestId('submit-runnable-button');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockStore.addRunnable).toHaveBeenCalledWith({
        type: 'initial',
        path: '/test/path',
        inputs: []
      });
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('handles runnable deletion', async () => {
    const existingRunnable = {
      type: 'initial',
      path: '/test/path',
      inputs: []
    };

    mockStore.schema.runnables = [existingRunnable];

    render(
      <ChakraProvider>
        <RunnableForm runnableIndex={0} onClose={mockOnClose} />
      </ChakraProvider>
    );

    const deleteButton = screen.getByTestId('delete-runnable-button');
    fireEvent.click(deleteButton);

    expect(mockStore.removeRunnable).toHaveBeenCalledWith(0);
    expect(mockOnClose).toHaveBeenCalled();
  });
});