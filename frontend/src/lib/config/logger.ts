/**
 * Log
 *
 * A simple static logger utility class for consistent logging throughout the application.
 * Provides static methods for info, warning, and error level logging.
 *
 * @example
 * Log.info('Server started');
 * Log.warn('Low disk space');
 * Log.error('Unhandled exception', error);
 */
export class Logger {
  /**
   * Logs informational messages to the console.
   * @param data - The main message or object to log.
   * @param optionalParams - Additional parameters to log.
   */
  static info(data: unknown, ...optionalParams: unknown[]) {
    console.info(data, ...optionalParams);
  }

  /**
   * Logs warning messages to the console.
   * @param data - The main warning message or object to log.
   * @param optionalParams - Additional parameters to log.
   */
  static warn(data: unknown, ...optionalParams: unknown[]) {
    console.warn(data, ...optionalParams);
  }

  /**
   * Logs error messages to the console.
   * @param data - The main error message or object to log.
   * @param optionalParams - Additional parameters to log.
   */
  static error(data: unknown, ...optionalParams: unknown[]) {
    console.error(data, ...optionalParams);
  }

  /**
   * Logs informational messages to the console.
   * @param data - The main message or object to log.
   * @param optionalParams - Additional parameters to log.
   */
  static log(data: unknown, ...optionalParams: unknown[]) {
    console.log(data, ...optionalParams);
  }
}
