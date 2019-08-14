"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var codec_1 = require("@polkadot/types/codec");
var types_1 = require("@polkadot/types");
var index_1 = require("./index");
var MemberId = /** @class */ (function (_super) {
    tslib_1.__extends(MemberId, _super);
    function MemberId() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return MemberId;
}(types_1.u64));
exports.MemberId = MemberId;
var PaidTermId = /** @class */ (function (_super) {
    tslib_1.__extends(PaidTermId, _super);
    function PaidTermId() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return PaidTermId;
}(types_1.u64));
exports.PaidTermId = PaidTermId;
var SubscriptionId = /** @class */ (function (_super) {
    tslib_1.__extends(SubscriptionId, _super);
    function SubscriptionId() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return SubscriptionId;
}(types_1.u64));
exports.SubscriptionId = SubscriptionId;
var Paid = /** @class */ (function (_super) {
    tslib_1.__extends(Paid, _super);
    function Paid() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Paid;
}(PaidTermId));
exports.Paid = Paid;
var Screening = /** @class */ (function (_super) {
    tslib_1.__extends(Screening, _super);
    function Screening() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Screening;
}(types_1.AccountId));
exports.Screening = Screening;
var EntryMethod = /** @class */ (function (_super) {
    tslib_1.__extends(EntryMethod, _super);
    function EntryMethod(value, index) {
        return _super.call(this, {
            Paid: Paid,
            Screening: Screening
        }, value, index) || this;
    }
    return EntryMethod;
}(codec_1.EnumType));
exports.EntryMethod = EntryMethod;
var UserInfo = /** @class */ (function (_super) {
    tslib_1.__extends(UserInfo, _super);
    function UserInfo(value) {
        return _super.call(this, {
            handle: index_1.OptionText,
            avatar_uri: index_1.OptionText,
            about: index_1.OptionText
        }, value) || this;
    }
    return UserInfo;
}(codec_1.Struct));
exports.UserInfo = UserInfo;
var PaidMembershipTerms = /** @class */ (function (_super) {
    tslib_1.__extends(PaidMembershipTerms, _super);
    function PaidMembershipTerms(value) {
        return _super.call(this, {
            id: PaidTermId,
            fee: types_1.BalanceOf,
            text: types_1.Text
        }, value) || this;
    }
    Object.defineProperty(PaidMembershipTerms.prototype, "id", {
        get: function () {
            return this.get('id');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PaidMembershipTerms.prototype, "fee", {
        get: function () {
            return this.get('fee');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PaidMembershipTerms.prototype, "text", {
        get: function () {
            return this.get('text');
        },
        enumerable: true,
        configurable: true
    });
    return PaidMembershipTerms;
}(codec_1.Struct));
exports.PaidMembershipTerms = PaidMembershipTerms;
function registerMembershipTypes() {
    try {
        var typeRegistry = types_1.getTypeRegistry();
        // Register enum EntryMethod and its options:
        typeRegistry.register({
            Paid: Paid,
            Screening: Screening,
            EntryMethod: EntryMethod
        });
        typeRegistry.register({
            MemberId: MemberId,
            PaidTermId: PaidTermId,
            SubscriptionId: SubscriptionId,
            Profile: {
                id: 'MemberId',
                handle: 'Text',
                avatar_uri: 'Text',
                about: 'Text',
                registered_at_block: 'BlockNumber',
                registered_at_time: 'Moment',
                entry: 'EntryMethod',
                suspended: 'Bool',
                subscription: 'Option<SubscriptionId>'
            },
            UserInfo: UserInfo,
            CheckedUserInfo: {
                handle: 'Text',
                avatar_uri: 'Text',
                about: 'Text'
            },
            PaidMembershipTerms: {
                id: 'PaidTermId',
                fee: 'BalanceOf',
                text: 'Text'
            }
        });
    }
    catch (err) {
        console.error('Failed to register custom types of membership module', err);
    }
}
exports.registerMembershipTypes = registerMembershipTypes;
//# sourceMappingURL=members.js.map