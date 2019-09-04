"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.registerRolesTypes = registerRolesTypes;
exports.RoleParameters = exports.Actor = exports.Role = void 0;

var _codec = require("@polkadot/types/codec");

var _types = require("@polkadot/types");

var _members = require("./members");

class Role extends _codec.Enum {
  constructor(value) {
    super(['Storage'], value);
  }

}

exports.Role = Role;

class Actor extends _codec.Struct {
  constructor(value) {
    super({
      member_id: _members.MemberId,
      role: Role,
      account: _types.AccountId,
      joined_at: _types.BlockNumber
    }, value);
  }

  get member_id() {
    return this.get('member_id');
  }

  get role() {
    return this.get('role');
  }

  get account() {
    return this.get('account');
  }

  get joined_at() {
    return this.get('joined_at');
  }

}

exports.Actor = Actor;

class RoleParameters extends _codec.Struct {
  constructor(value) {
    super({
      min_stake: _types.Balance,
      min_actors: _types.u32,
      max_actors: _types.u32,
      reward: _types.Balance,
      reward_period: _types.BlockNumber,
      bonding_period: _types.BlockNumber,
      unbonding_period: _types.BlockNumber,
      min_service_period: _types.BlockNumber,
      startup_grace_period: _types.BlockNumber,
      entry_request_fee: _types.Balance
    }, value);
  }

  get min_stake() {
    return this.get('min_stake');
  }

  get max_actors() {
    return this.get('max_actors');
  }

  get min_actors() {
    return this.get('min_actors');
  }

  get reward() {
    return this.get('reward');
  }

  get reward_period() {
    return this.get('reward_period');
  }

  get unbonding_period() {
    return this.get('unbonding_period');
  }

  get bonding_period() {
    return this.get('bonding_period');
  }

  get min_service_period() {
    return this.get('min_service_period');
  }

  get startup_grace_period() {
    return this.get('startup_grace_period');
  }

  get entry_request_fee() {
    return this.get('entry_request_fee');
  }

}

exports.RoleParameters = RoleParameters;

function registerRolesTypes() {
  try {
    const typeRegistry = (0, _types.getTypeRegistry)();
    typeRegistry.register({
      Role,
      RoleParameters,
      Request: '(AccountId, MemberId, Role, BlockNumber)',
      Requests: 'Vec<Request>',
      Actor
    });
  } catch (err) {
    console.error('Failed to register custom types of roles module', err);
  }
}