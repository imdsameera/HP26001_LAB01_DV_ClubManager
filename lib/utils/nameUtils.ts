/**
 * Centralized utility for processing member names.
 * Standardizes how we handle prefix initials (e.g., "T. John Doe") 
 * to ensure consistent greetings ("Hello John") and avatar initials ("JD").
 */

/**
 * Strips leading initials from a name to get the core name components.
 * Example: "T. John Doe" -> "John Doe"
 * Example: "M. S. Dhoni" -> "Dhoni"
 * Example: "V.S. Lakshan" -> "Lakshan"
 * Example: "John Doe" -> "John Doe"
 */
export function cleanName(name: string): string {
  if (!name) return "";
  
  // Split by space, dot, or comma and filter empty tokens
  const tokens = name.split(/[\s.,]+/).filter(Boolean);
  
  // Find the index where the "real" name starts 
  // (the first token longer than 1 character)
  let skipCount = 0;
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].length === 1) {
      skipCount++;
    } else {
      break;
    }
  }
  
  // If we skipped everything (unlikely) or found the start, return joined tokens
  const cleanedTokens = tokens.slice(skipCount);
  if (cleanedTokens.length === 0) return name.trim(); // Fallback if all initials
  
  return cleanedTokens.join(" ");
}

/**
 * Returns the first "real" name for greetings.
 * Example: "T. John Doe" -> "John"
 */
export function getGreetingName(name: string): string {
  const cleaned = cleanName(name);
  return cleaned.split(" ")[0] || "Member";
}

/**
 * Generates 1-2 character initials for avatars, ignoring prefix initials.
 * Example: "T. John Doe" -> "JD"
 * Example: "Lakshan" -> "LA"
 */
export function getInitials(name: string): string {
  const cleaned = cleanName(name);
  if (!cleaned) return "?";
  
  const tokens = cleaned.split(" ").filter(Boolean);
  
  if (tokens.length === 0) return "?";
  
  if (tokens.length === 1) {
    return tokens[0].substring(0, 2).toUpperCase();
  }
  
  const first = tokens[0][0];
  const last = tokens[tokens.length - 1][0];
  return (first + last).toUpperCase();
}
