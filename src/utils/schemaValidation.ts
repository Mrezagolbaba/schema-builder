import { Schema, Runnable, Input } from '../types/schema';

export interface ValidationError {
  path: string;
  message: string;
}

export const validateInput = (input: Input): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Validate required fields
  if (!input.name) {
    errors.push({ path: `input.name`, message: 'Name is required' });
  }
  if (!input.label) {
    errors.push({ path: `input.label`, message: 'Label is required' });
  }
  if (!input.type) {
    errors.push({ path: `input.type`, message: 'Type is required' });
  }

  // Type-specific validation
  switch (input.type) {
    case 'slider':
      if (typeof input.min !== 'number') {
        errors.push({ path: `input.min`, message: 'Min value is required for slider' });
      }
      if (typeof input.max !== 'number') {
        errors.push({ path: `input.max`, message: 'Max value is required for slider' });
      }
      if (typeof input.step !== 'number') {
        errors.push({ path: `input.step`, message: 'Step value is required for slider' });
      }
      break;
    case 'dropdown':
      if (!input.options || !Array.isArray(input.options) || input.options.length === 0) {
        errors.push({ path: `input.options`, message: 'Options are required for dropdown' });
      }
      break;
  }

  return errors;
};

export const validateRunnableData = (runnable: Runnable): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Required fields validation
  if (!runnable.type || !runnable.path || !Array.isArray(runnable.inputs)) {
    errors.push(
      ...(!runnable.type ? [{ path: 'runnable.type', message: 'Type is required' }] : []),
      ...(!runnable.path ? [{ path: 'runnable.path', message: 'Path is required' }] : []),
      ...(!Array.isArray(runnable.inputs) ? [{ path: 'runnable.inputs', message: 'Inputs must be an array' }] : [])
    );
    return errors;
  }

  // Path validation
  if (typeof runnable.path !== 'string' || runnable.path.trim() === '') {
    errors.push({
      path: 'runnable.path',
      message: 'Path must be a valid non-empty string'
    });
  } else if (!runnable.path.startsWith('/')) {
    errors.push({
      path: 'runnable.path',
      message: 'Path must start with /'
    });
  } else if (/\s/.test(runnable.path)) {
    errors.push({
      path: 'runnable.path',
      message: 'Path cannot contain spaces'
    });
  } else if (!/^[a-zA-Z0-9/\-_]+$/.test(runnable.path)) {
    errors.push({
      path: 'runnable.path',
      message: 'Path can only contain letters, numbers, hyphens, underscores and forward slashes'
    });
  }

  // Unique input names validation
  const inputNames = new Set<string>();
  runnable.inputs.forEach((input, index) => {
    if (inputNames.has(input.name)) {
      errors.push({
        path: `runnable.inputs[${index}].name`,
        message: `Input name "${input.name}" is duplicated`
      });
    }
    inputNames.add(input.name);
  });
  if (!runnable.type || !runnable.path || !Array.isArray(runnable.inputs)) {
    errors.push(
      ...(!runnable.type ? [{ path: 'runnable.type', message: 'Type is required' }] : []),
      ...(!runnable.path ? [{ path: 'runnable.path', message: 'Path is required' }] : []),
      ...(!Array.isArray(runnable.inputs) ? [{ path: 'runnable.inputs', message: 'Inputs must be an array' }] : [])
    );
    return errors;
  }

  // Validate required fields have non-empty values
  runnable.inputs.forEach((input, index) => {
    if (input.required && (input.value === undefined || input.value === null || input.value === '')) {
      errors.push({
        path: `runnable.inputs[${index}].value`,
        message: `${input.label || input.name} is required`
      });
    }
  });
  // Individual input validation
  runnable.inputs.forEach((input, index) => {
    if (!input.name?.trim()) {
      errors.push({
        path: `runnable.inputs[${index}].name`,
        message: 'Input name is required'
      });
    }
    const inputErrors = validateInput(input);
    errors.push(...inputErrors.map(error => ({
      path: `runnable.inputs[${index}].${error.path}`,
      message: error.message
    })));
  });

  return errors;
};
const validateSchemaConstraints = (runnable: Runnable): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Empty runnable check not needed here since it's handled at schema level

  // Check input count constraints
  if (!runnable.inputs || runnable.inputs.length === 0) {
    errors.push({
      path: 'runnable.inputs',
      message: 'At least one input is required per runnable'
    });
  }

  if (runnable.inputs && runnable.inputs.length > 20) {
    errors.push({
      path: 'runnable.inputs',
      message: 'Maximum 20 inputs allowed per runnable'
    });
  }

  return errors;
};

export const validateSchema = (schema: Schema): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!Array.isArray(schema.runnables)) {
    errors.push({ path: 'schema.runnables', message: 'Runnables must be an array' });
    return errors;
  }

  if (schema.runnables.length === 0) {
    errors.push({ path: 'schema.runnables', message: 'At least one runnable is required' });
  }
  if (!schema.runnables || schema.runnables.length === 0) {
    errors.push({
      path: 'schema.runnables',
      message: 'At least one runnable is required'
    });
    return errors;
  }

  schema.runnables.forEach((runnable, index) => {
    const constraintErrors = validateSchemaConstraints(runnable);
    const runnableErrors = validateRunnableData(runnable);

    errors.push(
      ...constraintErrors.map(error => ({
        path: `schema.runnables[${index}].${error.path}`,
        message: error.message
      })),
      ...runnableErrors.map(error => ({
        path: `schema.runnables[${index}].${error.path}`,
        message: error.message
      }))
    );
  });
  return errors;
};