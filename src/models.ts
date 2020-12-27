export type JSONRPCProtocol = "2.0";
export const JSONRPCProtocol: JSONRPCProtocol = "2.0";

export type JSONRPCID = string | number | null;
export type JSONRPCParams = object | any[];

export interface JSONRPCRequest {
  jsonrpc: JSONRPCProtocol;
  method: string;
  params?: JSONRPCParams;
  id?: JSONRPCID;
}

export interface JSONRPCResponse {
  jsonrpc: JSONRPCProtocol;
  result?: any;
  error?: JSONRPCError;
  id: JSONRPCID;
}

export const isJSONRPCRequest = (payload: any): payload is JSONRPCRequest => {
  return (
    payload.jsonrpc === JSONRPCProtocol &&
    payload.method !== undefined &&
    payload.result === undefined &&
    payload.error === undefined
  );
};

export const isJSONRPCResponse = (payload: any): payload is JSONRPCResponse => {
  return (
    payload.jsonrpc === JSONRPCProtocol &&
    payload.id !== undefined &&
    (payload.result !== undefined || payload.error !== undefined)
  );
};

export interface JSONRPCError {
  code: number;
  message: string;
  data?: any;
}

export enum JSONRPCErrorCode {
  ParseError = -32700,
  InvalidRequest = -32600,
  MethodNotFound = -32601,
  InvalidParams = -32602,
  InternalError = -32603,
}

export const createJSONRPCErrorResponse = (
  id: JSONRPCID,
  code: number,
  message: string,
  data?: any
): JSONRPCResponse => {
  const errorResponse: JSONRPCResponse = {
    jsonrpc: JSONRPCProtocol,
    id,
    error: {
      code,
      message,
    },
  };

  if (data) {
    errorResponse.error!.data = data;
  }

  return errorResponse;
};

export class JSONRPCRemoteError extends Error {
  isJSONRPCRemoteError = true;

  constructor(
    message: string,
    readonly code: number,
    readonly response?: JSONRPCResponse,
    readonly data?: any
  ) {
    super(message);
  }
}

export const isJSONRPCRemoteError = (
  error: any
): error is JSONRPCRemoteError => {
  return error && "isJSONRPCRemoteError" in error && error.isJSONRPCRemoteError;
};
