export interface ResponseAPI<T> {
  statusCode: number;
  data: T;
  message?: string;
  error?: string;
  activationRequired?: boolean;
}
