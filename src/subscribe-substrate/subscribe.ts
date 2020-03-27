import { Option } from '@polkadot/types'
import { EventData } from '@polkadot/types/generic/Event';
import BN from 'bn.js';
import { insertElasticSearch } from './lib/utils';
import { ES_INDEX_BLOGS, ES_INDEX_POSTS, ES_INDEX_COMMENTS, ES_INDEX_PROFILES } from '../search/indexes';
import { SocialAccount, BlogId, PostId, CommentId } from '@subsocial/types/substrate/interfaces/subsocial';
import { AccountId } from '@subsocial/types/substrate/interfaces/runtime';
import { substrate } from './server';
import { insertAccountFollower, insertBlogFollower, insertPostFollower, insertCommentFollower } from './lib/postgres/insert-follower';
import { insertActivityForAccount, insertNotificationForOwner, insertActivityForBlog, insertActivityForPost, insertActivityComments, insertActivityForComment, insertActivityForPostReaction, insertActivityForCommentReaction } from './lib/postgres/insert-activity';
import { deleteNotificationsAboutAccount, deleteNotificationsAboutBlog, deleteNotificationsAboutPost, deleteNotificationsAboutComment } from './lib/postgres/delete-activity';
import { deleteAccountFollower, deleteBlogFollower, deletePostFollower, deleteCommentFollower } from './lib/postgres/delete-follower';
import { fillNotificationsWithAccountFollowers, fillActivityStreamWithBlogFollowers, fillNewsFeedWithAccountFollowers, fillActivityStreamWithPostFollowers, fillActivityStreamWithCommentFollowers } from './lib/postgres/fill-activity';

type EventAction = {
  eventName: string,
  data: EventData,
  blockHeight: BN
}

export const DispatchForDb = async (eventAction: EventAction) => {
  const { data } = eventAction;
  switch (eventAction.eventName) {
    case 'AccountFollowed': {
      await insertAccountFollower(data);
      const socialAccountOpt = await substrate.socialQuery().socialAccountById(data[1]) as Option<SocialAccount>;
      if (!socialAccountOpt || socialAccountOpt.isNone) return;
      const count = socialAccountOpt.unwrap().followers_count.toNumber() - 1;
      const id = await insertActivityForAccount(eventAction, count);
      if (id === -1) return;

      const following = data[1].toString();
      await insertNotificationForOwner(id, following);
      break;
    }
    case 'AccountUnfollowed': {
      const follower = data[0].toString();
      const following = data[1].toString();
      await deleteNotificationsAboutAccount(follower, following);
      await deleteAccountFollower(data);
      break;
    }
    case 'BlogCreated': {
      const account = data[0].toString();
      const activityId = await insertActivityForBlog(eventAction, 0);
      await fillNotificationsWithAccountFollowers(account, activityId);

      const blogId = data[1] as BlogId;
      const blog = await substrate.findBlog(blogId);
      if (!blog) return;

      insertElasticSearch(ES_INDEX_BLOGS, blog.ipfs_hash.toString(), blogId);
      break;
    }
    case 'BlogUpdated': {
      const blogId = data[1] as BlogId;
      const blog = await substrate.findBlog(blogId);
      if (!blog) return;

      insertElasticSearch(ES_INDEX_BLOGS, blog.ipfs_hash.toString(), blogId);
      break;
    }
    case 'BlogFollowed': {
      await insertBlogFollower(data);
      const blogId = data[1] as BlogId;
      const blog = await substrate.findBlog(blogId);
      if (!blog) return;

      const count = blog.followers_count.toNumber() - 1;
      const account = blog.created.account.toString();
      const id = await insertActivityForBlog(eventAction, count, account);
      if (id === -1) return;

      const follower = data[0].toString();
      if (follower === account) return;

      insertNotificationForOwner(id, account);
      break;
    }
    case 'BlogUnfollowed': {
      const follower = data[0].toString();
      const following = data[1] as BlogId;
      await deleteNotificationsAboutBlog(follower, following)
      await deleteBlogFollower(data);
      break;
    }
    case 'PostCreated': {
      insertPostFollower(data);
      const postId = data[1] as PostId;
      const follower = data[0].toString();

      const post = await substrate.findPost(postId);
      if (!post) return;

      const ids = [ post.blog_id, postId ];
      const activityId = await insertActivityForPost(eventAction, ids, 0);
      if (activityId === -1) return;

      await fillActivityStreamWithBlogFollowers(post.blog_id, follower, activityId);
      await fillNewsFeedWithAccountFollowers(follower, activityId);
      insertElasticSearch(ES_INDEX_POSTS, post.ipfs_hash.toString(), postId);
      break;
    }
    case 'PostUpdated': {
      const postId = data[1] as PostId;
      const post = await substrate.findPost(postId);
      if (!post) return;

      insertElasticSearch(ES_INDEX_POSTS, post.ipfs_hash.toString(), postId);
      break;
    }
    case 'PostShared': {
      const postId = data[1] as PostId;
      const follower = data[0].toString();

      const post = await substrate.findPost(postId);
      if (!post) return;

      const ids = [ post.blog_id, postId ];
      const activityId = await insertActivityForPost(eventAction, ids);
      if (activityId === -1) return;

      const account = post.created.account.toString();
      insertNotificationForOwner(activityId, account);
      fillNotificationsWithAccountFollowers(follower, activityId);
      fillActivityStreamWithBlogFollowers(post.blog_id, follower, activityId);
      fillNewsFeedWithAccountFollowers(follower, activityId)
      break;
    }
    case 'PostDeleted': {
      const follower = data[0].toString();
      const following = data[1] as PostId;
      await deleteNotificationsAboutPost(follower, following);
      await deletePostFollower(data);
      break;
    }
    case 'CommentCreated': {
      await insertCommentFollower(data);
      const commentId = data[1] as CommentId;
      const comment = await substrate.findComment(commentId);
      if (!comment) return;

      const postId = comment.post_id;
      const post = await substrate.findPost(postId);
      if (!post) return;

      const postCreator = post.created.account.toString();
      const commentCreator = comment.created.account.toString();
      const ids = [ postId, commentId ];
      if (comment.parent_id.isSome) {
        console.log('PARENT ID');
        insertActivityComments(eventAction, ids, comment);
      } else {
        const activityId = await insertActivityForComment(eventAction, ids, postCreator);
        if (activityId === -1) return;

        console.log('PARENT ID NULL');
        await fillActivityStreamWithPostFollowers(postId, commentCreator, activityId);
        await fillNotificationsWithAccountFollowers(commentCreator, activityId);
      }
      insertElasticSearch(ES_INDEX_COMMENTS, comment.ipfs_hash.toString(), commentId);
      break;
    }
    case 'CommentUpdated': {
      const commentId = data[1] as CommentId;
      const comment = await substrate.findComment(commentId);
      if (!comment) return;

      insertElasticSearch(ES_INDEX_COMMENTS, comment.ipfs_hash.toString(), commentId);
      break;
    }
    case 'CommentShared': {
      const commentId = data[1] as CommentId;
      const comment = await substrate.findComment(commentId);
      if (!comment) return;

      const postId = comment.post_id;
      const post = await substrate.findPost(postId);
      if (!post) return;

      const ids = [ post.blog_id, postId, commentId ];
      const account = comment.created.account.toString();
      const activityId = await insertActivityForComment(eventAction, ids, account);
      if (activityId === -1) return;

      fillActivityStreamWithCommentFollowers(commentId, account, activityId);
      fillNotificationsWithAccountFollowers(account, activityId);
      break;
    }
    case 'CommentDeleted': {
      const follower = data[0].toString();
      const following = data[1] as CommentId;
      await deleteNotificationsAboutComment(follower, following);
      await deleteCommentFollower(data);
      break;
    }
    case 'PostReactionCreated': {
      const follower = data[0].toString();
      const postId = data[1] as PostId;
      const post = await substrate.findPost(postId);
      if (!post) return;

      const ids = [ postId ];
      const count = post.upvotes_count.toNumber() + post.downvotes_count.toNumber() - 1;
      const account = post.created.account.toString();
      const activityId = await insertActivityForPostReaction(eventAction, count, ids, account);
      if (activityId === -1) return;

      if (follower === account) return;

      insertNotificationForOwner(activityId, account);
      break;
    }
    case 'CommentReactionCreated': {
      const follower = data[0].toString();
      const commentId = data[1] as CommentId;
      const comment = await substrate.findComment(commentId);
      if (!comment) return;

      const ids = [ comment.post_id, commentId ];
      const account = comment.created.account.toString();
      const count = (comment.upvotes_count.toNumber() + comment.downvotes_count.toNumber()) - 1;
      const activityId = await insertActivityForCommentReaction(eventAction, count, ids, account);
      if (activityId === -1) return;

      if (follower === account) return;

      // insertAggStream(eventAction, commentId);
      insertNotificationForOwner(activityId, account);
      break;
    }
    case 'ProfileCreated' : {
      const accountId = data[0] as AccountId;
      const SocialAccountOpt = await substrate.socialQuery().socialAccountById(accountId) as Option<SocialAccount>;
      if (SocialAccountOpt.isNone) return;

      const profileOpt = SocialAccountOpt.unwrap().profile;
      if (profileOpt.isNone) return;

      const profile = profileOpt.unwrap();
      insertElasticSearch(ES_INDEX_PROFILES, profile.ipfs_hash.toString(), accountId, { username: profile.username.toString() });
      break;
    }
    case 'ProfileUpdated' : {
      const accountId = data[0] as AccountId;
      const SocialAccountOpt = await substrate.socialQuery().socialAccountById(accountId) as Option<SocialAccount>;
      if (SocialAccountOpt.isNone) return;

      const profileOpt = SocialAccountOpt.unwrap().profile;
      if (profileOpt.isNone) return;

      const profile = profileOpt.unwrap();
      insertElasticSearch(ES_INDEX_PROFILES, profile.ipfs_hash.toString(), accountId, { username: profile.username.toString() });
      break;
    }
  }
}
