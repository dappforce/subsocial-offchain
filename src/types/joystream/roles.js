"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var codec_1 = require("@polkadot/types/codec");
var types_1 = require("@polkadot/types");
var members_1 = require("./members");
var Role = /** @class */ (function (_super) {
    tslib_1.__extends(Role, _super);
    function Role(value) {
        return _super.call(this, [
            'Storage'
        ], value) || this;
    }
    return Role;
}(codec_1.Enum));
exports.Role = Role;
var Actor = /** @class */ (function (_super) {
    tslib_1.__extends(Actor, _super);
    function Actor(value) {
        return _super.call(this, {
            member_id: members_1.MemberId,
            role: Role,
            account: types_1.AccountId,
            joined_at: types_1.BlockNumber
        }, value) || this;
    }
    Object.defineProperty(Actor.prototype, "member_id", {
        get: function () {
            return this.get('member_id');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Actor.prototype, "role", {
        get: function () {
            return this.get('role');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Actor.prototype, "account", {
        get: function () {
            return this.get('account');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Actor.prototype, "joined_at", {
        get: function () {
            return this.get('joined_at');
        },
        enumerable: true,
        configurable: true
    });
    return Actor;
}(codec_1.Struct));
exports.Actor = Actor;
var RoleParameters = /** @class */ (function (_super) {
    tslib_1.__extends(RoleParameters, _super);
    function RoleParameters(value) {
        return _super.call(this, {
            min_stake: types_1.Balance,
            min_actors: types_1.u32,
            max_actors: types_1.u32,
            reward: types_1.Balance,
            reward_period: types_1.BlockNumber,
            bonding_period: types_1.BlockNumber,
            unbonding_period: types_1.BlockNumber,
            min_service_period: types_1.BlockNumber,
            startup_grace_period: types_1.BlockNumber,
            entry_request_fee: types_1.Balance
        }, value) || this;
    }
    Object.defineProperty(RoleParameters.prototype, "min_stake", {
        get: function () {
            return this.get('min_stake');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RoleParameters.prototype, "max_actors", {
        get: function () {
            return this.get('max_actors');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RoleParameters.prototype, "min_actors", {
        get: function () {
            return this.get('min_actors');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RoleParameters.prototype, "reward", {
        get: function () {
            return this.get('reward');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RoleParameters.prototype, "reward_period", {
        get: function () {
            return this.get('reward_period');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RoleParameters.prototype, "unbonding_period", {
        get: function () {
            return this.get('unbonding_period');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RoleParameters.prototype, "bonding_period", {
        get: function () {
            return this.get('bonding_period');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RoleParameters.prototype, "min_service_period", {
        get: function () {
            return this.get('min_service_period');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RoleParameters.prototype, "startup_grace_period", {
        get: function () {
            return this.get('startup_grace_period');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RoleParameters.prototype, "entry_request_fee", {
        get: function () {
            return this.get('entry_request_fee');
        },
        enumerable: true,
        configurable: true
    });
    return RoleParameters;
}(codec_1.Struct));
exports.RoleParameters = RoleParameters;
function registerRolesTypes() {
    try {
        var typeRegistry = types_1.getTypeRegistry();
        typeRegistry.register({
            Role: Role,
            RoleParameters: RoleParameters,
            Request: '(AccountId, MemberId, Role, BlockNumber)',
            Requests: 'Vec<Request>',
            Actor: Actor
        });
    }
    catch (err) {
        console.error('Failed to register custom types of roles module', err);
    }
}
exports.registerRolesTypes = registerRolesTypes;
//# sourceMappingURL=roles.js.map