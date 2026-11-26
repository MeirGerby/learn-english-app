import { pino, type Logger as PinoLogger } from 'pino';
import type { LogLevel, Project } from './index.js';

export type Logger = PinoLogger;

type CreateLoggerOptions = {
  level: LogLevel;
  project: Project;
  environment?: string;
};

// JSON lines on stdout. The host (Render, a container runtime) collects them.
export function createLogger({
  level,
  project,
  environment,
}: CreateLoggerOptions): Logger {
  return pino({
    level,
    base: { 'service.name': project, 'service.environment': environment },
    timestamp: pino.stdTimeFunctions.isoTime,
  });
}
