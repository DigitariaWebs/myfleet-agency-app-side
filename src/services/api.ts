// Base API configuration for My Fleet car rental app

export const BASE_URL = 'https://api.myfleet.app/v1';

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

/**
 * Simulates network latency for mock API calls.
 * @param ms - delay in milliseconds (default: 300–800ms random)
 */
export function delay(ms?: number): Promise<void> {
  const duration = ms ?? Math.floor(Math.random() * 500) + 300;
  return new Promise((resolve) => setTimeout(resolve, duration));
}
