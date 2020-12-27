"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JSONRPCClient = void 0;
var models_1 = require("./models");
var JSONRPCClient = /** @class */ (function () {
    function JSONRPCClient(_send, createID) {
        this._send = _send;
        this.createID = createID;
        this.id = 0;
    }
    /**
     * Invoke a remote procedure using JSON-RPC and return the result. Throws a `JSONRPCRemoteError` if the transport between the client and server was successful but the server failed to execute. Doesn't wrap or rethrow any errors thrown by the request sender function passed to this `JSONRPCClient` object.
     *
     * @param method The name of the method to invoke
     * @param params The parameters (arguments) to send to the remote method
     * @param context An optional context object to pass into the send function passed to this JSONRPCClient object
     * @returns The result of invoking the remote method, the shape of which is defined by the server
     */
    JSONRPCClient.prototype.request = function (method, params, context) {
        return __awaiter(this, void 0, void 0, function () {
            var request, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        request = {
                            jsonrpc: models_1.JSONRPCProtocol,
                            method: method,
                            params: params,
                            id: this._createID(),
                        };
                        return [4 /*yield*/, this.send(request, context)];
                    case 1:
                        response = _a.sent();
                        if (!response) {
                            throw new Error("JSONRPCClient internal error: No response returned from send function passed to constructor.");
                        }
                        if (response.result !== undefined && !response.error) {
                            return [2 /*return*/, response.result];
                        }
                        else if (response.result === undefined && response.error) {
                            throw new models_1.JSONRPCRemoteError(response.error.message, response.error.code, response, response.error.data);
                        }
                        else {
                            // this should never happen: we shouldn't get back a defined result with an error, or an undefined result and undefined error.
                            throw new Error("JSONRPCClient internal error: An unexpected error occurred, result/error response didn't make sense");
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Fire and forget a remote procedure invocation using JSON-RPC. Doesn't return a result, and doesn't check to see if the remote execution was successful.
     *
     * @param method The name of the method to invoke
     * @param params The parameters (arguments) to send to the remote method
     * @param context An optional context object to pass into the send function passed to this JSONRPCClient object
     */
    JSONRPCClient.prototype.notify = function (method, params, context) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.send({
                            jsonrpc: models_1.JSONRPCProtocol,
                            method: method,
                            params: params,
                        }, context)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    JSONRPCClient.prototype.send = function (payload, context) {
        return this._send(payload, context);
    };
    JSONRPCClient.prototype._createID = function () {
        if (this.createID) {
            return this.createID();
        }
        else {
            return ++this.id;
        }
    };
    return JSONRPCClient;
}());
exports.JSONRPCClient = JSONRPCClient;
