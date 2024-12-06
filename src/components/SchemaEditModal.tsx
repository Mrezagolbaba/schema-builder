import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  NumberInput,
  NumberInputField,
  useToast,
  Box,
  HStack,
  FormErrorMessage,
  Textarea,
  Switch,
  IconButton
} from '@chakra-ui/react';
import { RiSaveLine, RiCloseLine } from 'react-icons/ri';
import { Runnable } from '../types/schema';
import { validateRunnableData, ValidationError } from '../utils/schemaValidation';
import { useSchemaStore } from '../store/schemaStore';

interface Input {
  name: string;
  label?: string;
  type: string;
  required: boolean;
  description?: string;
  defaultValue?: any;
  order: number;
}

interface SchemaEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  runnable: Runnable | null;
  onSave: () => void;
  runnableIndex: number;
}

const SchemaEditModal: React.FC<SchemaEditModalProps> = ({ isOpen, onClose, runnable, onSave, runnableIndex }) => {
  const [editedRunnable, setEditedRunnable] = useState<Runnable | null>(runnable);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isValidOrder, setIsValidOrder] = useState(true);
  const setSchema = useSchemaStore(state => state.setSchema);
  const schema = useSchemaStore(state => state.schema);

  const toast = useToast();

  useEffect(() => {
    setEditedRunnable(runnable);
    setErrors([]);
  }, [runnable]);

  const handleInputChange = (field: keyof Runnable, value: any): void => {
    setEditedRunnable(prev => prev ? {
      ...prev,
      [field]: value
    } : null);
  };


  const handleSave = (): void => {
    if (!editedRunnable) return;
    const errors = validateRunnableData(editedRunnable);
    setErrors(errors);

    if (validateRunnableData(editedRunnable)) {

      if (errors.length === 0) {
        const newRunnables = [...schema.runnables];
        newRunnables[runnableIndex] = editedRunnable;
        const newSchema = {
          ...schema,
          runnables: newRunnables
        };
        
        // Update store with new schema to maintain history
        setSchema(newSchema);
        onSave();
        onClose();
        toast({
          title: 'Schema updated',
          status: 'success',
          duration: 2000,
        });
      }
    } else {
      toast({
        title: 'Validation Error',
        description: errors.map(e => e.message).join(', '),
        status: 'error',
        duration: 500,
        isClosable: true,
        variant: 'solid',
        position: 'bottom',
      });
    }
  };
  const getFieldError = (path: string): string | undefined => {
    return errors.find(error => error.path === path)?.message;
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Schema</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isInvalid={!!getFieldError('type')}>
              <FormLabel>Type</FormLabel>
              <Input
                value={editedRunnable?.type}
                onChange={(e) => handleInputChange('type', e.target.value as 'initial' | 'secondary')}
              />
              <FormErrorMessage>{getFieldError('type')}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!getFieldError('path')}>
              <FormLabel>Path</FormLabel>
              <Input
                value={editedRunnable?.path}
                onChange={(e) => handleInputChange('path', e.target.value)}
              />
              <FormErrorMessage>{getFieldError('path')}</FormErrorMessage>
            </FormControl>
            <FormControl>
              <FormLabel>Raw JSON</FormLabel>
              <Textarea
                value={JSON.stringify(editedRunnable, null, 2)}
                onChange={(e) => {
                  try {
                    setEditedRunnable(JSON.parse(e.target.value));
                  } catch (error) {
                    // Allow invalid JSON while typing
                  }
                }}
                minH="200px"
                fontFamily="mono"
              />
            </FormControl>


            {editedRunnable?.inputs?.map((input, index) => (
              <Box key={index} p={4} borderWidth="1px" borderRadius="md" w="full">
                <HStack w="full" justify="space-between" mb={4}>
                  <Text fontWeight="medium">Input {index + 1}</Text>
                  <IconButton
                    icon={<RiCloseLine />}
                    aria-label="Delete input"
                    size="sm"
                    colorScheme="red"
                    variant="ghost"
                    onClick={() => {
                      if (editedRunnable?.inputs.length <= 1) {
                        toast({
                          title: "Error",
                          description: "At least one input is required",
                          status: "error",
                          duration: 3000
                        });
                        return;
                      }
                      const newInputs = editedRunnable.inputs.filter((_, i) => i !== index);
                      const reorderedInputs = newInputs.map((input, i) => ({
                        ...input,
                        order: i + 1
                      }));
                      handleInputChange('inputs', reorderedInputs);
                    }}
                  />
                </HStack>
                <VStack spacing={3}>

                  <FormControl isInvalid={!!getFieldError(`inputs[${index}].name`)}>
                    <FormLabel>Input Name</FormLabel>
                    <Input
                      value={input.name}
                      onChange={(e) => {
                        const newInputs = [...editedRunnable.inputs];
                        newInputs[index] = { ...input, name: e.target.value };
                        handleInputChange('inputs', newInputs);
                      }}
                    />
                    <FormErrorMessage>{getFieldError(`inputs[${index}].name`)}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={!!getFieldError(`inputs[${index}].order`)}>
                    <FormLabel>Order</FormLabel>
                    <NumberInput
                      value={input.order}
                      min={1}
                      max={editedRunnable?.inputs.length}
                      onChange={(value) => {
                        const orderNum = parseInt(value);
                        if (isNaN(orderNum) || !editedRunnable) return;
                        if (orderNum < 1 || orderNum > editedRunnable.inputs.length) return;
                        const isValid = orderNum >= 1 && orderNum <= editedRunnable.inputs.length;
                        if (!isValid) {
                          setIsValidOrder(false);
                          return;
                        }

                        setIsValidOrder(true);
                        const oldOrder = input.order;
                        const newInputs = [...editedRunnable.inputs].map(input => ({
                          ...input,
                          order: input.order === oldOrder ? orderNum :
                            input.order >= orderNum && input.order < oldOrder ? input.order + 1 :
                              input.order <= orderNum && input.order > oldOrder ? input.order - 1 :
                                input.order
                        }));

                        handleInputChange('inputs', newInputs);
                      }}
                    >
                      <NumberInputField />
                    </NumberInput>
                    {!isValidOrder && (
                      <FormErrorMessage>
                        Order must be between 1 and {editedRunnable?.inputs.length}
                      </FormErrorMessage>
                    )}
                    <FormErrorMessage>{getFieldError(`inputs[${index}].order`)}</FormErrorMessage>
                  </FormControl>
                  <FormControl isInvalid={!!getFieldError(`inputs[${index}].type`)}>
                    <FormLabel>Type</FormLabel>
                    <Input
                      value={input.type}
                      onChange={(e) => {
                        const newInputs = [...editedRunnable.inputs];
                        newInputs[index] = { ...input, type: e.target.value as 'dropdown' | 'slider' | 'textarea' | 'toggle' | 'action' | 'output' | 'initialInput' };
                        handleInputChange('inputs', newInputs);
                      }}
                    />
                    <FormErrorMessage>{getFieldError(`inputs[${index}].type`)}</FormErrorMessage>
                  </FormControl>
                  <FormControl isInvalid={!!getFieldError(`inputs[${index}].required`)}>
                    <FormLabel>Required</FormLabel>
                    <Switch
                      isChecked={input.required}
                      onChange={(e) => {
                        const newInputs = [...editedRunnable.inputs];
                        newInputs[index] = { ...input, required: e.target.checked };
                        handleInputChange('inputs', newInputs);
                      }}
                    />
                    <FormErrorMessage>{getFieldError(`inputs[${index}].required`)}</FormErrorMessage>
                  </FormControl>
                  <FormControl isInvalid={!!getFieldError(`inputs[${index}].description`)}>
                    <FormLabel>Description</FormLabel>
                    <Input
                      value={input.description}
                      onChange={(e) => {
                        const newInputs = [...editedRunnable.inputs];
                        newInputs[index] = { ...input, description: e.target.value };
                        handleInputChange('inputs', newInputs);
                      }}
                    />
                    <FormErrorMessage>{getFieldError(`inputs[${index}].description`)}</FormErrorMessage>
                  </FormControl>
                  <FormControl isInvalid={!!getFieldError(`inputs[${index}].defaultValue`)}>
                    <FormLabel>Default Value</FormLabel>
                    <Input
                      value={input.defaultValue}
                      onChange={(e) => {
                        const newInputs = [...editedRunnable.inputs];
                        newInputs[index] = { ...input, defaultValue: e.target.value };
                        handleInputChange('inputs', newInputs);
                      }}
                    />
                    <FormErrorMessage>{getFieldError(`inputs[${index}].defaultValue`)}</FormErrorMessage>
                  </FormControl>
                  {input.type === 'slider' && (

                    <Box w="full">
                      <FormControl isInvalid={!!getFieldError(`inputs[${index}].min`)}>
                        <FormLabel>Min</FormLabel>
                        <NumberInput
                          value={input.min}
                          onChange={(value) => {
                            const newInputs = [...editedRunnable.inputs];
                            newInputs[index] = { ...input, min: parseInt(value) };
                            handleInputChange('inputs', newInputs);
                          }}
                        >
                          <NumberInputField />
                        </NumberInput>
                        <FormErrorMessage>{getFieldError(`inputs[${index}].min`)}</FormErrorMessage>
                      </FormControl>
                      <FormControl isInvalid={!!getFieldError(`inputs[${index}].max`)}>
                        <FormLabel>Max</FormLabel>
                        <NumberInput
                          value={input.max}
                          onChange={(value) => {
                            const newInputs = [...editedRunnable.inputs];
                            newInputs[index] = { ...input, max: parseInt(value) };
                            handleInputChange('inputs', newInputs);
                          }}
                        >
                          <NumberInputField />
                        </NumberInput>
                      </FormControl>
                      <FormControl isInvalid={!!getFieldError(`inputs[${index}].step`)}>
                        <FormLabel>Step</FormLabel>
                        <NumberInput
                          value={input.step}
                          onChange={(value) => {
                            const newInputs = [...editedRunnable.inputs];
                            newInputs[index] = { ...input, step: parseInt(value) };
                            handleInputChange('inputs', newInputs);
                          }}
                        >
                          <NumberInputField />
                        </NumberInput>
                      </FormControl>
                      <FormControl isInvalid={!!getFieldError(`inputs[${index}].mark`)}>
                        <FormLabel>Mark</FormLabel>
                        <Input
                          value={input.mark}
                          onChange={(e) => {
                            const newInputs = [...editedRunnable.inputs];
                            newInputs[index] = { ...input, mark: e.target.value };
                            handleInputChange('inputs', newInputs);
                          }}
                        />
                      </FormControl>
                    </Box>
                  )}
                </VStack>
              </Box>
            ))}

            {errors.length > 0 && (
              <Box p={4} bg="red.50" borderRadius="md" w="full" position="relative">
                <IconButton
                  icon={<RiCloseLine />}
                  aria-label="Close"
                  size="sm"
                  position="absolute"
                  right={2}
                  top={2}
                  variant="ghost"
                  color="gray.500"
                  _hover={{ color: "gray.700", bg: "red.100" }}
                  onClick={() => setErrors([])}
                />
                <Text color="red.500" fontWeight="bold" mb={2}>Validation Errors:</Text>
                <VStack align="start" mt={6}>
                  {errors.map((error, index) => (
                    <Text key={index} color="red.500">{error.message}</Text>
                  ))}
                </VStack>
              </Box>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <HStack spacing={2}>
            <Button leftIcon={<RiCloseLine />} variant="ghost" bg="white" onClick={onClose}>
              Cancel
            </Button>
            <Button
              leftIcon={<RiSaveLine />}
              colorScheme="blue"
              onClick={handleSave}
              isDisabled={errors.length > 0}
            >
              Save
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SchemaEditModal;