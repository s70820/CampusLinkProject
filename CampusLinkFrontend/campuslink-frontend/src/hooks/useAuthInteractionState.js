import { useCallback, useState } from 'react';

const PASSWORD_FIELDS = new Set(['password', 'confirmPassword']);

export function useAuthInteractionState() {
  const [activeField, setActiveField] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [hasError, setHasError] = useState(false);

  const isPasswordFocused = PASSWORD_FIELDS.has(activeField);

  const handleFieldFocus = useCallback((fieldName) => {
    setActiveField(fieldName);
  }, []);

  const handleFieldBlur = useCallback((event, fieldName) => {
    const nextName = event.relatedTarget?.name;
    if (PASSWORD_FIELDS.has(fieldName) && PASSWORD_FIELDS.has(nextName)) {
      return;
    }
    setActiveField((current) => (current === fieldName ? null : current));
    if (fieldName !== 'email' && fieldName !== 'fullName' && fieldName !== 'matricNumber') {
      setIsTyping(false);
    }
  }, []);

  const handleFieldChange = useCallback((fieldName) => {
    if (['email', 'fullName', 'matricNumber'].includes(fieldName)) {
      setIsTyping(true);
    }
  }, []);

  const triggerError = useCallback(() => {
    setHasError(true);
    window.setTimeout(() => setHasError(false), 600);
  }, []);

  const toggleShowPassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const toggleShowConfirmPassword = useCallback(() => {
    setShowConfirmPassword((prev) => !prev);
  }, []);

  return {
    activeField,
    isTyping,
    isPasswordFocused,
    showPassword,
    showConfirmPassword,
    hasError,
    isEmailFocused: activeField === 'email',
    handleFieldFocus,
    handleFieldBlur,
    handleFieldChange,
    triggerError,
    toggleShowPassword,
    toggleShowConfirmPassword,
    setHasError,
  };
}

export default useAuthInteractionState;
