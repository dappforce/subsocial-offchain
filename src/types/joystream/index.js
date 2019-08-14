"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var codec_1 = require("@polkadot/types/codec");
var types_1 = require("@polkadot/types");
var media_1 = require("./media");
var members_1 = require("./members");
var roles_1 = require("./roles");
var Amount = /** @class */ (function (_super) {
    tslib_1.__extends(Amount, _super);
    function Amount() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Amount;
}(types_1.Balance));
var OptionText = /** @class */ (function (_super) {
    tslib_1.__extends(OptionText, _super);
    function OptionText() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    OptionText.none = function () {
        return new codec_1.Option(types_1.Text, null);
    };
    OptionText.some = function (text) {
        return new codec_1.Option(types_1.Text, text);
    };
    return OptionText;
}(codec_1.Option.with(types_1.Text)));
exports.OptionText = OptionText;
var Announcing = /** @class */ (function (_super) {
    tslib_1.__extends(Announcing, _super);
    function Announcing() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Announcing;
}(types_1.BlockNumber));
exports.Announcing = Announcing;
var Voting = /** @class */ (function (_super) {
    tslib_1.__extends(Voting, _super);
    function Voting() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Voting;
}(types_1.BlockNumber));
exports.Voting = Voting;
var Revealing = /** @class */ (function (_super) {
    tslib_1.__extends(Revealing, _super);
    function Revealing() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Revealing;
}(types_1.BlockNumber));
exports.Revealing = Revealing;
var ElectionStage = /** @class */ (function (_super) {
    tslib_1.__extends(ElectionStage, _super);
    function ElectionStage(value, index) {
        return _super.call(this, {
            Announcing: Announcing,
            Voting: Voting,
            Revealing: Revealing
        }, value, index) || this;
    }
    /** Create a new Announcing stage. */
    ElectionStage.Announcing = function (endsAt) {
        return this.newElectionStage(Announcing.name, endsAt);
    };
    /** Create a new Voting stage. */
    ElectionStage.Voting = function (endsAt) {
        return this.newElectionStage(Voting.name, endsAt);
    };
    /** Create a new Revealing stage. */
    ElectionStage.Revealing = function (endsAt) {
        return this.newElectionStage(Revealing.name, endsAt);
    };
    ElectionStage.newElectionStage = function (stageName, endsAt) {
        var _a;
        return new ElectionStage((_a = {}, _a[stageName] = endsAt, _a));
    };
    return ElectionStage;
}(codec_1.EnumType));
exports.ElectionStage = ElectionStage;
exports.ProposalStatuses = {
    Active: 'Active',
    Cancelled: 'Cancelled',
    Expired: 'Expired',
    Approved: 'Approved',
    Rejected: 'Rejected',
    Slashed: 'Slashed'
};
var ProposalStatus = /** @class */ (function (_super) {
    tslib_1.__extends(ProposalStatus, _super);
    function ProposalStatus(value) {
        return _super.call(this, [
            'Active',
            'Cancelled',
            'Expired',
            'Approved',
            'Rejected',
            'Slashed'
        ], value) || this;
    }
    return ProposalStatus;
}(codec_1.Enum));
exports.ProposalStatus = ProposalStatus;
exports.VoteKinds = {
    Abstain: 'Abstain',
    Approve: 'Approve',
    Reject: 'Reject',
    Slash: 'Slash'
};
var VoteKind = /** @class */ (function (_super) {
    tslib_1.__extends(VoteKind, _super);
    function VoteKind(value) {
        return _super.call(this, [
            'Abstain',
            'Approve',
            'Reject',
            'Slash'
        ], value) || this;
    }
    return VoteKind;
}(codec_1.Enum));
exports.VoteKind = VoteKind;
// TODO Refactor: split this function and move to corresponding modules: election and proposals.
function registerElectionAndProposalTypes() {
    try {
        var typeRegistry = types_1.getTypeRegistry();
        // Register parametrized enum ElectionStage:
        typeRegistry.register({
            Announcing: Announcing,
            Voting: Voting,
            Revealing: Revealing,
            ElectionStage: ElectionStage
        });
        typeRegistry.register({
            Amount: Amount
        });
        typeRegistry.register({
            ProposalStatus: ProposalStatus,
            VoteKind: VoteKind
        });
        typeRegistry.register({
            'Stake': {
                'new': 'Balance',
                'transferred': 'Balance'
            },
            'Backer': {
                member: 'AccountId',
                stake: 'Balance'
            },
            'Seat': {
                member: 'AccountId',
                stake: 'Balance',
                backers: 'Vec<Backer>'
            },
            'Seats': 'Vec<Seat>',
            'SealedVote': {
                'voter': 'AccountId',
                'commitment': 'Hash',
                'stake': 'Stake',
                'vote': 'Option<AccountId>'
            },
            'TransferableStake': {
                'seat': 'Balance',
                'backing': 'Balance'
            },
            'RuntimeUpgradeProposal': {
                'id': 'u32',
                'proposer': 'AccountId',
                'stake': 'Balance',
                'name': 'Text',
                'description': 'Text',
                'wasm_hash': 'Hash',
                'proposed_at': 'BlockNumber',
                'status': 'ProposalStatus'
            },
            'TallyResult': {
                'proposal_id': 'u32',
                'abstentions': 'u32',
                'approvals': 'u32',
                'rejections': 'u32',
                'slashes': 'u32',
                'status': 'ProposalStatus',
                'finalized_at': 'BlockNumber'
            }
        });
    }
    catch (err) {
        console.error('Failed to register custom types of Joystream node', err);
    }
}
function registerJoystreamTypes() {
    members_1.registerMembershipTypes();
    roles_1.registerRolesTypes();
    media_1.registerMediaTypes();
    registerElectionAndProposalTypes();
}
exports.registerJoystreamTypes = registerJoystreamTypes;
//# sourceMappingURL=index.js.map