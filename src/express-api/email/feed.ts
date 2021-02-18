import { Activity } from '../telegramWS';
import { resolveSubsocialApi } from '../../connections/subsocial';
import { PostId } from '@subsocial/types/substrate/interfaces';
import { createHrefForPost, getAccountContent, getFormatDate } from './utils';
import { FeedTemplateProp } from './types';
import { summarizeMd } from '@subsocial/utils/summarize'

export const createFeedEmailMessage = async (activity: Activity): Promise<FeedTemplateProp> => {
	const { post_id, date } = activity
	const actionDate = getFormatDate(date)
	const subsocial = await resolveSubsocialApi()
	const post = await subsocial.findPostWithAllDetails(post_id as unknown as PostId)
	const { id, owner, space_id } = post.post.struct

	const { title: postName, body, image } = post.post.content

	const { summary: postSummary } = summarizeMd(body)

	const { name: spaceName } = post.space.content

	const { name: ownerName, avatar } = await getAccountContent(owner.toString())

	const postLink = createHrefForPost(space_id.toString(), id.toString())
	return { ownerName, avatar, spaceName, postName, postLink, postSummary, date: actionDate, image }
}