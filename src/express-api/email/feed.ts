import { Activity } from '../telegramWS';
import { resolveSubsocialApi } from '../../connections/subsocial';
import { PostId } from '@subsocial/types/substrate/interfaces';
import { createHrefForAccount, getAccountName, createHrefForPost } from './utils';

export const createFeedEmailMessage = async (activity: Activity) => {
	const { post_id, date } = activity
	const subsocial = await resolveSubsocialApi()
	const post = await subsocial.findPostWithSomeDetails({ id: post_id as unknown as PostId })
	const { id, owner, space_id } = post.post.struct

	const { title, body } = post.post.content

	const ownerName = await getAccountName(owner.toString())
	const ownerLink = createHrefForAccount(owner.toString(), ownerName)

	const postLink = createHrefForPost(space_id.toString(), id.toString(), title)

	return `
    <div style="background:yellow;" >
			<a href=''>
				Photo ${ownerLink}
				${postLink} Avatar
				${body}
				${date}
			</a>
    </div>
`

}