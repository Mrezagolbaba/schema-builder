import React,{useState} from 'react';
import {
  ChakraProvider,
  Grid,
  GridItem,
  VStack,
  Heading,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Box,
  extendTheme,
  Text,
} from '@chakra-ui/react';
import { RunnableForm } from './components/RunnableForm';
import { InputForm } from './components/InputForm';
import { SchemaPreview } from './components/SchemaPreview';
import { TestDataLoader } from './components/TestDataLoader';
import { useSchemaStore } from './store/schemaStore';

// Custom theme with dark mode
const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  styles: {
    global: {
      body: {
        bg: 'gray.900',
        color: 'whiteAlpha.900',
      },
    },
  },
  components: {
    Modal: {
      baseStyle: {
        dialog: {
          bg: 'gray.800',
        },
      },
    },
  },
});

function App() {
  const { isOpen: isRunnableModalOpen, onOpen: onRunnableModalOpen, onClose: onRunnableModalClose } = useDisclosure();
  const { isOpen: isInputModalOpen, onOpen: onInputModalOpen, onClose: onInputModalClose } = useDisclosure();
  const addInput = useSchemaStore((state) => state.addInput);
  const schema = useSchemaStore((state) => state.schema);
  const [inputIndex, setInputIndex] = useState(0);

  return (
    <ChakraProvider theme={theme}>
      <Grid
        templateColumns="1fr 380px"
        gap={8}
        minH="100vh"
        p={6}
        bg="gray.900"
      >
        {/* Left side - Preview */}
        <GridItem
          bg="gray.800"
          borderRadius="xl"
          boxShadow="2xl"
          overflow="hidden"
          position="relative"
        >
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            py={3}
            px={6}
            bg="whiteAlpha.50"
            backdropFilter="blur(10px)"
            borderBottom="1px solid"
            borderColor="whiteAlpha.100"
          >
            <Text fontSize="sm" fontWeight="medium" color="whiteAlpha.700">
              PREVIEW
            </Text>
          </Box>
          <Box p={6} pt={16} h="full" overflowY="auto">
            <SchemaPreview />
          </Box>
        </GridItem>

        {/* Right side - Actions */}
        <GridItem>
          <VStack spacing={8} align="stretch" h="full">
            <Box>
              <Heading 
                size="lg" 
                bgGradient="linear(to-r, cyan.400, blue.500, purple.600)"
                bgClip="text"
                letterSpacing="tight"
              >
                Form Schema Builder
              </Heading>
              <Text color="whiteAlpha.600" mt={2}>
                Build your form schema with ease
              </Text>
            </Box>
            
            <Box
              p={6}
              borderRadius="xl"
              bg="gray.800"
              borderWidth="1px"
              borderColor="whiteAlpha.100"
              boxShadow="2xl"
            >
              <VStack spacing={4}>
                <Button
                  colorScheme="cyan"
                  size="lg"
                  w="full"
                  onClick={onRunnableModalOpen}
                  _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                  transition="all 0.2s"
                >
                  Add New Runnable
                </Button>

                {schema.runnables.length > 0 && (
                  <Button
                    colorScheme="purple"
                    size="lg"
                    w="full"
                    onClick={onInputModalOpen}
                    _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                    transition="all 0.2s"
                  >
                    Add New Input
                  </Button>
                )}

                <Box w="full">
                  <TestDataLoader />
                </Box>
              </VStack>
            </Box>
          </VStack>
        </GridItem>
      </Grid>

      {/* Modals */}
      <Modal isOpen={isRunnableModalOpen} onClose={onRunnableModalClose}>
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent bg="gray.800" borderColor="whiteAlpha.100" boxShadow="2xl">
          <ModalHeader>Add New Runnable</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <RunnableForm onClose={onRunnableModalClose} />
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal isOpen={isInputModalOpen} onClose={onInputModalClose}>
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent bg="gray.800" borderColor="whiteAlpha.100" boxShadow="2xl">
          <ModalHeader>Add New Input</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <InputForm
              runnableIndex={inputIndex}
              onSubmit={(input) => {
                addInput(inputIndex, input)
                setInputIndex(inputIndex + 1)
                onInputModalClose()
              }}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </ChakraProvider>
  );
}

export default App;