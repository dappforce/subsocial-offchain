import { Option, Enum } from '@polkadot/types/codec';
import { getTypeRegistry, BlockNumber, Moment, AccountId, u16, u32, u64, Text, Vector, Struct } from '@polkadot/types';

export class IpfsHash extends Text {}
export class BlogId extends u64 {}
export class OptionIpfsHash extends Option.with(IpfsHash) {}
export class PostId extends u64 {}
export class CommentId extends u64 {}
export class ReactionId extends u64 {}

export type ChangeType = {
  account: AccountId,
  block: BlockNumber,
  time: Moment
};
export class Change extends Struct {
  constructor (value?: ChangeType) {
    super({
      account: AccountId,
      block: BlockNumber,
      time: Moment
    }, value);
  }

  get account (): AccountId {
    return this.get('account') as AccountId;
  }

  get block (): BlockNumber {
    return this.get('block') as BlockNumber;
  }

  get time (): Moment {
    return this.get('time') as Moment;
  }
}

export class VecAccountId extends Vector.with(AccountId) {}

export class OptionText extends Option.with(Text) {}
export class OptionChange extends Option.with(Change) {}
export class OptionBlogId extends Option.with(BlogId) {}
export class OptionCommentId extends Option.with(CommentId) {}
export class OptionVecAccountId extends Option.with(VecAccountId) {}

export type BlogData = {
  name: string,
  desc: string,
  image: string,
  tags: string[]
};

export type BlogType = {
  id: BlogId,
  created: ChangeType,
  updated: OptionChange,
  writers: AccountId[],
  slug: Text,
  ipfs_hash: IpfsHash,
  posts_count: u16,
  followers_count: u32,
  edit_history: VecBlogHistoryRecord
};

export class Blog extends Struct {
  constructor (value?: BlogType) {
    super({
      id: BlogId,
      created: Change,
      updated: OptionChange,
      writers: VecAccountId,
      slug: Text,
      ipfs_hash: IpfsHash,
      posts_count: u16,
      followers_count: u32,
      edit_history: VecBlogHistoryRecord
    }, value);
  }

  get id (): BlogId {
    return this.get('id') as BlogId;
  }

  get created (): Change {
    return this.get('created') as Change;
  }

  get updated (): OptionChange {
    return this.get('updated') as OptionChange;
  }

  get writers (): VecAccountId {
    return this.get('writers') as VecAccountId;
  }

  get slug (): Text {
    return this.get('slug') as Text;
  }

  get ipfs_hash (): string {
    const ipfsHash = this.get('ipfs_hash') as Text;
    return ipfsHash.toString();
  }

  // get ipfs_hash (): BlogData {
  //   const IpfsHash = this.get('ipfs_hash') as Text;
  //   return JSON.parse(IpfsHash.toString());
  // }

  get posts_count (): u16 {
    return this.get('posts_count') as u16;
  }

  get followers_count (): u32 {
    return this.get('followers_count') as u32;
  }

  get edit_history (): VecBlogHistoryRecord {
    return this.get('edit_history') as VecBlogHistoryRecord;
  }
}

export type BlogUpdateType = {
  writers: OptionVecAccountId,
  slug: OptionText,
  ipfs_hash: OptionIpfsHash
};

export class BlogUpdate extends Struct {
  constructor (value?: BlogUpdateType) {
    super({
      writers: OptionVecAccountId,
      slug: OptionText,
      ipfs_hash: OptionIpfsHash
    }, value);
  }
  get writers (): OptionVecAccountId {
    return this.get('writers') as OptionVecAccountId;
  }

  get slug (): OptionText {
    return this.get('slug') as OptionIpfsHash;
  }

  get ipfs_hash (): OptionIpfsHash {
    return this.get('ipfs_hash') as OptionIpfsHash;
  }

  set ipfs_hash (value: OptionIpfsHash) {
    this.set('ipfs_hash', value);
  }

  set slug (value: OptionText) {
    this.set('slug', value);
  }
}

export type PostData = {
  title: string,
  body: string,
  image: string,
  tags: string[]
};

export type PostType = {
  id: PostId,
  blog_id: BlogId,
  created: ChangeType,
  updated: OptionChange,
  slug: Text,
  ipfs_hash: IpfsHash,
  comments_count: u16,
  upvotes_count: u16,
  downvotes_count: u16,
  edit_history: VecPostHistoryRecord
};

export class Post extends Struct {
  constructor (value?: PostType) {
    super({
      id: PostId,
      blog_id: BlogId,
      created: Change,
      updated: OptionChange,
      slug: Text,
      ipfs_hash: IpfsHash,
      comments_count: u16,
      upvotes_count: u16,
      downvotes_count: u16,
      edit_history: VecPostHistoryRecord
    }, value);
  }

  get id (): PostId {
    return this.get('id') as PostId;
  }

  get blog_id (): BlogId {
    return this.get('blog_id') as BlogId;
  }

  get created (): Change {
    return this.get('created') as Change;
  }

  get updated (): OptionChange {
    return this.get('updated') as OptionChange;
  }

  get slug (): Text {
    return this.get('slug') as Text;
  }

  get ipfs_hash (): string {
    const ipfsHash = this.get('ipfs_hash') as Text;
    return ipfsHash.toString();
  }

  get comments_count (): u16 {
    return this.get('comments_count') as u16;
  }

  get upvotes_count (): u16 {
    return this.get('upvotes_count') as u16;
  }

  get downvotes_count (): u16 {
    return this.get('downvotes_count') as u16;
  }

  get edit_history (): VecPostHistoryRecord {
    return this.get('edit_history') as VecPostHistoryRecord;
  }
}

export type PostUpdateType = {
  blog_id: OptionBlogId,
  slug: OptionText,
  ipfs_hash: OptionIpfsHash
};

export class PostUpdate extends Struct {
  constructor (value?: PostUpdateType) {
    super({
      blog_id: OptionBlogId,
      slug: OptionText,
      ipfs_hash: OptionIpfsHash
    }, value);
  }

  get ipfs_hash (): OptionIpfsHash {
    return this.get('ipfs_hash') as OptionIpfsHash;
  }

  get slug (): OptionIpfsHash {
    return this.get('slug') as OptionIpfsHash;
  }

  set ipfs_hash (value: OptionIpfsHash) {
    this.set('ipfs_hash', value);
  }

  set slug (value: OptionText) {
    this.set('slug', value);
  }
}

export type CommentData = {
  body: string
};

export type CommentType = {
  id: CommentId,
  parent_id: OptionCommentId,
  post_id: PostId,
  created: Change,
  updated: OptionChange,
  ipfs_hash: IpfsHash,
  upvotes_count: u16,
  downvotes_count: u16,
  edit_history: VecCommentHistoryRecord
};

export class Comment extends Struct {
  constructor (value?: CommentType) {
    super({
      id: CommentId,
      parent_id: OptionCommentId,
      post_id: PostId,
      created: Change,
      updated: OptionChange,
      ipfs_hash: IpfsHash,
      upvotes_count: u16,
      downvotes_count: u16,
      edit_history: VecCommentHistoryRecord
    }, value);
  }

  get id (): CommentId {
    return this.get('id') as CommentId;
  }

  get parent_id (): OptionCommentId {
    return this.get('parent_id') as OptionCommentId;
  }

  get post_id (): PostId {
    return this.get('post_id') as PostId;
  }

  get created (): Change {
    return this.get('created') as Change;
  }

  get updated (): OptionChange {
    return this.get('updated') as OptionChange;
  }

  get ipfs_hash (): string {
    const ipfsHash = this.get('ipfs_hash') as Text;
    return ipfsHash.toString();
  }

  get upvotes_count (): u16 {
    return this.get('upvotes_count') as u16;
  }

  get downvotes_count (): u16 {
    return this.get('downvotes_count') as u16;
  }

  get edit_history (): VecCommentHistoryRecord {
    return this.get('edit_history') as VecCommentHistoryRecord;
  }
}

export type CommentUpdateType = {
  ipfs_hash: IpfsHash
};

export class CommentUpdate extends Struct {
  constructor (value?: CommentUpdateType) {
    super({
      ipfs_hash: IpfsHash
    }, value);
  }

  get ipfs_hash (): IpfsHash {
    return this.get('ipfs_hash') as IpfsHash;
  }

}

export class OptionComment extends Option.with(Comment) {}

export const ReactionKinds: { [key: string ]: string } = {
  Upvote: 'Upvote',
  Downvote: 'Downvote'
};

export class ReactionKind extends Enum {
  constructor (value?: any) {
    super([
      'Upvote',
      'Downvote'
    ], value);
  }
}

export type ReactionType = {
  id: ReactionId,
  created: Change,
  updated: OptionChange,
  kind: ReactionKind
};

export class Reaction extends Struct {
  constructor (value?: ReactionType) {
    super({
      id: ReactionId,
      created: Change,
      updated: OptionChange,
      kind: ReactionKind
    }, value);
  }

  get id (): ReactionId {
    return this.get('id') as ReactionId;
  }

  get created (): Change {
    return this.get('created') as Change;
  }

  get updated (): OptionChange {
    return this.get('updated') as OptionChange;
  }

  get kind (): ReactionKind {
    return this.get('kind') as ReactionKind;
  }
}

export type SocialAccountType = {
  followers_count: u32,
  following_accounts_count: u16,
  following_blogs_count: u16
};

export class SocialAccount extends Struct {
  constructor (value?: SocialAccountType) {
    super({
      followers_count: u32,
      following_accounts_count: u16,
      following_blogs_count: u16
    }, value);
  }

  get followers_count (): u32 {
    return this.get('followers_count') as u32;
  }

  get following_accounts_count (): u16 {
    return this.get('following_accounts_count') as u16;
  }

  get following_blogs_count (): u16 {
    return this.get('following_blogs_count') as u16;
  }
}

export type BlogHistoryRecordType = {
  edited: ChangeType,
  old_data: BlogUpdateType
};

export class BlogHistoryRecord extends Struct {
  constructor (value?: BlogHistoryRecordType) {
    super({
      edited: Change,
      old_data: BlogUpdate
    }, value);
  }

  get edited (): Change {
    return this.get('edited') as Change;
  }

  get old_data (): BlogUpdate {
    return this.get('old_data') as BlogUpdate;
  }
}

export class VecBlogHistoryRecord extends Vector.with(BlogHistoryRecord) {}

export type PostHistoryRecordType = {
  edited: ChangeType,
  old_data: PostUpdateType
};

export class PostHistoryRecord extends Struct {
  constructor (value?: PostHistoryRecordType) {
    super({
      edited: Change,
      old_data: PostUpdate
    }, value);
  }

  get edited (): Change {
    return this.get('edited') as Change;
  }

  get old_data (): PostUpdate {
    return this.get('old_data') as PostUpdate;
  }
}

export class VecPostHistoryRecord extends Vector.with(PostHistoryRecord) {}

export type CommentHistoryRecordType = {
  edited: ChangeType,
  old_data: CommentUpdateType
};

export class CommentHistoryRecord extends Struct {
  constructor (value?: CommentHistoryRecordType) {
    super({
      edited: Change,
      old_data: CommentUpdate
    }, value);
  }

  get edited (): Change {
    return this.get('edited') as Change;
  }

  get old_data (): CommentUpdate {
    return this.get('old_data') as CommentUpdate;
  }
}

export class VecCommentHistoryRecord extends Vector.with(CommentHistoryRecord) {}

export function registerBlogsTypes () {
  try {
    const typeRegistry = getTypeRegistry();
    typeRegistry.register({
      BlogId,
      PostId,
      CommentId,
      ReactionId,
      Change,
      Blog,
      BlogUpdate,
      Post,
      PostUpdate,
      Comment,
      CommentUpdate,
      ReactionKind,
      Reaction,
      SocialAccount,
      BlogHistoryRecord,
      PostHistoryRecord,
      CommentHistoryRecord
    });
  } catch (err) {
    console.error('Failed to register custom types of blogs module', err);
  }
}
