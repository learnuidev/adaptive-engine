import { findCookie } from "./find-cookie.ts";
import { parseCookies } from "./parse-cookies.ts";

export const getCookie = (name: string): string | null =>
  findCookie(parseCookies(), name);
