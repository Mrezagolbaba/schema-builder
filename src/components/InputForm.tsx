import React from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Select,
  NumberInput,
  NumberInputField,
  Switch,
  VStack,
  Button,
  FormErrorMessage,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { Input as InputType, InputType as InputTypeEnum } from '../types/schema';

interface InputFormProps {
  runnableIndex: number;
  inputIndex?: number;
  existingInput?: InputType;
  onSubmit: (input: InputType) => void;
}

const InputTypes = [
  'initialInput',
  'slider',
  'dropdown',
  'action',
  'output',
  'textarea',
  'toggle',
] as InputTypeEnum[]

export const InputForm: React.FC<InputFormProps> = ({
  inputIndex,
  existingInput,
  onSubmit,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<InputType>({
    defaultValues: existingInput || {
      type: undefined,
      required: false,
      order: inputIndex,
    },
  });

  const inputType = watch('type');

  return (
    <Box as="form" onSubmit={handleSubmit(onSubmit)} data-testid="input-form">
      <VStack spacing={4}>
        <FormControl isRequired isInvalid={!!errors.name}>
          <FormLabel>Name</FormLabel>
          <Input 
            {...register('name', { required: 'Name is required' })}
            data-testid="input-name-field"
          />
          <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Type</FormLabel>
          <Select 
            {...register('type')}
            data-testid="input-type-select"
          >
            {InputTypes.map((type) => (
              <option key={type} value={type} data-testid={`input-type-option-${type}`}>
                {type}
              </option>
            ))}
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel>Required</FormLabel>
          <Switch 
            {...register('required')}
            data-testid="input-required-switch"
          />
        </FormControl>

        {inputType === 'slider' && (
          <>
            <FormControl isRequired>
              <FormLabel>Min</FormLabel>
              <NumberInput>
                <NumberInputField 
                  {...register('min', { required: true })}
                  data-testid="input-slider-min"
                />
              </NumberInput>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Max</FormLabel>
              <NumberInput>
                <NumberInputField 
                  {...register('max', { required: true })}
                  data-testid="input-slider-max"
                />
              </NumberInput>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Step</FormLabel>
              <NumberInput>
                <NumberInputField 
                  {...register('step', { required: true })}
                  data-testid="input-slider-step"
                />
              </NumberInput>
            </FormControl>
          </>
        )}

        {inputType === 'dropdown' && (
          <FormControl isRequired>
            <FormLabel>Options</FormLabel>
            <Input 
              {...register('options', { required: true })}
              data-testid="input-dropdown-options"
            />
          </FormControl>
        )}

        {inputType === 'action' && (
          <FormControl isRequired>
            <FormLabel>Action Type</FormLabel>
            <Input 
              {...register('actionType', { required: true })}
              data-testid="input-action-type"
            />
          </FormControl>
        )}

        {inputType === 'textarea' && (
          <FormControl>
            <FormLabel>Rows</FormLabel>
            <NumberInput>
              <NumberInputField 
                {...register('rows', { required: true })}
                data-testid="input-textarea-rows"
              />
            </NumberInput>
          </FormControl>
        )}

        <Button 
          type="submit" 
          colorScheme="blue" 
          width="full"
          data-testid="input-submit-button"
        >
          {existingInput ? 'Update Input' : 'Add Input'}
        </Button>
      </VStack>
    </Box>
  );
};