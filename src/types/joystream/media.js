"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var codec_1 = require("@polkadot/types/codec");
var types_1 = require("@polkadot/types");
var _1 = require("./");
var util_crypto_1 = require("@polkadot/util-crypto");
var keyring_1 = require("@polkadot/keyring");
var util_1 = require("@polkadot/util");
var ContentId = /** @class */ (function (_super) {
    tslib_1.__extends(ContentId, _super);
    function ContentId() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ContentId.generate = function () {
        // randomAsU8a uses https://www.npmjs.com/package/tweetnacl#random-bytes-generation
        return new ContentId(util_crypto_1.randomAsU8a());
    };
    /** This function is for backward-compatibility with content ids that were generated as UUID. */
    // TODO Delete this backward-compatibility when a new version of blockchain launched.
    ContentId.isUuidFormat = function (contentId) {
        return typeof contentId === 'string'
            ? contentId.indexOf('-') > 0
            : contentId.indexOf('-'.charCodeAt(0)) > 0;
    };
    ContentId.fromAddress = function (contentId) {
        return new ContentId(ContentId.isUuidFormat(contentId)
            ? util_1.stringToU8a(contentId)
            : keyring_1.decodeAddress(contentId));
    };
    ContentId.toAddress = function (contentId) {
        return ContentId.isUuidFormat(contentId)
            ? util_1.u8aToString(contentId)
            : keyring_1.encodeAddress(contentId);
    };
    ContentId.prototype.toAddress = function () {
        return ContentId.toAddress(this);
    };
    return ContentId;
}(types_1.Hash));
exports.ContentId = ContentId;
var DataObjectTypeId = /** @class */ (function (_super) {
    tslib_1.__extends(DataObjectTypeId, _super);
    function DataObjectTypeId() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return DataObjectTypeId;
}(types_1.u64));
exports.DataObjectTypeId = DataObjectTypeId;
var DataObjectStorageRelationshipId = /** @class */ (function (_super) {
    tslib_1.__extends(DataObjectStorageRelationshipId, _super);
    function DataObjectStorageRelationshipId() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return DataObjectStorageRelationshipId;
}(types_1.u64));
exports.DataObjectStorageRelationshipId = DataObjectStorageRelationshipId;
var SchemaId = /** @class */ (function (_super) {
    tslib_1.__extends(SchemaId, _super);
    function SchemaId() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return SchemaId;
}(types_1.u64));
exports.SchemaId = SchemaId;
var DownloadSessionId = /** @class */ (function (_super) {
    tslib_1.__extends(DownloadSessionId, _super);
    function DownloadSessionId() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return DownloadSessionId;
}(types_1.u64));
exports.DownloadSessionId = DownloadSessionId;
var BlockAndTime = /** @class */ (function (_super) {
    tslib_1.__extends(BlockAndTime, _super);
    function BlockAndTime(value) {
        return _super.call(this, {
            block: types_1.BlockNumber,
            time: types_1.Moment
        }, value) || this;
    }
    Object.defineProperty(BlockAndTime.prototype, "block", {
        get: function () {
            return this.get('block');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BlockAndTime.prototype, "time", {
        get: function () {
            return this.get('time');
        },
        enumerable: true,
        configurable: true
    });
    return BlockAndTime;
}(codec_1.Struct));
exports.BlockAndTime = BlockAndTime;
var ContentVisibility = /** @class */ (function (_super) {
    tslib_1.__extends(ContentVisibility, _super);
    function ContentVisibility(value) {
        return _super.call(this, [
            'Draft',
            'Public'
        ], value) || this;
    }
    return ContentVisibility;
}(codec_1.Enum));
exports.ContentVisibility = ContentVisibility;
var VecContentId = /** @class */ (function (_super) {
    tslib_1.__extends(VecContentId, _super);
    function VecContentId() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return VecContentId;
}(codec_1.Vector.with(ContentId)));
exports.VecContentId = VecContentId;
var ContentMetadata = /** @class */ (function (_super) {
    tslib_1.__extends(ContentMetadata, _super);
    function ContentMetadata(value) {
        return _super.call(this, {
            owner: types_1.AccountId,
            added_at: BlockAndTime,
            children_ids: VecContentId,
            visibility: ContentVisibility,
            schema: SchemaId,
            json: types_1.Text
        }, value) || this;
    }
    Object.defineProperty(ContentMetadata.prototype, "owner", {
        get: function () {
            return this.get('owner');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ContentMetadata.prototype, "added_at", {
        get: function () {
            return this.get('added_at');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ContentMetadata.prototype, "children_ids", {
        get: function () {
            return this.get('children_ids');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ContentMetadata.prototype, "visibility", {
        get: function () {
            return this.get('visibility');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ContentMetadata.prototype, "schema", {
        get: function () {
            return this.get('schema');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ContentMetadata.prototype, "json", {
        get: function () {
            return this.get('json');
        },
        enumerable: true,
        configurable: true
    });
    ContentMetadata.prototype.parseJson = function () {
        return JSON.parse(this.json.toString());
    };
    return ContentMetadata;
}(codec_1.Struct));
exports.ContentMetadata = ContentMetadata;
var OptionVecContentId = /** @class */ (function (_super) {
    tslib_1.__extends(OptionVecContentId, _super);
    function OptionVecContentId() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return OptionVecContentId;
}(codec_1.Option.with(VecContentId)));
exports.OptionVecContentId = OptionVecContentId;
var OptionSchemaId = /** @class */ (function (_super) {
    tslib_1.__extends(OptionSchemaId, _super);
    function OptionSchemaId() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return OptionSchemaId;
}(codec_1.Option.with(SchemaId)));
exports.OptionSchemaId = OptionSchemaId;
var OptionContentVisibility = /** @class */ (function (_super) {
    tslib_1.__extends(OptionContentVisibility, _super);
    function OptionContentVisibility() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return OptionContentVisibility;
}(codec_1.Option.with(ContentVisibility)));
exports.OptionContentVisibility = OptionContentVisibility;
var ContentMetadataUpdate = /** @class */ (function (_super) {
    tslib_1.__extends(ContentMetadataUpdate, _super);
    function ContentMetadataUpdate(value) {
        return _super.call(this, {
            children_ids: OptionVecContentId,
            visibility: OptionContentVisibility,
            schema: OptionSchemaId,
            json: _1.OptionText
        }, value) || this;
    }
    return ContentMetadataUpdate;
}(codec_1.Struct));
exports.ContentMetadataUpdate = ContentMetadataUpdate;
var LiaisonJudgement = /** @class */ (function (_super) {
    tslib_1.__extends(LiaisonJudgement, _super);
    function LiaisonJudgement(value) {
        return _super.call(this, [
            'Pending',
            'Accepted',
            'Rejected'
        ], value) || this;
    }
    return LiaisonJudgement;
}(codec_1.Enum));
exports.LiaisonJudgement = LiaisonJudgement;
var DataObject = /** @class */ (function (_super) {
    tslib_1.__extends(DataObject, _super);
    function DataObject(value) {
        return _super.call(this, {
            owner: types_1.AccountId,
            added_at: BlockAndTime,
            type_id: DataObjectTypeId,
            size: types_1.u64,
            liaison: types_1.AccountId,
            liaison_judgement: LiaisonJudgement
        }, value) || this;
    }
    Object.defineProperty(DataObject.prototype, "owner", {
        get: function () {
            return this.get('owner');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataObject.prototype, "added_at", {
        get: function () {
            return this.get('added_at');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataObject.prototype, "type_id", {
        get: function () {
            return this.get('type_id');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataObject.prototype, "size_in_bytes", {
        /** Actually it's 'size', but 'size' is already reserved by a parent class. */
        get: function () {
            return this.get('size');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataObject.prototype, "liaison", {
        get: function () {
            return this.get('liaison');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataObject.prototype, "liaison_judgement", {
        get: function () {
            return this.get('liaison_judgement');
        },
        enumerable: true,
        configurable: true
    });
    return DataObject;
}(codec_1.Struct));
exports.DataObject = DataObject;
var DataObjectStorageRelationship = /** @class */ (function (_super) {
    tslib_1.__extends(DataObjectStorageRelationship, _super);
    function DataObjectStorageRelationship(value) {
        return _super.call(this, {
            content_id: ContentId,
            storage_provider: types_1.AccountId,
            ready: types_1.Bool
        }, value) || this;
    }
    Object.defineProperty(DataObjectStorageRelationship.prototype, "content_id", {
        get: function () {
            return this.get('content_id');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataObjectStorageRelationship.prototype, "storage_provider", {
        get: function () {
            return this.get('storage_provider');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataObjectStorageRelationship.prototype, "ready", {
        get: function () {
            return this.get('ready');
        },
        enumerable: true,
        configurable: true
    });
    return DataObjectStorageRelationship;
}(codec_1.Struct));
exports.DataObjectStorageRelationship = DataObjectStorageRelationship;
var DataObjectType = /** @class */ (function (_super) {
    tslib_1.__extends(DataObjectType, _super);
    function DataObjectType(value) {
        return _super.call(this, {
            description: types_1.Text,
            active: types_1.Bool
        }, value) || this;
    }
    Object.defineProperty(DataObjectType.prototype, "description", {
        get: function () {
            return this.get('description');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataObjectType.prototype, "active", {
        get: function () {
            return this.get('active');
        },
        enumerable: true,
        configurable: true
    });
    return DataObjectType;
}(codec_1.Struct));
exports.DataObjectType = DataObjectType;
var DownloadState = /** @class */ (function (_super) {
    tslib_1.__extends(DownloadState, _super);
    function DownloadState(value) {
        return _super.call(this, [
            'Started',
            'Ended'
        ], value) || this;
    }
    return DownloadState;
}(codec_1.Enum));
exports.DownloadState = DownloadState;
var DownloadSession = /** @class */ (function (_super) {
    tslib_1.__extends(DownloadSession, _super);
    function DownloadSession(value) {
        return _super.call(this, {
            content_id: ContentId,
            consumer: types_1.AccountId,
            distributor: types_1.AccountId,
            initiated_at_block: types_1.BlockNumber,
            initiated_at_time: types_1.Moment,
            state: DownloadState,
            transmitted_bytes: types_1.u64
        }, value) || this;
    }
    Object.defineProperty(DownloadSession.prototype, "content_id", {
        get: function () {
            return this.get('content_id');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DownloadSession.prototype, "consumer", {
        get: function () {
            return this.get('consumer');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DownloadSession.prototype, "distributor", {
        get: function () {
            return this.get('distributor');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DownloadSession.prototype, "initiated_at_block", {
        get: function () {
            return this.get('initiated_at_block');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DownloadSession.prototype, "initiated_at_time", {
        get: function () {
            return this.get('initiated_at_time');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DownloadSession.prototype, "state", {
        get: function () {
            return this.get('state');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DownloadSession.prototype, "transmitted_bytes", {
        get: function () {
            return this.get('transmitted_bytes');
        },
        enumerable: true,
        configurable: true
    });
    return DownloadSession;
}(codec_1.Struct));
exports.DownloadSession = DownloadSession;
function registerMediaTypes() {
    try {
        types_1.getTypeRegistry().register({
            '::ContentId': ContentId,
            '::DataObjectTypeId': DataObjectTypeId,
            SchemaId: SchemaId,
            ContentId: ContentId,
            ContentVisibility: ContentVisibility,
            ContentMetadata: ContentMetadata,
            ContentMetadataUpdate: ContentMetadataUpdate,
            LiaisonJudgement: LiaisonJudgement,
            DataObject: DataObject,
            DataObjectStorageRelationshipId: DataObjectStorageRelationshipId,
            DataObjectStorageRelationship: DataObjectStorageRelationship,
            DataObjectTypeId: DataObjectTypeId,
            DataObjectType: DataObjectType,
            DownloadState: DownloadState,
            DownloadSessionId: DownloadSessionId,
            DownloadSession: DownloadSession
        });
    }
    catch (err) {
        console.error('Failed to register custom types of media module', err);
    }
}
exports.registerMediaTypes = registerMediaTypes;
//# sourceMappingURL=media.js.map