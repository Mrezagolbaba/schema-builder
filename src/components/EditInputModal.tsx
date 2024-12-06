import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Select,
} from '@chakra-ui/react';

interface EditInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  input: any;
  runnableIndex: number;
  inputIndex: number;
  onUpdate: (runnableIndex: number, inputIndex: number, updatedInput: any) => void;
}
export const EditInputModal: React.FC<EditInputModalProps> = ({
    isOpen,
    onClose,
    input,
    runnableIndex,
    inputIndex,
    onUpdate,
  }) => {
    const [formData, setFormData] = useState(input);
  
    useEffect(() => {
      setFormData(input);
    }, [input]);
  
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData((prev: any) => ({
        ...prev,
        [name]: value,
      }));
    };
  
    const handleSubmit = () => {
      onUpdate(runnableIndex, inputIndex, formData);
      onClose();
    };
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Edit Input</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl>
                  <FormLabel>Name</FormLabel>
                  <Input
                    name="name"
                    value={formData?.name || ''}
                    onChange={handleChange}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Type</FormLabel>
                  <Select
                    name="type"
                    value={formData?.type || ''}
                    onChange={handleChange}
                  >
                    <option value="string">String</option>
                    <option value="number">Number</option>
                    <option value="boolean">Boolean</option>
                    <option value="array">Array</option>
                    <option value="object">Object</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Order</FormLabel>
                  <Input
                    name="order"
                    type="number"
                    value={formData?.order || ''}
                    onChange={handleChange}
                  />
                </FormControl>
                <FormControl>
              <FormLabel>Description</FormLabel>
              <Input
                name="description"
                value={formData?.description || ''}
                onChange={handleChange}
              />
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="blue" onClick={handleSubmit}>
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};