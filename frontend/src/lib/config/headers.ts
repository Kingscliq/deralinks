import { getAuthToken } from "@/lib/config/storage";


const base: {
  'Content-Type': string;
  Accept: string;
  Authorization?: string;
} = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
  Authorization: ""
};

export const getHeaders = () => {
  const token = getAuthToken();

  if (typeof token !== 'string' && token !== undefined) {
    base.Authorization = `Bearer ${token}`;
  }

  return {
    ...base,
  };
};
