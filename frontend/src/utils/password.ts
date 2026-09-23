export interface PasswordCheck {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
}

export function checkPassword(password: string): PasswordCheck {
  return {
    length: password.length >= 6,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  };
}

export function isPasswordValid(password: string): boolean {
  const check = checkPassword(password);
  return check.length && check.uppercase && check.lowercase && check.number;
}

export function passwordErrorMessage(password: string): string | null {
  const check = checkPassword(password);
  if (!check.length) return 'La contraseña debe tener al menos 6 caracteres.';
  if (!check.uppercase) return 'La contraseña debe incluir una letra mayúscula.';
  if (!check.lowercase) return 'La contraseña debe incluir una letra minúscula.';
  if (!check.number) return 'La contraseña debe incluir un número.';
  return null;
}
