import { resolveSubsocialApi } from '../../connections/subsocial';
import messages from './messages';
import { getAccountName, createHrefForPost, createHrefForAccount, createNotification, createHrefForSpace } from './utils';
import { EventsName } from '@subsocial/types';
import { Activity } from '../telegramWS';
import { PostId, SpaceId } from '@subsocial/types/substrate/interfaces';
import { sendEmail } from './emailSender';
import { v4 } from 'uuid'
import { appsUrl } from '../../env';
import { setConfirmationCode } from '../../postgres/updates/setConfirmationCode';
import { SessionCall, ConfirmLetter } from '../../postgres/types/sessionKey';

export const createNotifsEmailMessage = async (activity: Activity): Promise<string> => {
	const { account, event, space_id, post_id, date, following_id, comment_id } = activity
	const eventName = event as EventsName

	const msg = messages.notifications[activity.event as EventsName]

	switch (eventName) {
		case 'AccountFollowed': return getAccountPreview(account, following_id, msg, date)
		case 'SpaceFollowed': return getSpacePreview(account, space_id, msg, date)
		case 'SpaceCreated': return getSpacePreview(account, space_id, msg, date)
		case 'CommentCreated': return getCommentPreview(account, comment_id, msg, date)
		case 'CommentReplyCreated': return getCommentPreview(account, comment_id, msg, date)
		case 'PostShared': return getPostPreview(account, post_id, msg, date)
		case 'CommentShared': return getCommentPreview(account, comment_id, msg, date)
		case 'PostReactionCreated': return getPostPreview(account, post_id, msg, date)
		case 'CommentReactionCreated': return getCommentPreview(account, comment_id, msg, date)
		case 'PostCreated': return getPostPreview(account, post_id, msg, date)
		default: return undefined
	}
}

const getAccountPreview = async (account: string, following_id: string, msg: string, date: string): Promise<string> => {
	const formatDate = new Date(date).toUTCString()

	const followingName = await getAccountName(following_id)
	const accountName = await getAccountName(account)

	const followingUrl = createHrefForAccount(following_id, followingName)
	const accountUrl = createHrefForAccount(account, accountName)
	return createNotification(formatDate, followingUrl, msg, accountUrl)
}

const getSpacePreview = async (account: string, spaceId: string, msg: string, date: string): Promise<string | undefined> => {
	const subsocial = await resolveSubsocialApi()
	const formatDate = new Date(date).toUTCString()
	const space = await subsocial.findSpace({ id: spaceId as unknown as SpaceId })
	const content = space.content.name

	const accountName = await getAccountName(account)

	const url = createHrefForSpace(spaceId.toString(), content)
	const accountUrl = createHrefForAccount(account, accountName)

	return createNotification(formatDate, accountUrl, msg, url)
}

const getCommentPreview = async (account: string, commentId: string, msg: string, date: string): Promise<string | undefined> => {
	const subsocial = await resolveSubsocialApi()
	const formatDate = new Date(date).toUTCString()

	const postDetails = await subsocial.findPostWithSomeDetails({ id: commentId as unknown as PostId, withSpace: true })
	const postId = postDetails.post.struct.id
	const spaceId = postDetails.space.struct.id
	const content = postDetails.ext.post.content.body

	const accountName = await getAccountName(account)

	const url = createHrefForPost(spaceId.toString(), postId.toString(), content)
	const accountUrl = createHrefForAccount(account, accountName)

	return createNotification(formatDate, accountUrl, msg, url)
}

const getPostPreview = async (account: string, postId: string, msg: string, date: string): Promise<string | undefined> => {
	const subsocial = await resolveSubsocialApi()
	const formatDate = new Date(date).toUTCString()

	const post = await subsocial.findPost({ id: postId as unknown as PostId })
	const spaceId = post.struct.space_id
	const content = post.content.body

	const accountName = await getAccountName(account)

	const url = createHrefForPost(spaceId.toString(), postId.toString(), content)
	const accountUrl = createHrefForAccount(account, accountName)

	return createNotification(formatDate, accountUrl, msg, url)
}

export const sendConfirmationLetter = async (sessionCall: SessionCall<ConfirmLetter>) => {
	const email = sessionCall.message.args.email
	const confirmationCode = v4()
	const message = `<a href="${appsUrl}/settings?confirmationCode=${confirmationCode}">link</a>`

	try {
		await sendEmail(email, message, "confirmation")
		await setConfirmationCode(sessionCall, confirmationCode)
	} catch (err) {
		console.log("Error", err)
	}
}
