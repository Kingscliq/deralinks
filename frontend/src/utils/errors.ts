import { AuthErrorResponse } from '@/types/auth';
import { AxiosError } from 'axios';

export const getErrorMessage = (
  error: unknown,
  defaultMessage = 'Something went wrong!'
): string => {
  if (!isAxiosError<AuthErrorResponse>(error)) {
    return defaultMessage;
  }

  const data = error.response?.data;
  if (!data) {
    return defaultMessage;
  }

  if (typeof data.message === 'string' && data.message.trim() !== '') {
    return data.message;
  }

  return defaultMessage;
};

const isAxiosError = <T>(error: unknown): error is AxiosError<T> => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error &&
    (error as { [key: string]: unknown }).isAxiosError === true
  );
};
