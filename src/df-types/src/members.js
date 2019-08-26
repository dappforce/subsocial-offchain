"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.registerMembershipTypes = registerMembershipTypes;
exports.PaidMembershipTerms = exports.UserInfo = exports.EntryMethod = exports.Screening = exports.Paid = exports.SubscriptionId = exports.PaidTermId = exports.MemberId = void 0;

var _codec = require("@polkadot/types/codec");

var _types = require("@polkadot/types");

var _index = require("../index");

class MemberId extends _types.u64 {}

exports.MemberId = MemberId;

class PaidTermId extends _types.u64 {}

exports.PaidTermId = PaidTermId;

class SubscriptionId extends _types.u64 {}

exports.SubscriptionId = SubscriptionId;

class Paid extends PaidTermId {}

exports.Paid = Paid;

class Screening extends _types.AccountId {}

exports.Screening = Screening;

class EntryMethod extends _codec.EnumType {
  constructor(value, index) {
    super({
      Paid,
      Screening
    }, value, index);
  }

}

exports.EntryMethod = EntryMethod;

class UserInfo extends _codec.Struct {
  constructor(value) {
    super({
      handle: _index.OptionText,
      avatar_uri: _index.OptionText,
      about: _index.OptionText
    }, value);
  }

}

exports.UserInfo = UserInfo;

class PaidMembershipTerms extends _codec.Struct {
  constructor(value) {
    super({
      id: PaidTermId,
      fee: _types.BalanceOf,
      text: _types.Text
    }, value);
  }

  get id() {
    return this.get('id');
  }

  get fee() {
    return this.get('fee');
  }

  get text() {
    return this.get('text');
  }

}

exports.PaidMembershipTerms = PaidMembershipTerms;

function registerMembershipTypes() {
  try {
    const typeRegistry = (0, _types.getTypeRegistry)(); // Register enum EntryMethod and its options:

    typeRegistry.register({
      Paid,
      Screening,
      EntryMethod
    });
    typeRegistry.register({
      MemberId,
      PaidTermId,
      SubscriptionId,
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
      UserInfo,
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
  } catch (err) {
    console.error('Failed to register custom types of membership module', err);
  }
}