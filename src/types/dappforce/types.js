"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var codec_1 = require("@polkadot/types/codec");
var types_1 = require("@polkadot/types");
var IpfsHash = /** @class */ (function (_super) {
    tslib_1.__extends(IpfsHash, _super);
    function IpfsHash() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return IpfsHash;
}(types_1.Text));
exports.IpfsHash = IpfsHash;
var BlogId = /** @class */ (function (_super) {
    tslib_1.__extends(BlogId, _super);
    function BlogId() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return BlogId;
}(types_1.u64));
exports.BlogId = BlogId;
var OptionIpfsHash = /** @class */ (function (_super) {
    tslib_1.__extends(OptionIpfsHash, _super);
    function OptionIpfsHash() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return OptionIpfsHash;
}(codec_1.Option.with(IpfsHash)));
exports.OptionIpfsHash = OptionIpfsHash;
var PostId = /** @class */ (function (_super) {
    tslib_1.__extends(PostId, _super);
    function PostId() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return PostId;
}(types_1.u64));
exports.PostId = PostId;
var CommentId = /** @class */ (function (_super) {
    tslib_1.__extends(CommentId, _super);
    function CommentId() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return CommentId;
}(types_1.u64));
exports.CommentId = CommentId;
var ReactionId = /** @class */ (function (_super) {
    tslib_1.__extends(ReactionId, _super);
    function ReactionId() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ReactionId;
}(types_1.u64));
exports.ReactionId = ReactionId;
var Change = /** @class */ (function (_super) {
    tslib_1.__extends(Change, _super);
    function Change(value) {
        return _super.call(this, {
            account: types_1.AccountId,
            block: types_1.BlockNumber,
            time: types_1.Moment
        }, value) || this;
    }
    Object.defineProperty(Change.prototype, "account", {
        get: function () {
            return this.get('account');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Change.prototype, "block", {
        get: function () {
            return this.get('block');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Change.prototype, "time", {
        get: function () {
            return this.get('time');
        },
        enumerable: true,
        configurable: true
    });
    return Change;
}(codec_1.Struct));
exports.Change = Change;
var VecAccountId = /** @class */ (function (_super) {
    tslib_1.__extends(VecAccountId, _super);
    function VecAccountId() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return VecAccountId;
}(types_1.Vector.with(types_1.AccountId)));
exports.VecAccountId = VecAccountId;
var OptionText = /** @class */ (function (_super) {
    tslib_1.__extends(OptionText, _super);
    function OptionText() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return OptionText;
}(codec_1.Option.with(types_1.Text)));
exports.OptionText = OptionText;
var OptionChange = /** @class */ (function (_super) {
    tslib_1.__extends(OptionChange, _super);
    function OptionChange() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return OptionChange;
}(codec_1.Option.with(Change)));
exports.OptionChange = OptionChange;
var OptionBlogId = /** @class */ (function (_super) {
    tslib_1.__extends(OptionBlogId, _super);
    function OptionBlogId() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return OptionBlogId;
}(codec_1.Option.with(BlogId)));
exports.OptionBlogId = OptionBlogId;
var OptionCommentId = /** @class */ (function (_super) {
    tslib_1.__extends(OptionCommentId, _super);
    function OptionCommentId() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return OptionCommentId;
}(codec_1.Option.with(CommentId)));
exports.OptionCommentId = OptionCommentId;
var OptionVecAccountId = /** @class */ (function (_super) {
    tslib_1.__extends(OptionVecAccountId, _super);
    function OptionVecAccountId() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return OptionVecAccountId;
}(codec_1.Option.with(VecAccountId)));
exports.OptionVecAccountId = OptionVecAccountId;
var Blog = /** @class */ (function (_super) {
    tslib_1.__extends(Blog, _super);
    function Blog(value) {
        return _super.call(this, {
            id: BlogId,
            created: Change,
            updated: OptionChange,
            writers: VecAccountId,
            slug: types_1.Text,
            ipfs_hash: IpfsHash,
            posts_count: types_1.u16,
            followers_count: types_1.u32,
            edit_history: VecBlogHistoryRecord
        }, value) || this;
    }
    Object.defineProperty(Blog.prototype, "id", {
        get: function () {
            return this.get('id');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Blog.prototype, "created", {
        get: function () {
            return this.get('created');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Blog.prototype, "updated", {
        get: function () {
            return this.get('updated');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Blog.prototype, "writers", {
        get: function () {
            return this.get('writers');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Blog.prototype, "slug", {
        get: function () {
            return this.get('slug');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Blog.prototype, "ipfs_hash", {
        get: function () {
            var ipfsHash = this.get('ipfs_hash');
            return ipfsHash.toString();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Blog.prototype, "posts_count", {
        // get ipfs_hash (): BlogData {
        //   const IpfsHash = this.get('ipfs_hash') as Text;
        //   return JSON.parse(IpfsHash.toString());
        // }
        get: function () {
            return this.get('posts_count');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Blog.prototype, "followers_count", {
        get: function () {
            return this.get('followers_count');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Blog.prototype, "edit_history", {
        get: function () {
            return this.get('edit_history');
        },
        enumerable: true,
        configurable: true
    });
    return Blog;
}(codec_1.Struct));
exports.Blog = Blog;
var BlogUpdate = /** @class */ (function (_super) {
    tslib_1.__extends(BlogUpdate, _super);
    function BlogUpdate(value) {
        return _super.call(this, {
            writers: OptionVecAccountId,
            slug: OptionText,
            ipfs_hash: OptionIpfsHash
        }, value) || this;
    }
    Object.defineProperty(BlogUpdate.prototype, "writers", {
        get: function () {
            return this.get('writers');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BlogUpdate.prototype, "slug", {
        get: function () {
            return this.get('slug');
        },
        set: function (value) {
            this.set('slug', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BlogUpdate.prototype, "ipfs_hash", {
        get: function () {
            return this.get('ipfs_hash');
        },
        set: function (value) {
            this.set('ipfs_hash', value);
        },
        enumerable: true,
        configurable: true
    });
    return BlogUpdate;
}(codec_1.Struct));
exports.BlogUpdate = BlogUpdate;
var Post = /** @class */ (function (_super) {
    tslib_1.__extends(Post, _super);
    function Post(value) {
        return _super.call(this, {
            id: PostId,
            blog_id: BlogId,
            created: Change,
            updated: OptionChange,
            slug: types_1.Text,
            ipfs_hash: IpfsHash,
            comments_count: types_1.u16,
            upvotes_count: types_1.u16,
            downvotes_count: types_1.u16,
            edit_history: VecPostHistoryRecord
        }, value) || this;
    }
    Object.defineProperty(Post.prototype, "id", {
        get: function () {
            return this.get('id');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Post.prototype, "blog_id", {
        get: function () {
            return this.get('blog_id');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Post.prototype, "created", {
        get: function () {
            return this.get('created');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Post.prototype, "updated", {
        get: function () {
            return this.get('updated');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Post.prototype, "slug", {
        get: function () {
            return this.get('slug');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Post.prototype, "ipfs_hash", {
        get: function () {
            var ipfsHash = this.get('ipfs_hash');
            return ipfsHash.toString();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Post.prototype, "comments_count", {
        get: function () {
            return this.get('comments_count');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Post.prototype, "upvotes_count", {
        get: function () {
            return this.get('upvotes_count');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Post.prototype, "downvotes_count", {
        get: function () {
            return this.get('downvotes_count');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Post.prototype, "edit_history", {
        get: function () {
            return this.get('edit_history');
        },
        enumerable: true,
        configurable: true
    });
    return Post;
}(codec_1.Struct));
exports.Post = Post;
var PostUpdate = /** @class */ (function (_super) {
    tslib_1.__extends(PostUpdate, _super);
    function PostUpdate(value) {
        return _super.call(this, {
            blog_id: OptionBlogId,
            slug: OptionText,
            ipfs_hash: OptionIpfsHash
        }, value) || this;
    }
    Object.defineProperty(PostUpdate.prototype, "ipfs_hash", {
        get: function () {
            return this.get('ipfs_hash');
        },
        set: function (value) {
            this.set('ipfs_hash', value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PostUpdate.prototype, "slug", {
        get: function () {
            return this.get('slug');
        },
        set: function (value) {
            this.set('slug', value);
        },
        enumerable: true,
        configurable: true
    });
    return PostUpdate;
}(codec_1.Struct));
exports.PostUpdate = PostUpdate;
var Comment = /** @class */ (function (_super) {
    tslib_1.__extends(Comment, _super);
    function Comment(value) {
        return _super.call(this, {
            id: CommentId,
            parent_id: OptionCommentId,
            post_id: PostId,
            created: Change,
            updated: OptionChange,
            ipfs_hash: IpfsHash,
            upvotes_count: types_1.u16,
            downvotes_count: types_1.u16,
            edit_history: VecCommentHistoryRecord
        }, value) || this;
    }
    Object.defineProperty(Comment.prototype, "id", {
        get: function () {
            return this.get('id');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Comment.prototype, "parent_id", {
        get: function () {
            return this.get('parent_id');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Comment.prototype, "post_id", {
        get: function () {
            return this.get('post_id');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Comment.prototype, "created", {
        get: function () {
            return this.get('created');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Comment.prototype, "updated", {
        get: function () {
            return this.get('updated');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Comment.prototype, "ipfs_hash", {
        get: function () {
            var ipfsHash = this.get('ipfs_hash');
            return ipfsHash.toString();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Comment.prototype, "upvotes_count", {
        get: function () {
            return this.get('upvotes_count');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Comment.prototype, "downvotes_count", {
        get: function () {
            return this.get('downvotes_count');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Comment.prototype, "edit_history", {
        get: function () {
            return this.get('edit_history');
        },
        enumerable: true,
        configurable: true
    });
    return Comment;
}(codec_1.Struct));
exports.Comment = Comment;
var CommentUpdate = /** @class */ (function (_super) {
    tslib_1.__extends(CommentUpdate, _super);
    function CommentUpdate(value) {
        return _super.call(this, {
            ipfs_hash: IpfsHash
        }, value) || this;
    }
    Object.defineProperty(CommentUpdate.prototype, "ipfs_hash", {
        get: function () {
            return this.get('ipfs_hash');
        },
        enumerable: true,
        configurable: true
    });
    return CommentUpdate;
}(codec_1.Struct));
exports.CommentUpdate = CommentUpdate;
var OptionComment = /** @class */ (function (_super) {
    tslib_1.__extends(OptionComment, _super);
    function OptionComment() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return OptionComment;
}(codec_1.Option.with(Comment)));
exports.OptionComment = OptionComment;
exports.ReactionKinds = {
    Upvote: 'Upvote',
    Downvote: 'Downvote'
};
var ReactionKind = /** @class */ (function (_super) {
    tslib_1.__extends(ReactionKind, _super);
    function ReactionKind(value) {
        return _super.call(this, [
            'Upvote',
            'Downvote'
        ], value) || this;
    }
    return ReactionKind;
}(codec_1.Enum));
exports.ReactionKind = ReactionKind;
var Reaction = /** @class */ (function (_super) {
    tslib_1.__extends(Reaction, _super);
    function Reaction(value) {
        return _super.call(this, {
            id: ReactionId,
            created: Change,
            updated: OptionChange,
            kind: ReactionKind
        }, value) || this;
    }
    Object.defineProperty(Reaction.prototype, "id", {
        get: function () {
            return this.get('id');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Reaction.prototype, "created", {
        get: function () {
            return this.get('created');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Reaction.prototype, "updated", {
        get: function () {
            return this.get('updated');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Reaction.prototype, "kind", {
        get: function () {
            return this.get('kind');
        },
        enumerable: true,
        configurable: true
    });
    return Reaction;
}(codec_1.Struct));
exports.Reaction = Reaction;
var SocialAccount = /** @class */ (function (_super) {
    tslib_1.__extends(SocialAccount, _super);
    function SocialAccount(value) {
        return _super.call(this, {
            followers_count: types_1.u32,
            following_accounts_count: types_1.u16,
            following_blogs_count: types_1.u16
        }, value) || this;
    }
    Object.defineProperty(SocialAccount.prototype, "followers_count", {
        get: function () {
            return this.get('followers_count');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SocialAccount.prototype, "following_accounts_count", {
        get: function () {
            return this.get('following_accounts_count');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SocialAccount.prototype, "following_blogs_count", {
        get: function () {
            return this.get('following_blogs_count');
        },
        enumerable: true,
        configurable: true
    });
    return SocialAccount;
}(codec_1.Struct));
exports.SocialAccount = SocialAccount;
var BlogHistoryRecord = /** @class */ (function (_super) {
    tslib_1.__extends(BlogHistoryRecord, _super);
    function BlogHistoryRecord(value) {
        return _super.call(this, {
            edited: Change,
            old_data: BlogUpdate
        }, value) || this;
    }
    Object.defineProperty(BlogHistoryRecord.prototype, "edited", {
        get: function () {
            return this.get('edited');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BlogHistoryRecord.prototype, "old_data", {
        get: function () {
            return this.get('old_data');
        },
        enumerable: true,
        configurable: true
    });
    return BlogHistoryRecord;
}(codec_1.Struct));
exports.BlogHistoryRecord = BlogHistoryRecord;
var VecBlogHistoryRecord = /** @class */ (function (_super) {
    tslib_1.__extends(VecBlogHistoryRecord, _super);
    function VecBlogHistoryRecord() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return VecBlogHistoryRecord;
}(types_1.Vector.with(BlogHistoryRecord)));
exports.VecBlogHistoryRecord = VecBlogHistoryRecord;
var PostHistoryRecord = /** @class */ (function (_super) {
    tslib_1.__extends(PostHistoryRecord, _super);
    function PostHistoryRecord(value) {
        return _super.call(this, {
            edited: Change,
            old_data: PostUpdate
        }, value) || this;
    }
    Object.defineProperty(PostHistoryRecord.prototype, "edited", {
        get: function () {
            return this.get('edited');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PostHistoryRecord.prototype, "old_data", {
        get: function () {
            return this.get('old_data');
        },
        enumerable: true,
        configurable: true
    });
    return PostHistoryRecord;
}(codec_1.Struct));
exports.PostHistoryRecord = PostHistoryRecord;
var VecPostHistoryRecord = /** @class */ (function (_super) {
    tslib_1.__extends(VecPostHistoryRecord, _super);
    function VecPostHistoryRecord() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return VecPostHistoryRecord;
}(types_1.Vector.with(PostHistoryRecord)));
exports.VecPostHistoryRecord = VecPostHistoryRecord;
var CommentHistoryRecord = /** @class */ (function (_super) {
    tslib_1.__extends(CommentHistoryRecord, _super);
    function CommentHistoryRecord(value) {
        return _super.call(this, {
            edited: Change,
            old_data: CommentUpdate
        }, value) || this;
    }
    Object.defineProperty(CommentHistoryRecord.prototype, "edited", {
        get: function () {
            return this.get('edited');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CommentHistoryRecord.prototype, "old_data", {
        get: function () {
            return this.get('old_data');
        },
        enumerable: true,
        configurable: true
    });
    return CommentHistoryRecord;
}(codec_1.Struct));
exports.CommentHistoryRecord = CommentHistoryRecord;
var VecCommentHistoryRecord = /** @class */ (function (_super) {
    tslib_1.__extends(VecCommentHistoryRecord, _super);
    function VecCommentHistoryRecord() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return VecCommentHistoryRecord;
}(types_1.Vector.with(CommentHistoryRecord)));
exports.VecCommentHistoryRecord = VecCommentHistoryRecord;
function registerBlogsTypes() {
    try {
        var typeRegistry = types_1.getTypeRegistry();
        typeRegistry.register({
            BlogId: BlogId,
            PostId: PostId,
            CommentId: CommentId,
            ReactionId: ReactionId,
            Change: Change,
            Blog: Blog,
            BlogUpdate: BlogUpdate,
            Post: Post,
            PostUpdate: PostUpdate,
            Comment: Comment,
            CommentUpdate: CommentUpdate,
            ReactionKind: ReactionKind,
            Reaction: Reaction,
            SocialAccount: SocialAccount,
            BlogHistoryRecord: BlogHistoryRecord,
            PostHistoryRecord: PostHistoryRecord,
            CommentHistoryRecord: CommentHistoryRecord
        });
    }
    catch (err) {
        console.error('Failed to register custom types of blogs module', err);
    }
}
exports.registerBlogsTypes = registerBlogsTypes;
//# sourceMappingURL=types.js.map