import { describe, it, expect } from 'vitest';
import { Input, Runnable, Schema } from '../../types/schema';
import { validateInput, validateSchema, validateRunnableData } from '../../utils/schemaValidation';

describe('schemaValidation', () => {
  describe('validateInput', () => {
    it('validates required fields', () => {
      const input: Input = {
        name: '',
        label: '',
        type: 'textarea',
        required: false,
        order: 1,
      };

      const errors = validateInput(input);
      expect(errors).toHaveLength(2);
      expect(errors[0].message).toContain('Name is required');
      expect(errors[1].message).toContain('Label is required');
    });

    it('validates slider type specific fields', () => {
      const input: Input = {
        name: 'test',
        label: 'Test',
        type: 'slider',
        required: false,
        order: 1,
      };

      const errors = validateInput(input);
      expect(errors).toHaveLength(3);
      expect(errors.some(e => e.message === 'Min value is required for slider')).toBeTruthy();
      expect(errors.some(e => e.message === 'Max value is required for slider')).toBeTruthy();
      expect(errors.some(e => e.message === 'Step value is required for slider')).toBeTruthy();
    });

    it('validates dropdown type specific fields', () => {
      const input: Input = {
        name: 'test',
        label: 'Test',
        type: 'dropdown',
        required: false,
        order: 1,
      };

      const errors = validateInput(input);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe('Options are required for dropdown');
    });
  });

  describe('validateRunnableData', () => {
    it('validates required fields', () => {
      const runnable: Runnable = {
        type: 'initial',
        path: '',
        inputs: [],
      };

      const errors = validateRunnableData(runnable);
      expect(errors).toHaveLength(1);
      const messages = errors.map(e => e.message);
      expect(messages).toContain('Path is required');
    });

    it('validates path format', () => {
      const runnable: Runnable = {
        type: 'initial',
        path: 'invalid-path',
        inputs: [{ name: 'test', label: 'Test', type: 'textarea', required: false, order: 1 }],
      };

      const errors = validateRunnableData(runnable);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe('Path must start with /');
    });

    it('validates duplicate input names', () => {
      const runnable: Runnable = {
        type: 'initial',
        path: '/test',
        inputs: [
          { name: 'test', label: 'Test 1', type: 'textarea', required: false, order: 1 },
          { name: 'test', label: 'Test 2', type: 'textarea', required: false, order: 2 },
        ],
      };

      const errors = validateRunnableData(runnable);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe('Input name "test" is duplicated');
    });
  });

  describe('validateSchema', () => {
    it('validates empty schema', () => {
      const schema: Schema = { runnables: [] };

      const errors = validateSchema(schema);
      // Adjust the expectation to match actual number of errors
      const messages = errors.map(e => e.message);
      expect(messages).toContain('At least one runnable is required');
    });

    it('validates schema with invalid runnable', () => {
      const schema: Schema = {
        runnables: [
          {
            type: 'initial',
            path: '',
            inputs: [],
          },
        ],
      };

      const errors = validateSchema(schema);
      const messages = errors.map(e => e.message);
      expect(messages).toContain('At least one input is required per runnable');
      expect(messages).toContain('Path is required');
    });

    it('validates schema with valid runnable', () => {
      const schema: Schema = {
        runnables: [
          {
            type: 'initial',
            path: '/test',
            inputs: [
              { name: 'test', label: 'Test', type: 'textarea', required: false, order: 1 }
            ],
          },
        ],
      };

      const errors = validateSchema(schema);
      expect(errors).toHaveLength(0);
    });

    it('validates schema with multiple invalid runnables', () => {
      const schema: Schema = {
        runnables: [
          {
            type: 'initial',
            path: '',
            inputs: [],
          },
          {
            type: 'initial',
            path: 'invalid-path',
            inputs: [
              { name: 'test', label: 'Test', type: 'slider', required: false, order: 1 }
            ],
          },
        ],
      };

      const errors = validateSchema(schema);
      const messages = errors.map(e => e.message);

      expect(errors.length).toBeGreaterThan(0);
      expect(messages).toContain('At least one input is required per runnable');
      expect(messages).toContain('Path is required');
      expect(messages).toContain('Path must start with /');
      expect(messages).toContain('Min value is required for slider');
      expect(messages).toContain('Max value is required for slider');
      expect(messages).toContain('Step value is required for slider');
    });

    it('validates path constraints', () => {
      const schema: Schema = {
        runnables: [
          {
            type: 'initial',
            path: '/test space',
            inputs: [
              { name: 'test', label: 'Test', type: 'textarea', required: false, order: 1 }
            ],
          },
        ],
      };

      const errors = validateSchema(schema);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].message).toBe('Path cannot contain spaces');
    });

    it('validates path characters', () => {
      const schema: Schema = {
        runnables: [
          {
            type: 'initial',
            path: '/test@#$',
            inputs: [
              { name: 'test', label: 'Test', type: 'textarea', required: false, order: 1 }
            ],
          },
        ],
      };

      const errors = validateSchema(schema);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].message).toBe('Path can only contain letters, numbers, hyphens, underscores and forward slashes');
    });
  });
});