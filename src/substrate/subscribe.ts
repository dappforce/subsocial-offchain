import { SubstrateEvent } from './types'
import * as handlers from './event-handlers/index'

export const DispatchForDb = async (event: SubstrateEvent) => {
  switch (event.eventName) {
    case 'AccountFollowed': return handlers.onAccountFollowed(event)
    case 'AccountUnfollowed': return handlers.onAccountUnfollowed(event)
    case 'BlogCreated': return handlers.onBlogCreated(event)
    case 'BlogUpdated': return handlers.onBlogUpdated(event)
    case 'BlogFollowed': return handlers.onBlogFollowed(event)
    case 'BlogUnfollowed': return handlers.onBlogUnfollowed(event)
    case 'PostCreated': return handlers.onPostCreated(event)
    case 'PostUpdated': return handlers.onPostUpdated(event)
    case 'PostShared': return handlers.onPostShared(event)
    case 'PostDeleted': return handlers.onPostDeleted(event)
    case 'CommentCreated': return handlers.onCommentCreated(event)
    case 'CommentUpdated': return handlers.onCommentUpdated(event)
    case 'CommentShared': return handlers.onCommentShared(event)
    case 'CommentDeleted': return handlers.onCommentDeleted(event)
    case 'PostReactionCreated': return handlers.onPostReactionCreated(event)
    case 'CommentReactionCreated': return handlers.onCommentReactionCreated(event)
    case 'ProfileCreated' : return handlers.onProfileCreated(event)
    case 'ProfileUpdated' : return handlers.onProfileUpdated(event)
  }
}
