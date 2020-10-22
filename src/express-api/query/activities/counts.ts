import { getPostActivitiesCount } from './by-event/posts'
import { getSpaceActivitiesCount } from './by-event/spaces'
import { getFollowActivitiesCount } from './by-event/follows'
import { getReactionActivitiesCount } from './by-event/reactions'
import { getCommentActivitiesCount } from './by-event/comments'
import { getActivitiesCount } from './all'
import { Counts } from '@subsocial/types'

export const getActivityCounts = async (account: string): Promise<Counts> => {
  const postsCount = await getPostActivitiesCount(account)
  const spacesCount = await getSpaceActivitiesCount(account)
  const followsCount = await getFollowActivitiesCount(account)
  const reactionsCount = await getReactionActivitiesCount(account)
  const commentsCount = await getCommentActivitiesCount(account)
  const activitiesCount = await getActivitiesCount(account)

  return {
    postsCount,
    commentsCount,
    reactionsCount,
    followsCount,
    spacesCount,
    activitiesCount
  }
}