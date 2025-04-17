// Username validation constants
export const USERNAME_PATTERN =
  "[A-Za-z0-9]+(?:[\\-_]*[A-Za-z0-9]+)*[A-Za-z0-9]+";
export const USERNAME_REGEX = new RegExp(`^${USERNAME_PATTERN}$`);
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 16;
export const USERNAME_HINT = `${USERNAME_MIN_LENGTH}-${USERNAME_MAX_LENGTH} letters, numbers, underscores or hyphens`;

/**
 * Validates a username
 */
export function validateUsername(username: string): [boolean, string] {
  if (
    !USERNAME_REGEX.test(username) ||
    username.length < USERNAME_MIN_LENGTH ||
    username.length > USERNAME_MAX_LENGTH
  ) {
    return [false, `Invalid username: must be ${USERNAME_HINT}`];
  }
  return [true, ""];
}

// Password validation constants
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 64;
export const PASSWORD_HINT = `${PASSWORD_MIN_LENGTH}-${PASSWORD_MAX_LENGTH} characters`;

/**
 * Validates a password
 */
export function validatePassword(password: string): [boolean, string] {
  if (
    password.length < PASSWORD_MIN_LENGTH ||
    password.length > PASSWORD_MAX_LENGTH
  ) {
    return [false, `Invalid password: must be ${PASSWORD_HINT}`];
  }
  return [true, ""];
}
