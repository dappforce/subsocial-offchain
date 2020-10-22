import { getPostActivitiesCount } from './by-event/posts'
import { getSpaceActivitiesCount } from './by-event/spaces'
import { getFollowActivitiesCount } from './by-event/follows'
import { getReactionActivitiesCount } from './by-event/reactions'
import { getCommentActivitiesCount } from './by-event/comments'
import { getActivitiesCount } from './all'
import { Counts } from '@subsocial/types'

export const getActivityCounts = async (account: string): Promise<Counts> => {
  const [
    postsCount,
    spacesCount,
    followsCount,
    reactionsCount,
    commentsCount,
    activitiesCount
  ] = await Promise.all([
    getPostActivitiesCount(account),
    getSpaceActivitiesCount(account),
    getFollowActivitiesCount(account),
    getReactionActivitiesCount(account),
    getCommentActivitiesCount(account),
    getActivitiesCount(account)
  ])

  return {
    postsCount,
    commentsCount,
    reactionsCount,
    followsCount,
    spacesCount,
    activitiesCount
  }
}
