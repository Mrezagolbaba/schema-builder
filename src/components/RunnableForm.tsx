import React from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  HStack,
  IconButton,
  Text,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { Runnable, InputType } from '../types/schema';
import { useSchemaStore } from '../store/schemaStore';
import { RiDeleteBin7Line } from "react-icons/ri";

interface RunnableFormProps {
  runnableIndex?: number;
  onClose?: () => void;
}

export const RunnableForm: React.FC<RunnableFormProps> = ({ runnableIndex, onClose }) => {
  const { addRunnable, removeRunnable, addInput, removeInput, schema } = useSchemaStore();
  const runnable = runnableIndex !== undefined ? schema.runnables[runnableIndex] : undefined;
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Runnable>({
    defaultValues: runnable,
  });

  const onSubmit = (data: Runnable) => {
    if (runnableIndex === undefined) {
      addRunnable({ ...data, inputs: [] });
    }
    onClose?.();
  };

  const handleAddInput = () => {
    if (runnableIndex !== undefined) {
      addInput(runnableIndex, {
        name: `input${runnable?.inputs.length || 0}`,
        type: undefined,
        label: '',
        required: false,
        order: 0
      });
    }
  };

  const handleDeleteInput = (inputIndex: number) => {
    if (runnableIndex !== undefined) {
      removeInput(runnableIndex, inputIndex);
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit(onSubmit)} p={4}>
      <VStack spacing={4} align="stretch">
        <FormControl isRequired>
          <FormLabel>Type</FormLabel>
          <Select {...register('type', { required: true })} data-testid="runnable-type-select">
            <option value="initial">Initial</option>
            <option value="secondary">Secondary</option>
          </Select>
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Path</FormLabel>
          <Input {...register('path', { required: true })} data-testid="runnable-path-input" />
        </FormControl>

        {runnableIndex !== undefined && (
          <>
            <Box>
              <HStack justify="space-between" mb={2}>
                <Text fontWeight="bold">Inputs</Text>
                <Button 
                  size="sm" 
                  onClick={handleAddInput}
                  data-testid="add-input-button"
                >
                  Add Input
                </Button>
              </HStack>

              <VStack spacing={2} align="stretch">
                {runnable?.inputs.map((input, index) => (
                  <HStack
                    key={index}
                    w="full"
                    p={2}
                    bg="gray.50"
                    borderRadius="md"
                  >
                    <Text flex={1}>{input.name}</Text>
                    <IconButton
                      size="sm"
                      icon={<RiDeleteBin7Line />}
                      aria-label="Delete input"
                      data-testid={`delete-input-button-${index}`}
                      onClick={() => handleDeleteInput(index)}
                    />
                  </HStack>
                ))}
              </VStack>
            </Box>

            <Button
              colorScheme="red"
              variant="outline"
              onClick={() => {
                removeRunnable(runnableIndex);
                onClose?.();
              }}
              data-testid="delete-runnable-button"
            >
              Delete Runnable
            </Button>
          </>
        )}

        <Button 
          type="submit" 
          colorScheme="blue"
          data-testid="submit-runnable-button"
        >
          {runnableIndex === undefined ? 'Create Runnable' : 'Update Runnable'}
        </Button>
      </VStack>
    </Box>
  );
};