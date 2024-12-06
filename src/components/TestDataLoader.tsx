import React from 'react';
import { Button, VStack, useToast } from '@chakra-ui/react';
import { useSchemaStore } from '../store/schemaStore';
import { mockSchema } from '../mocks/testData';
import { validateSchema } from '../utils/schemaValidation';

export const TestDataLoader: React.FC = () => {
  const toast = useToast();
  const setSchema = useSchemaStore((state) => state.setSchema);

  const loadTestData = () => {
    const errors = validateSchema(mockSchema);
    
    if (errors.length > 0) {
      toast({
        title: 'Validation Error',
        description: errors[0].message,
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setSchema(mockSchema);
    toast({
      title: 'Test Data Loaded',
      description: 'Mock schema has been loaded successfully',
      status: 'success',
      duration: 2000,
    });
  };

  return (
    <VStack spacing={4}>
      <Button
        colorScheme="yellow"
        onClick={loadTestData}
        width="full"
      >
        Load Test Data
      </Button>
    </VStack>
  );
};