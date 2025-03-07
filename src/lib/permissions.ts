import { User } from "@supabase/supabase-js";

/**
 * Check if the user has admin privileges
 * @param user The current user
 * @returns boolean indicating if the user has admin privileges
 */
export function isAdmin(user: User | null): boolean {
  return user?.email === "kirankumarsn.n@gmail.com";
}

/**
 * Check if the user has write permissions
 * @param user The current user
 * @returns boolean indicating if the user has write permissions
 */
export function hasWritePermission(user: User | null): boolean {
  return isAdmin(user);
}
