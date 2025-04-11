// Username validation constants
export const USERNAME_PATTERN = "[A-Za-z0-9]+(?:[\\-_]*[A-Za-z0-9]+)*[A-Za-z0-9]+";
export const USERNAME_REGEX = new RegExp(`^${USERNAME_PATTERN}$`);
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 16;
export const USERNAME_HINT = `${USERNAME_MIN_LENGTH}-${USERNAME_MAX_LENGTH} letters, numbers, underscores or hyphens`;

// Password validation constants
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 64;

// Email validation constants
export const EMAIL_PATTERN = "^\\w+(?:[-+.']\\w+)*@\\w+(?:[-.]\\w+)*\\.\\w+(?:[-.]\\w+)*$"
export const EMAIL_REGEX = new RegExp(`^${EMAIL_PATTERN}$`);
