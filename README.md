# Form Schema Builder

A React application for visually constructing complex form schemas. Build dynamic form configurations with a user-friendly interface and generate structured JSON schemas.

## Features

- Create multiple form configurations (runnables)
- Add, edit, and remove form inputs
- Configure input properties through an intuitive UI
- Real-time JSON schema preview
- Schema validation
- Support for various input types:
  - Dropdown
  - Slider
  - Textarea
  - Toggle
  - Action
  - Output
  - Initial Input

## Tech Stack

- React 18 with TypeScript
- Chakra UI for components
- Zustand for state management
- React Hook Form for form handling
- Vite for build tooling
- Vitest for testing

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm 7.x or higher

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd form-schema-builder
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Testing

The project uses Vitest for testing and includes comprehensive test coverage.

### Running Tests

- Run tests in watch mode:
```bash
npm test
```

- Run tests with coverage:
```bash
npm run test:coverage
```

- Run tests with UI:
```bash
npm run test:ui
```

### Test Coverage Requirements

The project maintains high test coverage standards:
- Branches: 80%
- Functions: 80%
- Lines: 80%
- Statements: 80%

## Project Structure

```
src/
├── components/          # React components
├── store/              # Zustand store
├── types/              # TypeScript types
├── utils/              # Utility functions
├── test/              # Test files
│   ├── components/    # Component tests
│   ├── store/        # Store tests
│   └── utils/        # Utility tests
└── mocks/             # Test mock data
```

## Schema Structure

### Top-level Schema
```typescript
interface Schema {
  runnables: Runnable[];
}
```

### Runnable Configuration
```typescript
interface Runnable {
  type: "initial" | "secondary";
  path: string;
  inputs: Input[];
  output?: OutputConfig;
}
```

### Input Configuration
```typescript
interface Input {
  name: string;
  label: string;
  type: InputType;
  order?: number;
  required: boolean;
  description?: string;
  defaultValue?: string|number;
  options?: Option[];
  min?: number;
  max?: number;
  step?: number;
  mark?: string;
  actionType?: string;
  outputKey?: string;
  initialInputKey?: string;
}
```

## Development Guidelines

1. **Code Style**
   - Use TypeScript for type safety
   - Follow ESLint rules
   - Use Prettier for code formatting

2. **Testing**
   - Write tests for new components
   - Maintain test coverage requirements
   - Use meaningful test descriptions

3. **State Management**
   - Use Zustand for global state
   - Keep state updates immutable
   - Validate schema changes

4. **Components**
   - Keep components focused and reusable
   - Use Chakra UI components
   - Implement proper prop validation

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm test` - Run tests
- `npm run test:coverage` - Run tests with coverage
- `npm run test:ui` - Run tests with UI

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.