import { Schema, Runnable, Input } from '../types/schema';

export const mockInputs: Record<string, Input> = {
  nameInput: {
    name: "userName",
    label: "Full Name",
    type: "textarea",
    required: true,
    description: "Enter your full name",
    order: 1,
    value: "John Doe"
  },
  ageSlider: {
    name: "userAge",
    label: "Age",
    type: "slider",
    required: true,
    min: 18,
    max: 100,
    step: 1,
    mark: "years",
    order: 2,
    value: 25
  },
  roleDropdown: {
    name: "userRole",
    label: "Role",
    type: "dropdown",
    required: true,
    options: [
      { label: "Admin", value: "admin" },
      { label: "User", value: "user" },
      { label: "Guest", value: "guest" }
    ],
    order: 3,
    value: "admin"
  },
  activeToggle: {
    name: "isActive",
    label: "Active Status",
    type: "toggle",
    required: false,
    description: "Toggle user active status",
    defaultValue: true,
    order: 4
  }
};

export const mockRunnables: Record<string, Runnable> = {
  userForm: {
    type: "initial",
    path: "/user/create",
    inputs: [
      { ...mockInputs.nameInput, order: 1 },
      { ...mockInputs.ageSlider, order: 2 },
      { ...mockInputs.roleDropdown, order: 3 },
      { ...mockInputs.activeToggle, order: 4 }
    ]
  },
  settingsForm: {
    type: "secondary",
    path: "/user/settings",
    inputs: [
      { ...mockInputs.activeToggle, order: 1 }
    ],
    output: {
      dataTitle: "User Settings",
      tip: "Configure user settings"
    }
  }
};

Object.values(mockInputs).forEach((input, index) => {
  input.order = index + 1;
 });
 
 // Update mockRunnables to ensure sequential orders
 Object.values(mockRunnables).forEach(runnable => {
  runnable.inputs.forEach((input, index) => {
    input.order = index + 1;
  });
 });

export const mockSchema: Schema = {
  runnables: [
    mockRunnables.userForm,
    mockRunnables.settingsForm
  ]
};