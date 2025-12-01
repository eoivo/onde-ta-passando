// Função para validar senha forte
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("A senha deve ter no mínimo 8 caracteres");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("A senha deve conter pelo menos uma letra maiúscula");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("A senha deve conter pelo menos um número");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Função para obter mensagem de validação formatada
export const getPasswordValidationMessage = (password: string): string => {
  const validation = validatePassword(password);
  return validation.errors.join(". ");
};

