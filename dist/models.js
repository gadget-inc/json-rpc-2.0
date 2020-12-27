"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.isJSONRPCRemoteError = exports.JSONRPCRemoteError = exports.createJSONRPCErrorResponse = exports.JSONRPCErrorCode = exports.isJSONRPCResponse = exports.isJSONRPCRequest = exports.JSONRPCProtocol = void 0;
exports.JSONRPCProtocol = "2.0";
var isJSONRPCRequest = function (payload) {
    return (payload.jsonrpc === exports.JSONRPCProtocol &&
        payload.method !== undefined &&
        payload.result === undefined &&
        payload.error === undefined);
};
exports.isJSONRPCRequest = isJSONRPCRequest;
var isJSONRPCResponse = function (payload) {
    return (payload.jsonrpc === exports.JSONRPCProtocol &&
        payload.id !== undefined &&
        (payload.result !== undefined || payload.error !== undefined));
};
exports.isJSONRPCResponse = isJSONRPCResponse;
var JSONRPCErrorCode;
(function (JSONRPCErrorCode) {
    JSONRPCErrorCode[JSONRPCErrorCode["ParseError"] = -32700] = "ParseError";
    JSONRPCErrorCode[JSONRPCErrorCode["InvalidRequest"] = -32600] = "InvalidRequest";
    JSONRPCErrorCode[JSONRPCErrorCode["MethodNotFound"] = -32601] = "MethodNotFound";
    JSONRPCErrorCode[JSONRPCErrorCode["InvalidParams"] = -32602] = "InvalidParams";
    JSONRPCErrorCode[JSONRPCErrorCode["InternalError"] = -32603] = "InternalError";
})(JSONRPCErrorCode = exports.JSONRPCErrorCode || (exports.JSONRPCErrorCode = {}));
var createJSONRPCErrorResponse = function (id, code, message, data) {
    var errorResponse = {
        jsonrpc: exports.JSONRPCProtocol,
        id: id,
        error: {
            code: code,
            message: message,
        },
    };
    if (data) {
        errorResponse.error.data = data;
    }
    return errorResponse;
};
exports.createJSONRPCErrorResponse = createJSONRPCErrorResponse;
var JSONRPCRemoteError = /** @class */ (function (_super) {
    __extends(JSONRPCRemoteError, _super);
    function JSONRPCRemoteError(message, code, response, data) {
        var _this = _super.call(this, message) || this;
        _this.code = code;
        _this.response = response;
        _this.data = data;
        _this.isJSONRPCRemoteError = true;
        return _this;
    }
    return JSONRPCRemoteError;
}(Error));
exports.JSONRPCRemoteError = JSONRPCRemoteError;
var isJSONRPCRemoteError = function (error) {
    return error && "isJSONRPCRemoteError" in error && error.isJSONRPCRemoteError;
};
exports.isJSONRPCRemoteError = isJSONRPCRemoteError;
