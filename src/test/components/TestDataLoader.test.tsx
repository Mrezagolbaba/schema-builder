
import { describe, it, expect, vi, Mock } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TestDataLoader } from '../../components/TestDataLoader';
import { useSchemaStore } from '../../store/schemaStore';
import { ChakraProvider } from '@chakra-ui/react';
import React from 'react';

// Mock the store
vi.mock('../../store/schemaStore', () => ({
  useSchemaStore: vi.fn(),
}));

describe('TestDataLoader', () => {
  it('loads test data successfully', async () => {
    const setSchema = vi.fn();
    (useSchemaStore as any).mockImplementation((selector: (arg0: { setSchema: Mock<(...args: any[]) => any>; }) => any) => selector({ setSchema }));

    render(
      <ChakraProvider>
        <TestDataLoader />
      </ChakraProvider>
    );

    const button = screen.getByText('Load Test Data');
    fireEvent.click(button);

    expect(setSchema).toHaveBeenCalled();
  });
});