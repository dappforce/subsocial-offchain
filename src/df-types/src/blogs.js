"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.registerBlogsTypes = registerBlogsTypes;
exports.ScoringAction = exports.ScoringActions = exports.VecProfileHistoryRecord = exports.ProfileHistoryRecord = exports.VecCommentHistoryRecord = exports.CommentHistoryRecord = exports.VecPostHistoryRecord = exports.PostHistoryRecord = exports.VecBlogHistoryRecord = exports.BlogHistoryRecord = exports.ProfileUpdate = exports.OptionProfile = exports.Profile = exports.SocialAccount = exports.Reaction = exports.ReactionKind = exports.ReactionKinds = exports.OptionComment = exports.CommentUpdate = exports.Comment = exports.PostUpdate = exports.Post = exports.BlogUpdate = exports.Blog = exports.OptionVecAccountId = exports.OptionCommentId = exports.OptionBlogId = exports.OptionChange = exports.OptionText = exports.VecAccountId = exports.Change = exports.PostExtension = exports.SharedComment = exports.SharedPost = exports.RegularPost = exports.OptionIpfsHash = exports.IpfsHash = exports.ReactionId = exports.CommentId = exports.PostId = exports.BlogId = void 0;

var _codec = require("@polkadot/types/codec");

var _types = require("@polkadot/types");

var _momentTimezone = _interopRequireDefault(require("moment-timezone"));

class BlogId extends _types.u64 {}

exports.BlogId = BlogId;

class PostId extends _types.u64 {}

exports.PostId = PostId;

class CommentId extends _types.u64 {}

exports.CommentId = CommentId;

class ReactionId extends _types.u64 {}

exports.ReactionId = ReactionId;

class IpfsHash extends _types.Text {}

exports.IpfsHash = IpfsHash;

class OptionIpfsHash extends _codec.Option.with(IpfsHash) {}

exports.OptionIpfsHash = OptionIpfsHash;

class RegularPost extends _types.Null {}

exports.RegularPost = RegularPost;

class SharedPost extends PostId {}

exports.SharedPost = SharedPost;

class SharedComment extends CommentId {}

exports.SharedComment = SharedComment;

class PostExtension extends _codec.EnumType {
  constructor(value, index) {
    super({
      RegularPost,
      SharedPost,
      SharedComment
    }, value, index);
  }

}

exports.PostExtension = PostExtension;

class Change extends _codec.Struct {
  constructor(value) {
    super({
      account: _types.AccountId,
      block: _types.BlockNumber,
      time: _types.Moment
    }, value);
  }

  get account() {
    return this.get('account');
  }

  get block() {
    return this.get('block');
  }

  get time() {
    const time = this.get('time');
    return (0, _momentTimezone.default)(time).format('lll');
  }

}

exports.Change = Change;

class VecAccountId extends _types.Vector.with(_types.AccountId) {}

exports.VecAccountId = VecAccountId;

class OptionText extends _codec.Option.with(_types.Text) {}

exports.OptionText = OptionText;

class OptionChange extends _codec.Option.with(Change) {}

exports.OptionChange = OptionChange;

class OptionBlogId extends _codec.Option.with(BlogId) {}

exports.OptionBlogId = OptionBlogId;

class OptionCommentId extends _codec.Option.with(CommentId) {}

exports.OptionCommentId = OptionCommentId;

class OptionVecAccountId extends _codec.Option.with(VecAccountId) {}

exports.OptionVecAccountId = OptionVecAccountId;

class Blog extends _codec.Struct {
  constructor(value) {
    super({
      id: BlogId,
      created: Change,
      updated: OptionChange,
      writers: VecAccountId,
      slug: _types.Text,
      ipfs_hash: IpfsHash,
      posts_count: _types.u16,
      followers_count: _types.u32,
      edit_history: VecBlogHistoryRecord,
      score: _types.i32
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
  } // get ipfs_hash (): BlogData {
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

class BlogUpdate extends _codec.Struct {
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

class Post extends _codec.Struct {
  constructor(value) {
    super({
      id: PostId,
      blog_id: BlogId,
      created: Change,
      updated: OptionChange,
      extension: PostExtension,
      ipfs_hash: IpfsHash,
      comments_count: _types.u16,
      upvotes_count: _types.u16,
      downvotes_count: _types.u16,
      shares_count: _types.u16,
      edit_history: VecPostHistoryRecord,
      score: _types.i32
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

  get extension() {
    return this.get('extension');
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

  get isRegularPost() {
    return this.extension.value instanceof RegularPost;
  }

  get isSharedPost() {
    return this.extension.value instanceof SharedPost;
  }

  get isSharedComment() {
    return this.extension.value instanceof SharedComment;
  }

}

exports.Post = Post;

class PostUpdate extends _codec.Struct {
  constructor(value) {
    super({
      blog_id: OptionBlogId,
      ipfs_hash: OptionIpfsHash
    }, value);
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

exports.PostUpdate = PostUpdate;

class Comment extends _codec.Struct {
  constructor(value) {
    super({
      id: CommentId,
      parent_id: OptionCommentId,
      post_id: PostId,
      created: Change,
      updated: OptionChange,
      ipfs_hash: IpfsHash,
      upvotes_count: _types.u16,
      downvotes_count: _types.u16,
      shares_count: _types.u16,
      direct_replies_count: _types.u16,
      edit_history: VecCommentHistoryRecord,
      score: _types.i32
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

class CommentUpdate extends _codec.Struct {
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

class OptionComment extends _codec.Option.with(Comment) {}

exports.OptionComment = OptionComment;
const ReactionKinds = {
  Upvote: 'Upvote',
  Downvote: 'Downvote'
};
exports.ReactionKinds = ReactionKinds;

class ReactionKind extends _codec.Enum {
  constructor(value) {
    super(['Upvote', 'Downvote'], value);
  }

}

exports.ReactionKind = ReactionKind;

class Reaction extends _codec.Struct {
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

class SocialAccount extends _codec.Struct {
  constructor(value) {
    super({
      followers_count: _types.u32,
      following_accounts_count: _types.u16,
      following_blogs_count: _types.u16,
      reputation: _types.u32,
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

class Profile extends _codec.Struct {
  constructor(value) {
    super({
      created: Change,
      updated: OptionChange,
      username: _types.Text,
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

class OptionProfile extends _codec.Option.with(Profile) {}

exports.OptionProfile = OptionProfile;

class ProfileUpdate extends _codec.Struct {
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

class BlogHistoryRecord extends _codec.Struct {
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

class VecBlogHistoryRecord extends _types.Vector.with(BlogHistoryRecord) {}

exports.VecBlogHistoryRecord = VecBlogHistoryRecord;

class PostHistoryRecord extends _codec.Struct {
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

class VecPostHistoryRecord extends _types.Vector.with(PostHistoryRecord) {}

exports.VecPostHistoryRecord = VecPostHistoryRecord;

class CommentHistoryRecord extends _codec.Struct {
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

class VecCommentHistoryRecord extends _types.Vector.with(CommentHistoryRecord) {}

exports.VecCommentHistoryRecord = VecCommentHistoryRecord;

class ProfileHistoryRecord extends _codec.Struct {
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

class VecProfileHistoryRecord extends _types.Vector.with(ProfileHistoryRecord) {}

exports.VecProfileHistoryRecord = VecProfileHistoryRecord;
const ScoringActions = {
  UpvotePost: 'UpvotePost',
  DownvotePost: 'DownvotePost',
  SharePost: 'SharePost',
  UpvoteComment: 'UpvoteComment',
  DownvoteComment: 'DownvoteComment',
  ShareComment: 'ShareComment',
  FollowBlog: 'FollowBlog',
  FollowAccount: 'FollowAccount'
};
exports.ScoringActions = ScoringActions;

class ScoringAction extends _codec.Enum {
  constructor(value) {
    super(['UpvotePost', 'DownvotePost', 'SharePost', 'UpvoteComment', 'DownvoteComment', 'ShareComment', 'FollowBlog', 'FollowAccount'], value);
  }

}

exports.ScoringAction = ScoringAction;

function registerBlogsTypes() {
  try {
    const typeRegistry = (0, _types.getTypeRegistry)();
    typeRegistry.register({
      BlogId,
      PostId,
      CommentId,
      ReactionId,
      Change,
      Blog,
      BlogUpdate,
      BlogHistoryRecord,
      PostExtension,
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
  } catch (err) {
    console.error('Failed to register custom types of blogs module', err);
  }
}