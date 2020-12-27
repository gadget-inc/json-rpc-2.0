export declare type JSONRPCProtocol = "2.0";
export declare const JSONRPCProtocol: JSONRPCProtocol;
export declare type JSONRPCID = string | number | null;
export declare type JSONRPCParams = object | any[];
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
export declare const isJSONRPCRequest: (payload: any) => payload is JSONRPCRequest;
export declare const isJSONRPCResponse: (payload: any) => payload is JSONRPCResponse;
export interface JSONRPCError {
    code: number;
    message: string;
    data?: any;
}
export declare enum JSONRPCErrorCode {
    ParseError = -32700,
    InvalidRequest = -32600,
    MethodNotFound = -32601,
    InvalidParams = -32602,
    InternalError = -32603
}
export declare const createJSONRPCErrorResponse: (id: JSONRPCID, code: number, message: string, data?: any) => JSONRPCResponse;
export declare class JSONRPCRemoteError extends Error {
    readonly code: number;
    readonly response?: JSONRPCResponse | undefined;
    readonly data?: any;
    isJSONRPCRemoteError: boolean;
    constructor(message: string, code: number, response?: JSONRPCResponse | undefined, data?: any);
}
export declare const isJSONRPCRemoteError: (error: any) => error is JSONRPCRemoteError;
