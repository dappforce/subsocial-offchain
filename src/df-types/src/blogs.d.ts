import { Option, Struct, Enum, EnumType } from '@polkadot/types/codec';
import { BlockNumber, Moment, AccountId, u16, u32, u64, Text, Vector, i32, Null } from '@polkadot/types';
export declare type IpfsData = CommentData | PostData | BlogData | ProfileData | SharedPostData | PostBlock | BlockValue;
export declare type Activity = {
    id: number;
    account: string;
    event: string;
    following_id: string;
    blog_id: string;
    post_id: string;
    comment_id: string;
    date: Date;
    agg_count: number;
};
export declare class BlogId extends u64 {
}
export declare class PostId extends u64 {
}
export declare class CommentId extends u64 {
}
export declare class ReactionId extends u64 {
}
export declare class IpfsHash extends Text {
}
declare const OptionIpfsHash_base: import("@polkadot/types/types").Constructor<Option<import("@polkadot/types/types").Codec>>;
export declare class OptionIpfsHash extends OptionIpfsHash_base {
}
export declare class RegularPost extends Null {
}
export declare class SharedPost extends PostId {
}
export declare class SharedComment extends CommentId {
}
export declare type PostExtensionEnum = RegularPost | SharedPost | SharedComment;
declare type PostExtensionEnumValue = {
    RegularPost: RegularPost;
} | {
    SharedPost: SharedPost;
} | {
    SharedComment: SharedComment;
};
export declare class PostExtension extends EnumType<PostExtensionEnumValue> {
    constructor(value?: PostExtensionEnumValue, index?: number);
}
export declare type ChangeType = {
    account: AccountId;
    block: BlockNumber;
    time: Moment;
};
export declare class Change extends Struct {
    constructor(value?: ChangeType);
    readonly account: AccountId;
    readonly block: BlockNumber;
    readonly time: string;
}
declare const VecAccountId_base: import("@polkadot/types/types").Constructor<Vector<AccountId>>;
export declare class VecAccountId extends VecAccountId_base {
}
declare const OptionText_base: import("@polkadot/types/types").Constructor<Option<import("@polkadot/types/types").Codec>>;
export declare class OptionText extends OptionText_base {
}
declare const OptionChange_base: import("@polkadot/types/types").Constructor<Option<import("@polkadot/types/types").Codec>>;
export declare class OptionChange extends OptionChange_base {
}
declare const OptionBlogId_base: import("@polkadot/types/types").Constructor<Option<import("@polkadot/types/types").Codec>>;
export declare class OptionBlogId extends OptionBlogId_base {
}
declare const OptionCommentId_base: import("@polkadot/types/types").Constructor<Option<import("@polkadot/types/types").Codec>>;
export declare class OptionCommentId extends OptionCommentId_base {
}
declare const OptionVecAccountId_base: import("@polkadot/types/types").Constructor<Option<import("@polkadot/types/types").Codec>>;
export declare class OptionVecAccountId extends OptionVecAccountId_base {
}
export declare type BlogData = {
    name: string;
    desc: string;
    image: string;
    tags: string[];
};
export declare type BlogType = {
    id: BlogId;
    created: ChangeType;
    updated: OptionChange;
    writers: AccountId[];
    slug: Text;
    ipfs_hash: IpfsHash;
    posts_count: u16;
    followers_count: u32;
    edit_history: VecBlogHistoryRecord;
    score: i32;
};
export declare class Blog extends Struct {
    constructor(value?: BlogType);
    readonly id: BlogId;
    readonly created: Change;
    readonly updated: OptionChange;
    readonly writers: VecAccountId;
    readonly slug: Text;
    readonly ipfs_hash: string;
    readonly posts_count: u16;
    readonly followers_count: u32;
    readonly edit_history: VecBlogHistoryRecord;
    readonly score: i32;
}
export declare type BlogUpdateType = {
    writers: OptionVecAccountId;
    slug: OptionText;
    ipfs_hash: OptionIpfsHash;
};
export declare class BlogUpdate extends Struct {
    constructor(value?: BlogUpdateType);
    readonly writers: OptionVecAccountId;
    slug: OptionText;
    ipfs_hash: OptionIpfsHash;
}
// ------------------------------------------
// Post blocks
export type BlockValue = {
  id: number
  kind: PostBlockKind
  hidden?: boolean
  data: string
}

type PostBlockKind = 'text' | 'code' | 'link' | 'video' | 'image' | 'twitter'

export interface PostBlock {
  kind: PostBlockKind
  hidden?: boolean

  /** CID aka IPFS hash */
  cid: string
}

export declare type SharedPostData = {
    blocks: PostBlock[];
};
export declare type PostData = SharedPostData & {
    title: string;
    image: string;
    tags: string[];
};
export declare type PostType = {
    id: PostId;
    blog_id: BlogId;
    created: ChangeType;
    updated: OptionChange;
    extension: PostExtension;
    ipfs_hash: IpfsHash;
    comments_count: u16;
    upvotes_count: u16;
    downvotes_count: u16;
    shares_count: u16;
    edit_history: VecPostHistoryRecord;
    score: i32;
};
export declare class Post extends Struct {
    constructor(value?: PostType);
    readonly id: PostId;
    readonly blog_id: BlogId;
    readonly created: Change;
    readonly updated: OptionChange;
    readonly extension: PostExtension;
    readonly ipfs_hash: string;
    readonly comments_count: u16;
    readonly upvotes_count: u16;
    readonly downvotes_count: u16;
    readonly shares_count: u16;
    readonly edit_history: VecPostHistoryRecord;
    readonly score: i32;
    readonly isRegularPost: boolean;
    readonly isSharedPost: boolean;
    readonly isSharedComment: boolean;
}
export declare type PostUpdateType = {
    blog_id: OptionBlogId;
    ipfs_hash: OptionIpfsHash;
};
export declare class PostUpdate extends Struct {
    constructor(value?: PostUpdateType);
    ipfs_hash: OptionIpfsHash;
    slug: OptionText;
}
export declare type CommentData = {
    body: string;
};
export declare type CommentType = {
    id: CommentId;
    parent_id: OptionCommentId;
    post_id: PostId;
    created: Change;
    updated: OptionChange;
    ipfs_hash: IpfsHash;
    upvotes_count: u16;
    downvotes_count: u16;
    shares_count: u16;
    direct_replies_count: u16;
    edit_history: VecCommentHistoryRecord;
    score: i32;
};
export declare class Comment extends Struct {
    constructor(value?: CommentType);
    readonly id: CommentId;
    readonly parent_id: OptionCommentId;
    readonly post_id: PostId;
    readonly created: Change;
    readonly updated: OptionChange;
    readonly ipfs_hash: string;
    readonly upvotes_count: u16;
    readonly downvotes_count: u16;
    readonly shares_count: u16;
    readonly direct_replies_count: u16;
    readonly edit_history: VecCommentHistoryRecord;
    readonly score: i32;
}
export declare type CommentUpdateType = {
    ipfs_hash: IpfsHash;
};
export declare class CommentUpdate extends Struct {
    constructor(value?: CommentUpdateType);
    readonly ipfs_hash: IpfsHash;
}
declare const OptionComment_base: import("@polkadot/types/types").Constructor<Option<import("@polkadot/types/types").Codec>>;
export declare class OptionComment extends OptionComment_base {
}
export declare const ReactionKinds: {
    [key: string]: string;
};
export declare class ReactionKind extends Enum {
    constructor(value?: any);
}
export declare type ReactionType = {
    id: ReactionId;
    created: Change;
    updated: OptionChange;
    kind: ReactionKind;
};
export declare class Reaction extends Struct {
    constructor(value?: ReactionType);
    readonly id: ReactionId;
    readonly created: Change;
    readonly updated: OptionChange;
    readonly kind: ReactionKind;
}
export declare type SocialAccountType = {
    followers_count: u32;
    following_accounts_count: u16;
    following_blogs_count: u16;
    reputation: u32;
    profile: OptionProfile;
};
export declare class SocialAccount extends Struct {
    constructor(value?: SocialAccountType);
    readonly followers_count: u32;
    readonly following_accounts_count: u16;
    readonly following_blogs_count: u16;
    readonly reputation: u32;
    readonly profile: OptionProfile;
}
export declare type ProfileData = {
    fullname: string;
    avatar: string;
    about: string;
    facebook: string;
    twitter: string;
    linkedIn: string;
    github: string;
    instagram: string;
};
export declare type ProfileType = {
    created: ChangeType;
    updated: OptionChange;
    username: Text;
    ipfs_hash: IpfsHash;
    edit_history: VecProfileHistoryRecord;
};
export declare class Profile extends Struct {
    constructor(value?: ProfileType);
    readonly created: Change;
    readonly updated: OptionChange;
    readonly username: Text;
    readonly ipfs_hash: string;
    readonly edit_history: VecProfileHistoryRecord;
}
declare const OptionProfile_base: import("@polkadot/types/types").Constructor<Option<import("@polkadot/types/types").Codec>>;
export declare class OptionProfile extends OptionProfile_base {
}
export declare type ProfileUpdateType = {
    username: OptionText;
    ipfs_hash: OptionIpfsHash;
};
export declare class ProfileUpdate extends Struct {
    constructor(value?: ProfileUpdateType);
    ipfs_hash: OptionIpfsHash;
    username: OptionIpfsHash;
}
export declare type BlogHistoryRecordType = {
    edited: ChangeType;
    old_data: BlogUpdateType;
};
export declare class BlogHistoryRecord extends Struct {
    constructor(value?: BlogHistoryRecordType);
    readonly edited: Change;
    readonly old_data: BlogUpdate;
}
declare const VecBlogHistoryRecord_base: import("@polkadot/types/types").Constructor<Vector<BlogHistoryRecord>>;
export declare class VecBlogHistoryRecord extends VecBlogHistoryRecord_base {
}
export declare type PostHistoryRecordType = {
    edited: ChangeType;
    old_data: PostUpdateType;
};
export declare class PostHistoryRecord extends Struct {
    constructor(value?: PostHistoryRecordType);
    readonly edited: Change;
    readonly old_data: PostUpdate;
}
declare const VecPostHistoryRecord_base: import("@polkadot/types/types").Constructor<Vector<PostHistoryRecord>>;
export declare class VecPostHistoryRecord extends VecPostHistoryRecord_base {
}
export declare type CommentHistoryRecordType = {
    edited: ChangeType;
    old_data: CommentUpdateType;
};
export declare class CommentHistoryRecord extends Struct {
    constructor(value?: CommentHistoryRecordType);
    readonly edited: Change;
    readonly old_data: CommentUpdate;
}
declare const VecCommentHistoryRecord_base: import("@polkadot/types/types").Constructor<Vector<CommentHistoryRecord>>;
export declare class VecCommentHistoryRecord extends VecCommentHistoryRecord_base {
}
export declare type ProfileHistoryRecordType = {
    edited: ChangeType;
    old_data: ProfileUpdateType;
};
export declare class ProfileHistoryRecord extends Struct {
    constructor(value?: ProfileHistoryRecordType);
    readonly edited: Change;
    readonly old_data: ProfileUpdate;
}
declare const VecProfileHistoryRecord_base: import("@polkadot/types/types").Constructor<Vector<ProfileHistoryRecord>>;
export declare class VecProfileHistoryRecord extends VecProfileHistoryRecord_base {
}
export declare const ScoringActions: {
    [key: string]: string;
};
export declare class ScoringAction extends Enum {
    constructor(value?: any);
}
export declare function registerBlogsTypes(): void;
export {};
