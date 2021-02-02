import { Activity } from '../telegramWS';
import { resolveSubsocialApi } from '../../connections/subsocial';
import { PostId } from '@subsocial/types/substrate/interfaces';
import { createHrefForAccount, createHrefForPost, getAccountContent, createHrefForSpace, getFormatDate } from './utils';
import { FeedTemplateProp } from './types';

export const createFeedEmailMessage = async (activity: Activity): Promise<FeedTemplateProp> => {
	const { post_id, date } = activity
	const actionDate = getFormatDate(date)
	const subsocial = await resolveSubsocialApi()
	const post = await subsocial.findPostWithAllDetails(post_id as unknown as PostId)
	const { id, owner, space_id } = post.post.struct

	const { title: postName, body: postBody } = post.post.content

	const { name: spaceName } = post.space.content
	const spaceLink = createHrefForSpace(space_id.toString())

	const { name: ownerName, avatar } = await getAccountContent(owner.toString())
	const ownerLink = createHrefForAccount(owner.toString())

	const postLink = createHrefForPost(space_id.toString(), id.toString())

	return { ownerName, ownerLink, avatar, spaceName, spaceLink, postName, postLink, postBody, date: actionDate }
}