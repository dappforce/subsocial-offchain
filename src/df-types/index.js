"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.registerDfTypes = registerDfTypes;
exports.ElectionStage = exports.Revealing = exports.Voting = exports.Announcing = void 0;

var _codec = require("@polkadot/types/codec");

var _types = require("@polkadot/types");

var _blogs = require("./src/blogs");

class Announcing extends _types.BlockNumber {}

exports.Announcing = Announcing;

class Voting extends _types.BlockNumber {}

exports.Voting = Voting;

class Revealing extends _types.BlockNumber {}

exports.Revealing = Revealing;

class ElectionStage extends _codec.EnumType {
  constructor(value, index) {
    super({
      Announcing,
      Voting,
      Revealing
    }, value, index);
  }
  /** Create a new Announcing stage. */


  static Announcing(endsAt) {
    return this.newElectionStage(Announcing.name, endsAt);
  }
  /** Create a new Voting stage. */


  static Voting(endsAt) {
    return this.newElectionStage(Voting.name, endsAt);
  }
  /** Create a new Revealing stage. */


  static Revealing(endsAt) {
    return this.newElectionStage(Revealing.name, endsAt);
  }

  static newElectionStage(stageName, endsAt) {
    return new ElectionStage({
      [stageName]: endsAt
    });
  }

}

exports.ElectionStage = ElectionStage;

function registerDfTypes() {
  (0, _blogs.registerBlogsTypes)();
}