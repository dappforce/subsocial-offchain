import { Activity } from '../telegramWS';
import { resolveSubsocialApi } from '../../connections/subsocial';
import { PostId } from '@subsocial/types/substrate/interfaces';
import { createHrefForPost, getAccountContent, getFormatDate, toShortAddress } from './utils';
import { FeedTemplateProp } from './types';
import { summarizeMd } from '@subsocial/utils/summarize'

export const createFeedEmailMessage = async (activity: Activity): Promise<FeedTemplateProp> => {
	const { post_id, date } = activity
	const actionDate = getFormatDate(date)
	const subsocial = await resolveSubsocialApi()
	const post = await subsocial.findPostWithAllDetails(post_id as unknown as PostId)
	const { id, owner, space_id } = post.post.struct

	const { title: postTitle, body, image } = post.post.content

	const { summary: postSummary } = summarizeMd(body)

	const { name: spaceName } = post.space.content

	const ownerAddress = owner.toString()

	const { name: ownerName = toShortAddress(ownerAddress), avatar } = await getAccountContent(ownerAddress)

	const postLink = createHrefForPost(space_id.toString(), id.toString())
	return { ownerName, avatar, spaceName, postTitle, postLink, postSummary, date: actionDate, image }
}