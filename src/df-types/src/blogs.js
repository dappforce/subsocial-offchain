"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const codec_1 = require("@polkadot/types/codec");
const types_1 = require("@polkadot/types");
class IpfsHash extends types_1.Text {
}
exports.IpfsHash = IpfsHash;
class BlogId extends types_1.u64 {
}
exports.BlogId = BlogId;
class OptionIpfsHash extends codec_1.Option.with(IpfsHash) {
}
exports.OptionIpfsHash = OptionIpfsHash;
class PostId extends types_1.u64 {
}
exports.PostId = PostId;
class CommentId extends types_1.u64 {
}
exports.CommentId = CommentId;
class ReactionId extends types_1.u64 {
}
exports.ReactionId = ReactionId;
class Change extends codec_1.Struct {
    constructor(value) {
        super({
            account: types_1.AccountId,
            block: types_1.BlockNumber,
            time: types_1.Moment
        }, value);
    }
    get account() {
        return this.get('account');
    }
    get block() {
        return this.get('block');
    }
    get time() {
        return this.get('time');
    }
}
exports.Change = Change;
class VecAccountId extends types_1.Vector.with(types_1.AccountId) {
}
exports.VecAccountId = VecAccountId;
class OptionText extends codec_1.Option.with(types_1.Text) {
}
exports.OptionText = OptionText;
class OptionChange extends codec_1.Option.with(Change) {
}
exports.OptionChange = OptionChange;
class OptionBlogId extends codec_1.Option.with(BlogId) {
}
exports.OptionBlogId = OptionBlogId;
class OptionCommentId extends codec_1.Option.with(CommentId) {
}
exports.OptionCommentId = OptionCommentId;
class OptionVecAccountId extends codec_1.Option.with(VecAccountId) {
}
exports.OptionVecAccountId = OptionVecAccountId;
class Blog extends codec_1.Struct {
    constructor(value) {
        super({
            id: BlogId,
            created: Change,
            updated: OptionChange,
            writers: VecAccountId,
            slug: types_1.Text,
            ipfs_hash: IpfsHash,
            posts_count: types_1.u16,
            followers_count: types_1.u32,
            edit_history: VecBlogHistoryRecord,
            score: types_1.i32
        }, value);
    }
    get id() {
        return this.get('id');
    }
    get created() {
        return this.get('created');
    }
    get updated() {
        return this.get('updated');
    }
    get writers() {
        return this.get('writers');
    }
    get slug() {
        return this.get('slug');
    }
    get ipfs_hash() {
        const ipfsHash = this.get('ipfs_hash');
        return ipfsHash.toString();
    }
    // get ipfs_hash (): BlogData {
    //   const IpfsHash = this.get('ipfs_hash') as Text;
    //   return JSON.parse(IpfsHash.toString());
    // }
    get posts_count() {
        return this.get('posts_count');
    }
    get followers_count() {
        return this.get('followers_count');
    }
    get edit_history() {
        return this.get('edit_history');
    }
    get score() {
        return this.get('score');
    }
}
exports.Blog = Blog;
class BlogUpdate extends codec_1.Struct {
    constructor(value) {
        super({
            writers: OptionVecAccountId,
            slug: OptionText,
            ipfs_hash: OptionIpfsHash
        }, value);
    }
    get writers() {
        return this.get('writers');
    }
    get slug() {
        return this.get('slug');
    }
    get ipfs_hash() {
        return this.get('ipfs_hash');
    }
    set ipfs_hash(value) {
        this.set('ipfs_hash', value);
    }
    set slug(value) {
        this.set('slug', value);
    }
}
exports.BlogUpdate = BlogUpdate;
class Post extends codec_1.Struct {
    constructor(value) {
        super({
            id: PostId,
            blog_id: BlogId,
            created: Change,
            updated: OptionChange,
            slug: types_1.Text,
            ipfs_hash: IpfsHash,
            comments_count: types_1.u16,
            upvotes_count: types_1.u16,
            downvotes_count: types_1.u16,
            shares_count: types_1.u16,
            edit_history: VecPostHistoryRecord,
            score: types_1.i32
        }, value);
    }
    get id() {
        return this.get('id');
    }
    get blog_id() {
        return this.get('blog_id');
    }
    get created() {
        return this.get('created');
    }
    get updated() {
        return this.get('updated');
    }
    get slug() {
        return this.get('slug');
    }
    get ipfs_hash() {
        const ipfsHash = this.get('ipfs_hash');
        return ipfsHash.toString();
    }
    get comments_count() {
        return this.get('comments_count');
    }
    get upvotes_count() {
        return this.get('upvotes_count');
    }
    get downvotes_count() {
        return this.get('downvotes_count');
    }
    get shares_count() {
        return this.get('shares_count');
    }
    get edit_history() {
        return this.get('edit_history');
    }
    get score() {
        return this.get('score');
    }
}
exports.Post = Post;
class PostUpdate extends codec_1.Struct {
    constructor(value) {
        super({
            blog_id: OptionBlogId,
            slug: OptionText,
            ipfs_hash: OptionIpfsHash
        }, value);
    }
    get ipfs_hash() {
        return this.get('ipfs_hash');
    }
    get slug() {
        return this.get('slug');
    }
    set ipfs_hash(value) {
        this.set('ipfs_hash', value);
    }
    set slug(value) {
        this.set('slug', value);
    }
}
exports.PostUpdate = PostUpdate;
class Comment extends codec_1.Struct {
    constructor(value) {
        super({
            id: CommentId,
            parent_id: OptionCommentId,
            post_id: PostId,
            created: Change,
            updated: OptionChange,
            ipfs_hash: IpfsHash,
            upvotes_count: types_1.u16,
            downvotes_count: types_1.u16,
            shares_count: types_1.u16,
            direct_replies_count: types_1.u16,
            edit_history: VecCommentHistoryRecord,
            score: types_1.i32
        }, value);
    }
    get id() {
        return this.get('id');
    }
    get parent_id() {
        return this.get('parent_id');
    }
    get post_id() {
        return this.get('post_id');
    }
    get created() {
        return this.get('created');
    }
    get updated() {
        return this.get('updated');
    }
    get ipfs_hash() {
        const ipfsHash = this.get('ipfs_hash');
        return ipfsHash.toString();
    }
    get upvotes_count() {
        return this.get('upvotes_count');
    }
    get downvotes_count() {
        return this.get('downvotes_count');
    }
    get shares_count() {
        return this.get('shares_count');
    }
    get direct_replies_count() {
        return this.get('direct_replies_count');
    }
    get edit_history() {
        return this.get('edit_history');
    }
    get score() {
        return this.get('score');
    }
}
exports.Comment = Comment;
class CommentUpdate extends codec_1.Struct {
    constructor(value) {
        super({
            ipfs_hash: IpfsHash
        }, value);
    }
    get ipfs_hash() {
        return this.get('ipfs_hash');
    }
}
exports.CommentUpdate = CommentUpdate;
class OptionComment extends codec_1.Option.with(Comment) {
}
exports.OptionComment = OptionComment;
exports.ReactionKinds = {
    Upvote: 'Upvote',
    Downvote: 'Downvote'
};
class ReactionKind extends codec_1.Enum {
    constructor(value) {
        super(['Upvote', 'Downvote'], value);
    }
}
exports.ReactionKind = ReactionKind;
class Reaction extends codec_1.Struct {
    constructor(value) {
        super({
            id: ReactionId,
            created: Change,
            updated: OptionChange,
            kind: ReactionKind
        }, value);
    }
    get id() {
        return this.get('id');
    }
    get created() {
        return this.get('created');
    }
    get updated() {
        return this.get('updated');
    }
    get kind() {
        return this.get('kind');
    }
}
exports.Reaction = Reaction;
class SocialAccount extends codec_1.Struct {
    constructor(value) {
        super({
            followers_count: types_1.u32,
            following_accounts_count: types_1.u16,
            following_blogs_count: types_1.u16,
            reputation: types_1.u32,
            profile: OptionProfile
        }, value);
    }
    get followers_count() {
        return this.get('followers_count');
    }
    get following_accounts_count() {
        return this.get('following_accounts_count');
    }
    get following_blogs_count() {
        return this.get('following_blogs_count');
    }
    get reputation() {
        return this.get('reputation');
    }
    get profile() {
        return this.get('profile');
    }
}
exports.SocialAccount = SocialAccount;
class Profile extends codec_1.Struct {
    constructor(value) {
        super({
            created: Change,
            updated: OptionChange,
            username: types_1.Text,
            ipfs_hash: IpfsHash,
            edit_history: VecProfileHistoryRecord
        }, value);
    }
    get created() {
        return this.get('created');
    }
    get updated() {
        return this.get('updated');
    }
    get username() {
        return this.get('username');
    }
    get ipfs_hash() {
        const ipfsHash = this.get('ipfs_hash');
        return ipfsHash.toString();
    }
    get edit_history() {
        return this.get('edit_history');
    }
}
exports.Profile = Profile;
class OptionProfile extends codec_1.Option.with(Profile) {
}
exports.OptionProfile = OptionProfile;
class ProfileUpdate extends codec_1.Struct {
    constructor(value) {
        super({
            username: OptionText,
            ipfs_hash: OptionIpfsHash
        }, value);
    }
    get ipfs_hash() {
        return this.get('ipfs_hash');
    }
    get username() {
        return this.get('username');
    }
    set ipfs_hash(value) {
        this.set('ipfs_hash', value);
    }
    set username(value) {
        this.set('username', value);
    }
}
exports.ProfileUpdate = ProfileUpdate;
class BlogHistoryRecord extends codec_1.Struct {
    constructor(value) {
        super({
            edited: Change,
            old_data: BlogUpdate
        }, value);
    }
    get edited() {
        return this.get('edited');
    }
    get old_data() {
        return this.get('old_data');
    }
}
exports.BlogHistoryRecord = BlogHistoryRecord;
class VecBlogHistoryRecord extends types_1.Vector.with(BlogHistoryRecord) {
}
exports.VecBlogHistoryRecord = VecBlogHistoryRecord;
class PostHistoryRecord extends codec_1.Struct {
    constructor(value) {
        super({
            edited: Change,
            old_data: PostUpdate
        }, value);
    }
    get edited() {
        return this.get('edited');
    }
    get old_data() {
        return this.get('old_data');
    }
}
exports.PostHistoryRecord = PostHistoryRecord;
class VecPostHistoryRecord extends types_1.Vector.with(PostHistoryRecord) {
}
exports.VecPostHistoryRecord = VecPostHistoryRecord;
class CommentHistoryRecord extends codec_1.Struct {
    constructor(value) {
        super({
            edited: Change,
            old_data: CommentUpdate
        }, value);
    }
    get edited() {
        return this.get('edited');
    }
    get old_data() {
        return this.get('old_data');
    }
}
exports.CommentHistoryRecord = CommentHistoryRecord;
class VecCommentHistoryRecord extends types_1.Vector.with(CommentHistoryRecord) {
}
exports.VecCommentHistoryRecord = VecCommentHistoryRecord;
class ProfileHistoryRecord extends codec_1.Struct {
    constructor(value) {
        super({
            edited: Change,
            old_data: ProfileUpdate
        }, value);
    }
    get edited() {
        return this.get('edited');
    }
    get old_data() {
        return this.get('old_data');
    }
}
exports.ProfileHistoryRecord = ProfileHistoryRecord;
class VecProfileHistoryRecord extends types_1.Vector.with(ProfileHistoryRecord) {
}
exports.VecProfileHistoryRecord = VecProfileHistoryRecord;
exports.ScoringActions = {
    UpvotePost: 'UpvotePost',
    DownvotePost: 'DownvotePost',
    SharePost: 'SharePost',
    UpvoteComment: 'UpvoteComment',
    DownvoteComment: 'DownvoteComment',
    ShareComment: 'ShareComment',
    FollowBlog: 'FollowBlog',
    FollowAccount: 'FollowAccount'
};
class ScoringAction extends codec_1.Enum {
    constructor(value) {
        super([
            'UpvotePost',
            'DownvotePost',
            'SharePost',
            'UpvoteComment',
            'DownvoteComment',
            'ShareComment',
            'FollowBlog',
            'FollowAccount'
        ], value);
    }
}
exports.ScoringAction = ScoringAction;
function registerBlogsTypes() {
    try {
        const typeRegistry = types_1.getTypeRegistry();
        typeRegistry.register({
            BlogId,
            PostId,
            CommentId,
            ReactionId,
            Change,
            Blog,
            BlogUpdate,
            BlogHistoryRecord,
            Post,
            PostUpdate,
            PostHistoryRecord,
            Comment,
            CommentUpdate,
            CommentHistoryRecord,
            ReactionKind,
            Reaction,
            SocialAccount,
            ScoringAction,
            Profile,
            ProfileUpdate,
            ProfileHistoryRecord
        });
    }
    catch (err) {
        console.error('Failed to register custom types of blogs module', err);
    }
}
exports.registerBlogsTypes = registerBlogsTypes;
