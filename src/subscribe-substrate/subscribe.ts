import { api } from './server';
import { BlogId, PostId, CommentId, Post, Comment, Blog, SocialAccount, BlogData, PostData, CommentData, ProfileData, Profile } from '../df-types/src/blogs';
import { Option, AccountId } from '@polkadot/types'
import { EventData } from '@polkadot/types/type/Event';
import BN from 'bn.js';
import { insertAccountFollower, insertActivityForAccount, insertNotificationForOwner, deleteAccountActivityWithActivityStream, deleteAccountFollower, insertActivityForBlog, fillNotificationsWithAccountFollowers, insertBlogFollower, deleteBlogActivityWithActivityStream, deleteBlogFollower, insertPostFollower, insertActivityForPost, fillActivityStreamWithBlogFollowers, fillNewsFeedWithAccountFollowers, deletePostActivityWithActivityStream, deletePostFollower, insertCommentFollower, insertActivityComments, insertActivityForComment, fillActivityStreamWithPostFollowers, fillActivityStreamWithCommentFollowers, deleteCommentActivityWithActivityStream, deleteCommentFollower, insertActivityForPostReaction, insertActivityForCommentReaction } from './lib/postgres';
import { insertElasticSearch } from './lib/utils';
import { ES_INDEX_BLOGS, ES_INDEX_POSTS, ES_INDEX_COMMENTS, ES_INDEX_PROFILES } from '../search/indexes';

type EventAction = {
  eventName: string,
  data: EventData,
  heightBlock: BN
}

export const DispatchForDb = async (eventAction: EventAction) => {
  const { data } = eventAction;
  switch(eventAction.eventName){
    case 'AccountFollowed': {
      await insertAccountFollower(data);
      const socialAccountOpt = await api.query.blogs.socialAccountById(data[1]) as Option<SocialAccount>;
      if (!socialAccountOpt && socialAccountOpt.isNone) return;
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
      await deleteAccountActivityWithActivityStream(follower, following);
      await deleteAccountFollower(data);
      break;
    }
    case 'BlogCreated': {
      const account = data[0].toString();
      const activityId = await insertActivityForBlog(eventAction, 0);
      await fillNotificationsWithAccountFollowers(account, activityId);

      const blogId = data[1] as BlogId;
      const blogOpt = await api.query.blogs.blogById(blogId) as Option<Blog>;
      if (blogOpt.isNone) return;

      const blog = blogOpt.unwrap();
      insertElasticSearch<BlogData>(ES_INDEX_BLOGS, blog.ipfs_hash, blogId);
      break;
    }
    case 'BlogUpdated': {
      const blogId = data[1] as BlogId;
      const blogOpt = await api.query.blogs.blogById(blogId) as Option<Blog>;
      if (blogOpt.isNone) return;

      const blog = blogOpt.unwrap();
      insertElasticSearch<BlogData>(ES_INDEX_BLOGS, blog.ipfs_hash, blogId);
      break;
    }
    case 'BlogFollowed': {
      await insertBlogFollower(data);
      const blogId = data[1] as BlogId;
      const blogOpt = await api.query.blogs.blogById(blogId) as Option<Blog>;
      if (blogOpt.isNone) return;

      const blog = blogOpt.unwrap();
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
      await deleteBlogActivityWithActivityStream(follower, following)
      await deleteBlogFollower(data);
      break;
    }
    case 'PostCreated': {
      insertPostFollower(data);
      const postId = data[1] as PostId;
      const follower = data[0].toString();

      const postOpt = await api.query.blogs.postById(postId) as Option<Post>;
      if (postOpt.isNone) return;

      console.log('here');

      const post = postOpt.unwrap();

      const ids = [post.blog_id, postId ];
      const activityId = await insertActivityForPost(eventAction, ids, 0);
      if (activityId === -1) return;

      console.log('here');

      await fillActivityStreamWithBlogFollowers(post.blog_id, follower, activityId);
      await fillNewsFeedWithAccountFollowers(follower, activityId);
      insertElasticSearch<PostData>(ES_INDEX_POSTS, post.ipfs_hash, postId);
      break;
    }
    case 'PostUpdated': {
      const postId = data[1] as PostId;
      const postOpt = await api.query.blogs.postById(postId) as Option<Post>;
      if (postOpt.isNone) return;

      const post = postOpt.unwrap();
      insertElasticSearch<PostData>(ES_INDEX_POSTS, post.ipfs_hash, postId);
      break;
    }
    case 'PostShared': {
      const postId = data[1] as PostId;
      const follower = data[0].toString();

      const postOpt = await api.query.blogs.postById(postId) as Option<Post>;
      if (postOpt.isNone) return;

      const post = postOpt.unwrap();

      const ids = [post.blog_id, postId ];
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
      await deletePostActivityWithActivityStream(follower, following);
      await deletePostFollower(data);
      break;
    }
    case 'CommentCreated': {
      await insertCommentFollower(data);
      const commentId = data[1] as CommentId;
      const commentOpt = await api.query.blogs.commentById(commentId) as unknown as Option<Comment>;
      if (commentOpt.isNone) return;

      const comment = commentOpt.unwrap();
      const postId = comment.post_id;
      const postOpt = await api.query.blogs.postById(postId) as Option<Post>;
      if (postOpt.isNone) return;

      const post = postOpt.unwrap();
      const postCreator = post.created.account.toString();
      const commentCreator = comment.created.account.toString();
      const ids = [postId, commentId];
      if (comment.parent_id.isSome) {
        console.log('PARENT ID');
        insertActivityComments(eventAction, ids,comment);
      } else {
        const activityId = await insertActivityForComment(eventAction, ids, postCreator);
        if (activityId === -1) return;
  
        console.log('PARENT ID NULL');
        await fillActivityStreamWithPostFollowers(postId, commentCreator, activityId);
        await fillNotificationsWithAccountFollowers(commentCreator, activityId);
      }
      insertElasticSearch<CommentData>(ES_INDEX_COMMENTS, comment.ipfs_hash, commentId);
      break;
    }
    case 'CommentUpdated': {
      const commentId = data[1] as CommentId;
      const commentOpt = await api.query.blogs.commentById(commentId) as unknown as Option<Comment>;
      if (commentOpt.isNone) return;

      const comment = commentOpt.unwrap();
      insertElasticSearch<CommentData>(ES_INDEX_COMMENTS, comment.ipfs_hash, commentId);
      break;
    }
    case 'CommentShared': {
      const commentId = data[1] as CommentId;
      const commentOpt = await api.query.blogs.commentById(commentId) as unknown as Option<Comment>;
      if (commentOpt.isNone) return;

      const comment = commentOpt.unwrap();
      const postId = comment.post_id;
      const postOpt = await api.query.blogs.postById(postId) as Option<Post>;
      if (postOpt.isNone) return;

      const post = postOpt.unwrap();
      const ids = [post.blog_id, postId, commentId];
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
      await deleteCommentActivityWithActivityStream(follower, following);
      await deleteCommentFollower(data);
      break;
    }
    case 'PostReactionCreated': {
      const follower = data[0].toString();
      const postId = data[1] as PostId;
      const postOpt = await api.query.blogs.postById(postId) as Option<Post>;
      if (postOpt.isNone) return;

      const post = postOpt.unwrap();
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
      const commentOpt = await api.query.blogs.commentById(commentId) as unknown as Option<Comment>;
      if (commentOpt.isNone) return;

      const comment = commentOpt.unwrap();
      const ids = [comment.post_id, commentId ];
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
      const SocialAccountOpt = await api.query.blogs.socialAccountById(accountId) as Option<SocialAccount>;
      if (SocialAccountOpt.isNone) return;
      
      const profileOpt = SocialAccountOpt.unwrap().profile;
      if (profileOpt.isNone) return;

      const profile = profileOpt.unwrap() as Profile;
      insertElasticSearch<ProfileData>(ES_INDEX_PROFILES, profile.ipfs_hash, accountId, { username: profile.username.toString() });
      break;
    }
    case 'ProfileUpdated' : {
      const accountId = data[0] as AccountId;
      const SocialAccountOpt = await api.query.blogs.socialAccountById(accountId) as Option<SocialAccount>;
      if (SocialAccountOpt.isNone) return;
      
      const profileOpt = SocialAccountOpt.unwrap().profile;
      if (profileOpt.isNone) return;

      const profile = profileOpt.unwrap() as Profile;
      insertElasticSearch<ProfileData>(ES_INDEX_PROFILES, profile.ipfs_hash, accountId, { username: profile.username.toString() });
      break;
    }
  }
}
