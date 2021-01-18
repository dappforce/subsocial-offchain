import { SpaceId } from '@subsocial/types/substrate/interfaces';
import { newLogger } from '@subsocial/utils';
import { resolveSubsocialApi } from '../../connections/subsocial';
import { appsUrl, ipfsGatewayUrl } from '../../env';
import { ActivityTable } from '../../postgres/queries/feed-and-notifs';
import { Activity } from '../telegramWS';
import { NotificationTemplateProp } from './notifications';
import { FeedTemplateProp } from './feed';

export const log = newLogger("Email")

// FIXME: export these to JS libs
export type ActivityType = 'notifications' | 'feeds' | 'confirmation'

type TableNameByActivityType = Record<ActivityType, ActivityTable>
export const TableNameByActivityType: TableNameByActivityType = {
	'feeds': 'news_feed',
	'notifications': 'notifications',
	'confirmation': null
}

export type CreateEmailMessageFn = (activity: Activity) => Promise<NotificationTemplateProp | FeedTemplateProp>

export const createHrefForPost = (spaceId: string, postId: string) => {
	return `${appsUrl}/${spaceId}/${postId}`
}

export const createHrefForSpace = (spaceId: string) => {
	return `${appsUrl}/${spaceId}`
}

export const createHrefForAccount = (followingId: string) => {
	return `${appsUrl}/accounts/${followingId}`
}

export const createMessageForFeeds = (link: string, account: string, spaceName: string, date: string) => {
	return link + "\n" + "Posted by " + account + " in space " + spaceName + "\n" + date
}

export const createNotification = (date: string, account: string, msg: string, link: string): string => {

	return `
		<a href='${link}'>
			Photo ${account} ${msg} ${link} Avatar\n
			${date}
		</a>
  `
}

export const resolveIpfsUrl = (cid: string) => {
    return `${ipfsGatewayUrl}/${cid}`
}

export const getAccountContent = async (account: string) => {
	const subsocial = await resolveSubsocialApi()
	const profile = await subsocial.findProfile(account)
	if (profile?.content) {
		const name = profile.content.name
		const avatar = profile.content.avatar ? resolveIpfsUrl(profile.content.avatar) : ''
		return {name, avatar}
	}
	else return {name: account, avatar: ''}
}

export const getSpaceName = async (spaceId: SpaceId): Promise<string> => {
	const subsocial = await resolveSubsocialApi()
	const space = await subsocial.findSpace({ id: spaceId })
	if (space.content) {
		const name = space.content.name
		return name
	}
	else return ''
}