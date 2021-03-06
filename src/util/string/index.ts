import { User } from 'discord.js';
import { ArgumentError } from 'util/errors';
import { WHITESPACE_REGEX } from './regex';

export function isTruthy(str: string | undefined): boolean {
  return !!str && !(str.toLowerCase() === 'false');
}

export function getMentionString(user: User | null): string {
  if (!user) return '';
  return `<@!${user.id}>`;
}

export function parseArgList(str: string): string[] {
  if (!str || !str.length) {
    throw new ArgumentError();
  }
  const list: string[] = [];
  let currentArg: string = '';
  let readingArg = false;
  let readingQuotedArg = false;
  for (let i = 0; i < str.length; i++) {
    const prevChar = i > 0 ? str[i - 1] : null;
    const char = str[i];
    const nextChar = i < str.length - 1 ? str[i + 1] : null;
    if (readingArg && readingQuotedArg) {
      if (char === '"') {
        if (nextChar && !WHITESPACE_REGEX.test(nextChar)) {
          throw new ArgumentError();
        }
        list.push(currentArg);
        currentArg = '';
        readingArg = false;
        readingQuotedArg = false;
      } else {
        currentArg += char;
      }
    } else if (readingArg && !readingQuotedArg) {
      if (char === '"') {
        throw new ArgumentError();
      } else if (WHITESPACE_REGEX.test(char)) {
        list.push(currentArg);
        currentArg = '';
        readingArg = false;
        readingQuotedArg = false;
      } else {
        currentArg += char;
      }
    } else if (!readingArg) {
      if (char === '"') {
        if (prevChar && !WHITESPACE_REGEX.test(prevChar)) {
          throw new ArgumentError();
        }
        readingArg = true;
        readingQuotedArg = true;
      } else if (!WHITESPACE_REGEX.test(char)) {
        if (prevChar && !WHITESPACE_REGEX.test(prevChar)) {
          throw new ArgumentError();
        }
        currentArg += char;
        readingArg = true;
        readingQuotedArg = false;
      }
    }
  }
  if (readingQuotedArg) {
    throw new ArgumentError();
  }
  if (readingArg) {
    list.push(currentArg);
    currentArg = '';
    readingArg = false;
    readingQuotedArg = false;
  }
  return list;
}
