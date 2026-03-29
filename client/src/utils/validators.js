export const isValidEmail = (value) => /\S+@\S+\.\S+/.test(value);

export const isStrongPassword = (value) => typeof value === 'string' && value.length >= 6;

