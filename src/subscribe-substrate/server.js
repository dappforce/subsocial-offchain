"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
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
// Import the API and selected RxJs operators
var switchMap = require("rxjs/operators").switchMap;
var ApiRx = require("@polkadot/api").ApiRx;
var dataService = require("./lib/dataService");
var utils = require("./lib/utils");
var registerBlogsTypes = require("./types/dappforce").registerBlogsTypes;
var registerJoystreamTypes = require("./types/joystream-js/index").registerJoystreamTypes;
require("dotenv").config();
// code from https://polkadot.js.org/api/examples/rx/08_system_events/
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var eventsFilter;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    eventsFilter = utils.getEventSections();
                    // initialize the data service
                    // internally connects to all storage sinks
                    return [4 /*yield*/, dataService.init()];
                case 1:
                    // initialize the data service
                    // internally connects to all storage sinks
                    _a.sent();
                    registerBlogsTypes();
                    registerJoystreamTypes();
                    // Create API with connection to the local Substrate node.
                    // If your Substrate node is running elsewhere, add the config (server + port) in `.env`.
                    // Use the config in the create function below.
                    // If the Substrate runtime your are connecting to uses custom types,
                    // please make sure that your have initialized the API object with them.
                    // https://polkadot.js.org/api/api/#registering-custom-types
                    ApiRx.create()
                        .pipe(switchMap(function (api) {
                            return api.query.system.events();
                        }))
                        // subscribe to system events via storage
                        .subscribe(function (events) { return __awaiter(_this, void 0, void 0, function () {
                            var _this = this;
                            return __generator(this, function (_a) {
                                events.forEach(function (record) { return __awaiter(_this, void 0, void 0, function () {
                                    var event, phase, eventObj;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                event = record.event, phase = record.phase;
                                                if (!(eventsFilter.includes(event.section.toString()) || eventsFilter.includes("all"))) return [3 /*break*/, 2];
                                                eventObj = {
                                                    section: event.section,
                                                    method: event.method,
                                                    meta: event.meta.documentation.toString(),
                                                    data: event.data.toString()
                                                };
                                                // remove this log if not needed
                                                console.log("Event Received: " + Date.now() + ": " + JSON.stringify(eventObj));
                                                // insert in data sink
                                                // can have some error handling here
                                                // should not fail or catch exceptions gracefully
                                                return [4 /*yield*/, dataService.insertFromMongo(eventObj)];
                                            case 1:
                                            // insert in data sink
                                            // can have some error handling here
                                            // should not fail or catch exceptions gracefully
                                                _a.sent();
                                                _a.label = 2;
                                            case 2: return [2 /*return*/];
                                        }
                                    });
                                }); });
                                return [2 /*return*/];
                            });
                        }); });
                    return [2 /*return*/];
            }
        });
    });
}
;
main().catch(function (error) {
    console.error(error);
    process.exit(-1);
});
//# sourceMappingURL=server.js.map