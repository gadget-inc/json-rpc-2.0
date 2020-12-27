"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mocha_1 = require("mocha");
var chai_1 = require("chai");
var _1 = require(".");
var models_1 = require("./models");
mocha_1.describe("JSONRPCClient", function () {
    var client;
    var id;
    var lastRequest;
    var lastClientContext;
    var resolveClientRequest;
    var rejectClientRequest;
    mocha_1.beforeEach(function () {
        id = 0;
        lastRequest = undefined;
        resolveClientRequest = undefined;
        rejectClientRequest = undefined;
        client = new _1.JSONRPCClient(function (request, ClientContext) {
            lastRequest = request;
            lastClientContext = ClientContext;
            return new Promise(function (givenResolve, givenReject) {
                resolveClientRequest = givenResolve;
                rejectClientRequest = givenReject;
            });
        }, function () { return ++id; });
    });
    mocha_1.describe("requesting", function () {
        var requestResult;
        var requestError;
        var requestPromise;
        mocha_1.beforeEach(function () {
            requestResult = undefined;
            requestError = undefined;
            requestPromise = client.request("foo", ["bar"]).then(function (givenResult) { return (requestResult = givenResult); }, function (givenError) { return (requestError = givenError); });
        });
        mocha_1.it("should send the request", function () {
            chai_1.expect(lastRequest).to.deep.equal({
                jsonrpc: _1.JSONRPCProtocol,
                id: id,
                method: "foo",
                params: ["bar"],
            });
        });
        mocha_1.describe("succeeded on client side", function () {
            mocha_1.describe("and succeeded on server side too", function () {
                mocha_1.beforeEach(function () {
                    resolveClientRequest({
                        jsonrpc: _1.JSONRPCProtocol,
                        id: id,
                        result: "foo",
                    });
                    return requestPromise;
                });
                mocha_1.it("should resolve the result", function () {
                    chai_1.expect(requestResult).to.equal("foo");
                });
            });
            mocha_1.describe("and succeeded on server side with falsy but defined result", function () {
                mocha_1.beforeEach(function () {
                    resolveClientRequest({
                        jsonrpc: _1.JSONRPCProtocol,
                        id: id,
                        result: 0,
                    });
                    return requestPromise;
                });
                mocha_1.it("should resolve the result", function () {
                    chai_1.expect(requestResult).to.equal(0);
                });
            });
            mocha_1.describe("but failed on server side", function () {
                mocha_1.beforeEach(function () {
                    resolveClientRequest({
                        jsonrpc: _1.JSONRPCProtocol,
                        id: id,
                        error: {
                            code: 0,
                            message: "This is a test. Do not panic.",
                            data: {
                                test: true,
                            },
                        },
                    });
                    return requestPromise;
                });
                mocha_1.it("should reject with the error message", function () {
                    chai_1.expect(requestError.message).to.equal("This is a test. Do not panic.");
                    chai_1.expect(requestError.code).to.equal(0);
                    chai_1.expect(requestError.data.test).to.equal(true);
                    chai_1.expect(requestError.isJSONRPCRemoteError).to.equal(true);
                    chai_1.expect(models_1.isJSONRPCRemoteError(requestError)).to.equal(true);
                });
            });
            mocha_1.describe("but server responded invalid response", function () {
                mocha_1.describe("like having both result and error", function () {
                    mocha_1.beforeEach(function () {
                        resolveClientRequest({
                            jsonrpc: _1.JSONRPCProtocol,
                            id: id,
                            result: "foo",
                            error: {
                                code: 0,
                                message: "bar",
                            },
                        });
                        return requestPromise;
                    });
                    mocha_1.it("should reject", function () {
                        chai_1.expect(requestError).to.not.be.undefined;
                    });
                });
                mocha_1.describe("like not having both result and error", function () {
                    mocha_1.beforeEach(function () {
                        resolveClientRequest({
                            jsonrpc: _1.JSONRPCProtocol,
                            id: id,
                        });
                        return requestPromise;
                    });
                    mocha_1.it("should reject", function () {
                        chai_1.expect(requestError).to.not.be.undefined;
                    });
                });
            });
        });
        mocha_1.describe("failed on client side", function () {
            mocha_1.beforeEach(function () {
                rejectClientRequest(new Error("This is a test. Do not panic."));
                return requestPromise;
            });
            mocha_1.it("should reject the promise", function () {
                chai_1.expect(requestResult).to.be.undefined;
                chai_1.expect(requestError.message).to.equal("This is a test. Do not panic.");
            });
        });
        mocha_1.describe("failed on client side with no error object", function () {
            mocha_1.beforeEach(function () {
                rejectClientRequest(undefined);
                return requestPromise;
            });
            mocha_1.it("should reject the promise", function () {
                chai_1.expect(requestResult).to.be.undefined;
                chai_1.expect(requestError).to.be.undefined;
            });
        });
        mocha_1.describe("failed on client side with an error object without message", function () {
            mocha_1.beforeEach(function () {
                rejectClientRequest(new Error());
                return requestPromise;
            });
            mocha_1.it("should reject the promise", function () {
                chai_1.expect(requestResult).to.be.undefined;
                chai_1.expect(requestError).not.to.be.undefined;
            });
        });
    });
    mocha_1.describe("requesting with client params", function () {
        var expected;
        mocha_1.beforeEach(function () {
            expected = { token: "baz" };
            client.request("foo", undefined, expected);
        });
        mocha_1.it("should pass the client params to send function", function () {
            chai_1.expect(lastClientContext).to.deep.equal(expected);
        });
    });
    mocha_1.describe("notifying", function () {
        mocha_1.beforeEach(function () {
            client.notify("foo", ["bar"]);
        });
        mocha_1.it("should send the notification", function () {
            chai_1.expect(lastRequest).to.deep.equal({
                jsonrpc: _1.JSONRPCProtocol,
                method: "foo",
                params: ["bar"],
            });
        });
    });
    mocha_1.describe("notifying with client params", function () {
        var expected;
        mocha_1.beforeEach(function () {
            expected = { token: "baz" };
            client.notify("foo", undefined, expected);
        });
        mocha_1.it("should pass the client params to send function", function () {
            chai_1.expect(lastClientContext).to.deep.equal(expected);
        });
    });
});
