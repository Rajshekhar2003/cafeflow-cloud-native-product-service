import { environment } from "../config/environment.js";

const LEVEL_PRIORITY = Object.freeze({
  debug: 10,
  info: 20,
  warn: 30,
  error: 40
});

function shouldLog(level) {
  const configuredPriority =
    LEVEL_PRIORITY[environment.logLevel] ?? LEVEL_PRIORITY.info;
  return LEVEL_PRIORITY[level] >= configuredPriority;
}

function write(level, message, metadata = {}) {
  if (!shouldLog(level)) {
    return;
  }

  const entry = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    message,
    ...metadata
  });

  if (level === "error") {
    console.error(entry);
  } else {
    console.log(entry);
  }
}

export const logger = Object.freeze({
  debug: (message, metadata) => write("debug", message, metadata),
  info: (message, metadata) => write("info", message, metadata),
  warn: (message, metadata) => write("warn", message, metadata),
  error: (message, metadata) => write("error", message, metadata)
});
