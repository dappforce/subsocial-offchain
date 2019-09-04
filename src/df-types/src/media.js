"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.registerMediaTypes = registerMediaTypes;
exports.DownloadSession = exports.DownloadState = exports.DataObjectType = exports.DataObjectStorageRelationship = exports.DataObject = exports.LiaisonJudgement = exports.ContentMetadataUpdate = exports.OptionContentVisibility = exports.OptionSchemaId = exports.OptionVecContentId = exports.ContentMetadata = exports.VecContentId = exports.ContentVisibility = exports.BlockAndTime = exports.DownloadSessionId = exports.SchemaId = exports.DataObjectStorageRelationshipId = exports.DataObjectTypeId = exports.ContentId = void 0;

var _codec = require("@polkadot/types/codec");

var _types = require("@polkadot/types");

var _index = require("../index");

var _utilCrypto = require("@polkadot/util-crypto");

var _keyring = require("@polkadot/keyring");

var _util = require("@polkadot/util");

class ContentId extends _types.Hash {
  static generate() {
    // randomAsU8a uses https://www.npmjs.com/package/tweetnacl#random-bytes-generation
    return new ContentId((0, _utilCrypto.randomAsU8a)());
  }
  /** This function is for backward-compatibility with content ids that were generated as UUID. */
  // TODO Delete this backward-compatibility when a new version of blockchain launched.


  static isUuidFormat(contentId) {
    return typeof contentId === 'string' ? contentId.indexOf('-') > 0 : contentId.indexOf('-'.charCodeAt(0)) > 0;
  }

  static fromAddress(contentId) {
    return new ContentId(ContentId.isUuidFormat(contentId) ? (0, _util.stringToU8a)(contentId) : (0, _keyring.decodeAddress)(contentId));
  }

  static toAddress(contentId) {
    return ContentId.isUuidFormat(contentId) ? (0, _util.u8aToString)(contentId) : (0, _keyring.encodeAddress)(contentId);
  }

  toAddress() {
    return ContentId.toAddress(this);
  }

}

exports.ContentId = ContentId;

class DataObjectTypeId extends _types.u64 {}

exports.DataObjectTypeId = DataObjectTypeId;

class DataObjectStorageRelationshipId extends _types.u64 {}

exports.DataObjectStorageRelationshipId = DataObjectStorageRelationshipId;

class SchemaId extends _types.u64 {}

exports.SchemaId = SchemaId;

class DownloadSessionId extends _types.u64 {}

exports.DownloadSessionId = DownloadSessionId;

class BlockAndTime extends _codec.Struct {
  constructor(value) {
    super({
      block: _types.BlockNumber,
      time: _types.Moment
    }, value);
  }

  get block() {
    return this.get('block');
  }

  get time() {
    return this.get('time');
  }

} // TODO rename to Draft to Unlisted


exports.BlockAndTime = BlockAndTime;

class ContentVisibility extends _codec.Enum {
  constructor(value) {
    super(['Draft', 'Public'], value);
  }

}

exports.ContentVisibility = ContentVisibility;

class VecContentId extends _codec.Vector.with(ContentId) {}

exports.VecContentId = VecContentId;

class ContentMetadata extends _codec.Struct {
  constructor(value) {
    super({
      owner: _types.AccountId,
      added_at: BlockAndTime,
      children_ids: VecContentId,
      visibility: ContentVisibility,
      schema: SchemaId,
      json: _types.Text
    }, value);
  }

  get owner() {
    return this.get('owner');
  }

  get added_at() {
    return this.get('added_at');
  }

  get children_ids() {
    return this.get('children_ids');
  }

  get visibility() {
    return this.get('visibility');
  }

  get schema() {
    return this.get('schema');
  }

  get json() {
    return this.get('json');
  }

  parseJson() {
    return JSON.parse(this.json.toString());
  }

}

exports.ContentMetadata = ContentMetadata;

class OptionVecContentId extends _codec.Option.with(VecContentId) {}

exports.OptionVecContentId = OptionVecContentId;

class OptionSchemaId extends _codec.Option.with(SchemaId) {}

exports.OptionSchemaId = OptionSchemaId;

class OptionContentVisibility extends _codec.Option.with(ContentVisibility) {}

exports.OptionContentVisibility = OptionContentVisibility;

class ContentMetadataUpdate extends _codec.Struct {
  constructor(value) {
    super({
      children_ids: OptionVecContentId,
      visibility: OptionContentVisibility,
      schema: OptionSchemaId,
      json: _index.OptionText
    }, value);
  }

}

exports.ContentMetadataUpdate = ContentMetadataUpdate;

class LiaisonJudgement extends _codec.Enum {
  constructor(value) {
    super(['Pending', 'Accepted', 'Rejected'], value);
  }

}

exports.LiaisonJudgement = LiaisonJudgement;

class DataObject extends _codec.Struct {
  constructor(value) {
    super({
      owner: _types.AccountId,
      added_at: BlockAndTime,
      type_id: DataObjectTypeId,
      size: _types.u64,
      liaison: _types.AccountId,
      liaison_judgement: LiaisonJudgement
    }, value);
  }

  get owner() {
    return this.get('owner');
  }

  get added_at() {
    return this.get('added_at');
  }

  get type_id() {
    return this.get('type_id');
  }
  /** Actually it's 'size', but 'size' is already reserved by a parent class. */


  get size_in_bytes() {
    return this.get('size');
  }

  get liaison() {
    return this.get('liaison');
  }

  get liaison_judgement() {
    return this.get('liaison_judgement');
  }

}

exports.DataObject = DataObject;

class DataObjectStorageRelationship extends _codec.Struct {
  constructor(value) {
    super({
      content_id: ContentId,
      storage_provider: _types.AccountId,
      ready: _types.Bool
    }, value);
  }

  get content_id() {
    return this.get('content_id');
  }

  get storage_provider() {
    return this.get('storage_provider');
  }

  get ready() {
    return this.get('ready');
  }

}

exports.DataObjectStorageRelationship = DataObjectStorageRelationship;

class DataObjectType extends _codec.Struct {
  constructor(value) {
    super({
      description: _types.Text,
      active: _types.Bool
    }, value);
  }

  get description() {
    return this.get('description');
  }

  get active() {
    return this.get('active');
  }

}

exports.DataObjectType = DataObjectType;

class DownloadState extends _codec.Enum {
  constructor(value) {
    super(['Started', 'Ended'], value);
  }

}

exports.DownloadState = DownloadState;

class DownloadSession extends _codec.Struct {
  constructor(value) {
    super({
      content_id: ContentId,
      consumer: _types.AccountId,
      distributor: _types.AccountId,
      initiated_at_block: _types.BlockNumber,
      initiated_at_time: _types.Moment,
      state: DownloadState,
      transmitted_bytes: _types.u64
    }, value);
  }

  get content_id() {
    return this.get('content_id');
  }

  get consumer() {
    return this.get('consumer');
  }

  get distributor() {
    return this.get('distributor');
  }

  get initiated_at_block() {
    return this.get('initiated_at_block');
  }

  get initiated_at_time() {
    return this.get('initiated_at_time');
  }

  get state() {
    return this.get('state');
  }

  get transmitted_bytes() {
    return this.get('transmitted_bytes');
  }

}

exports.DownloadSession = DownloadSession;

function registerMediaTypes() {
  try {
    (0, _types.getTypeRegistry)().register({
      '::ContentId': ContentId,
      '::DataObjectTypeId': DataObjectTypeId,
      SchemaId,
      ContentId,
      ContentVisibility,
      ContentMetadata,
      ContentMetadataUpdate,
      LiaisonJudgement,
      DataObject,
      DataObjectStorageRelationshipId,
      DataObjectStorageRelationship,
      DataObjectTypeId,
      DataObjectType,
      DownloadState,
      DownloadSessionId,
      DownloadSession
    });
  } catch (err) {
    console.error('Failed to register custom types of media module', err);
  }
}