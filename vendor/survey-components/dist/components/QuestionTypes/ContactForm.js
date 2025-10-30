import React, { useState } from 'react';
import styled from 'styled-components';
const ContactForm = ({ question, onAnswer, disabled }) => {
    const [formData, setFormData] = useState({});
    const handleSubmit = (e) => {
        e.preventDefault();
        onAnswer(formData);
    };
    return (React.createElement(Form, { onSubmit: handleSubmit },
        question.fields?.map((field) => (React.createElement(Field, { key: field.id },
            React.createElement(Label, { htmlFor: field.id }, field.label),
            field.type === 'textarea' ? (React.createElement(Textarea, { id: field.id, value: formData[field.id] || '', onChange: (e) => setFormData(prev => ({ ...prev, [field.id]: e.target.value })), placeholder: field.placeholder, required: field.required })) : (React.createElement(Input, { id: field.id, type: field.type, value: formData[field.id] || '', onChange: (e) => setFormData(prev => ({ ...prev, [field.id]: e.target.value })), placeholder: field.placeholder, required: field.required, inputMode: field.type === 'tel' ? 'tel' : undefined }))))),
        React.createElement(Buttons, null,
            React.createElement(SecondaryButton, { type: "button", onClick: () => onAnswer({ type: 'skipped' }), disabled: disabled }, "Not right now"),
            React.createElement(SubmitButton, { type: "submit", disabled: disabled }, "Submit"))));
};
const Form = styled.form `
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;
const Field = styled.div ``;
const Label = styled.label `
  display: block;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
`;
const Input = styled.input `
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm};
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
`;
const Textarea = styled.textarea `
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm};
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  min-height: 120px;
`;
const SubmitButton = styled.button `
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
`;
const SecondaryButton = styled.button `
  background-color: transparent;
  color: ${({ theme }) => theme.colors.text.primary};
  border: 2px solid ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
`;
const Buttons = styled.div `
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: center;
`;
export default ContactForm;
//# sourceMappingURL=ContactForm.js.map
