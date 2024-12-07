import React, { useCallback, useEffect, useState } from 'react';
import { Box, Code, Heading, Button, useClipboard, VStack, HStack, Text, IconButton, ButtonGroup, useToast } from '@chakra-ui/react';
import { useSchemaStore } from '../store/schemaStore';
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DroppableProps, DraggableProvided, DroppableStateSnapshot } from 'react-beautiful-dnd';
import { RiDraggable, RiDeleteBin7Line, RiEditLine } from "react-icons/ri";
import { BiUndo, BiRedo } from "react-icons/bi";
import { EditInputModal } from './EditInputModal';
import SchemaEditModal from './SchemaEditModal';
import { Input, Runnable } from '../types/schema';
import { validateSchema } from '../utils/schemaValidation';
interface StrictModeDroppableProps extends Omit<DroppableProps, 'children'> {
  children: (provided: DroppableProvided, snapshot: DroppableStateSnapshot) => React.ReactElement;
}
export const StrictModeDroppable: React.FC<StrictModeDroppableProps> = ({ children, ...props }) => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);

  if (!enabled) {
    return null;
  }

  return <Droppable {...props}>{children}</Droppable>;
}

export const SchemaPreview: React.FC = () => {
  const schema = useSchemaStore(state => state.schema);
  const removeRunnable = useSchemaStore(state => state.removeRunnable);
  const reorderRunnable = useSchemaStore(state => state.reorderRunnable);
  const setSchema = useSchemaStore(state => state.setSchema);
  const undo = useSchemaStore(state => state.undo);
  const redo = useSchemaStore(state => state.redo);
  const history = useSchemaStore(state => state.history);
  const updateRunnable = useSchemaStore(state => state.updateRunnable);
  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false);
  const [editingSchema, setEditingSchema] = useState<Runnable | null>(null);

  const { hasCopied, onCopy } = useClipboard(JSON.stringify(schema, null, 2));

  const [selectedInput, setSelectedInput] = useState(
    {} as Input
  );
  const [selectedIndices, setSelectedIndices] = useState<{ runnableIndex: number, inputIndex: number } | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const toast = useToast();
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) { // metaKey for Mac
        if (e.key === 'z') {
          e.preventDefault();
          if (e.shiftKey) {
            redo();
          } else {
            undo();
          }
        } else if (e.key === 'y') {
          e.preventDefault();
          redo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  const onDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;
    reorderRunnable(result.source.index, result.destination.index);
  }, [reorderRunnable]);

  const handleExport = () => {
    const dataStr = JSON.stringify(schema, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'schema.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const schema = JSON.parse(e.target?.result as string);
          const errors = validateSchema(schema);
          if (errors.length === 0) {
            setSchema(schema);
          } else {
            // Show validation errors
          }
        } catch (error) {
          console.error(error);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleInputUpdate = (runnableIndex: number, inputIndex: number, updatedInput: Input) => {
    const updatedRunnable = { ...schema.runnables[runnableIndex] };
    if (updatedRunnable.inputs) {
      updatedRunnable.inputs[inputIndex] = updatedInput;
      // Resequence orders if necessary
      updatedRunnable.inputs.sort((a, b) => (a.order || 0) - (b.order || 0));
      updatedRunnable.inputs.forEach((input, idx) => {
        input.order = idx + 1;
      });
      updateRunnable(runnableIndex, updatedRunnable);
    }
  };
  const handleRemoveRunnable = (runnableIndex: number) => {
    if (schema.runnables.length === 1) {
      toast({
        title: 'Validation Error',
        description: 'At least one runnable is required',
        status: 'error',
        duration: 5000,
        isClosable: true,
        variant: 'solid',
        position: 'bottom',
      });
      return;
    }
    removeRunnable(runnableIndex);
  }
  return (
    <Box p={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <HStack>
          <Heading size="md" data-testid="schema-preview-title">Schema Preview</Heading>
          <ButtonGroup size="sm" isAttached variant="outline">
            <IconButton
              data-testid="undo-button"
              icon={<BiUndo />}
              aria-label="Undo"
              onClick={undo}
              isDisabled={history.past?.length === 0}
              title="Undo (Ctrl+Z)"
              color='bg-blue-500'
            />
            <IconButton
              icon={<BiRedo />}
              data-testid="redo-button"
              aria-label="Redo"
              onClick={redo}
              isDisabled={history.future?.length === 0}
              title="Redo (Ctrl+Y or Ctrl+Shift+Z)"
              color='bg-blue-500'
            />
          </ButtonGroup>
        </HStack>
        <HStack spacing={2}>
          <Button
            size="sm"
            onClick={handleExport}
            colorScheme="blue"
            variant="outline"
            data-testid="export-button"
          >
            Export
          </Button>
          <Button
            size="sm"
            as="label"
            htmlFor="import-schema"
            cursor="pointer"
            colorScheme="blue"
            variant="outline"
            data-testid="import-button"
          >
            Import
            <input
              data-testid="file-input"
              id="import-schema"
              type="file"
              accept=".json"
              onChange={handleImport}
              style={{ display: 'none' }}
            />
          </Button>
          <Button size="sm" onClick={onCopy} data-testid="copy-json-button">
            {hasCopied ? 'Copied!' : 'Copy JSON'}
          </Button>
        </HStack>
      </Box>

      <DragDropContext onDragEnd={onDragEnd}>
        <StrictModeDroppable droppableId="runnables">
          {(provided: DroppableProvided) => (
            <VStack
              spacing={2}
              {...provided.droppableProps}
              ref={provided.innerRef}
              align="stretch"
            >
              {schema.runnables.map((runnable, runnableIndex) => (
                <Draggable
                  key={`${runnable.path}-${runnableIndex}`}
                  draggableId={`runnable-${runnableIndex}`}
                  index={runnableIndex}
                >
                  {(provided: DraggableProvided) => (
                    <Box
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      bg="gray.50"
                      p={3}
                      borderRadius="md"
                    >
                      <HStack spacing={3}>
                        <Box
                          {...provided.dragHandleProps}
                          display="flex"
                          alignItems="center"
                          _hover={{ cursor: 'grab' }}
                          _active={{ cursor: 'grabbing' }}
                        >
                          <RiDraggable size={20} color="#666" />
                        </Box>
                        <Text flex={1}>
                          {runnable.type} - {runnable.path}
                        </Text>
                        <IconButton
                          size="sm"
                          data-testid="delete-runnable-button"
                          icon={<RiDeleteBin7Line />}
                          aria-label="Delete runnable"
                          color="red.500"
                          onClick={() => handleRemoveRunnable(runnableIndex)}
                        />
                        <IconButton
                          data-testid="edit-schema-button"
                          size="sm"
                          icon={<RiEditLine />}
                          aria-label="Edit schema"
                          color="blue.500"
                          onClick={() => {
                            setEditingSchema(runnable);
                            setIsSchemaModalOpen(true);
                          }}
                        />
                      </HStack>
                      <Code
                        display="block"
                        whiteSpace="pre"
                        p={2}
                        mt={2}
                        color={'blue.500'}
                        fontSize="sm"
                        bg="gray.100"
                        borderRadius="md"
                      >
                        {JSON.stringify(runnable, null, 2)}
                      </Code>
                    </Box>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </VStack>
          )}
        </StrictModeDroppable>
      </DragDropContext>

      <EditInputModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedInput({} as Input);
          setSelectedIndices(null);
        }}
        input={selectedInput}
        runnableIndex={selectedIndices?.runnableIndex ?? 0}
        inputIndex={selectedIndices?.inputIndex ?? 0}
        onUpdate={handleInputUpdate}
      />
      <SchemaEditModal
        runnable={editingSchema}
        isOpen={isSchemaModalOpen}
        runnableIndex={schema.runnables?.indexOf(editingSchema as Runnable)}
        onClose={() => setIsSchemaModalOpen(false)}
        onSave={() => {
          setIsSchemaModalOpen(false);
        }}
      />
    </Box>
  );
};