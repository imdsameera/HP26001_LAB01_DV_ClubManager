import crypto from "crypto";

/**
 * Generates a cryptographically secure random password.
 * Guaranteed to contain at least:
 * - 1 lowercase letter
 * - 1 uppercase letter
 * - 1 number
 * - 1 symbol (!@#$%^&*)
 * 
 * @param length The total length of the password (min 4, default 12)
 * @returns A secure, random string
 */
export function generateSecurePassword(length = 12): string {
  // Ensure we have enough space for at least one of each mandatory character type
  const actualLength = Math.max(length, 4);

  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers   = "0123456789";
  const symbols   = "!@#$%^&*";
  
  // 1. Select one character from each mandatory set
  const passwordChars = [
    lowercase[crypto.randomInt(0, lowercase.length)],
    uppercase[crypto.randomInt(0, uppercase.length)],
    numbers[crypto.randomInt(0, numbers.length)],
    symbols[crypto.randomInt(0, symbols.length)],
  ];

  // 2. Fill the remaining spots from the full character pool
  const allChars = lowercase + uppercase + numbers + symbols;
  for (let i = passwordChars.length; i < actualLength; i++) {
    passwordChars.push(allChars[crypto.randomInt(0, allChars.length)]);
  }

  // 3. Shuffle using Fisher-Yates algorithm for extra security/unpredictability
  for (let i = passwordChars.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [passwordChars[i], passwordChars[j]] = [passwordChars[j], passwordChars[i]];
  }

  return passwordChars.join("");
}
