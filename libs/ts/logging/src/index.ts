export type { Logger } from './logger.js';

export const LogLevel = ['debug', 'info', 'warn', 'error'] as const;

export type LogLevel = (typeof LogLevel)[number];

export const Project = ['english-bff'] as const;

export type Project = (typeof Project)[number];
