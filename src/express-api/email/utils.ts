import { SpaceId } from '@subsocial/types/substrate/interfaces';
import { newLogger } from '@subsocial/utils';
import { resolveSubsocialApi } from '../../connections/subsocial';
import { appsUrl } from '../../env';
import { ActivityTable } from '../../postgres/queries/feed-and-notifs';
import { Activity } from '../telegramWS';

export const log = newLogger("Email")

// FIXME: export these to JS libs
export type ActivityType = 'notifications' | 'feeds' | 'confirmation'

type TableNameByActivityType = Record<ActivityType, ActivityTable>
export const TableNameByActivityType: TableNameByActivityType = {
	'feeds': 'news_feed',
	'notifications': 'notifications',
	'confirmation': null
}

export type CreateEmailMessageFn = (activity: Activity) => Promise<string>

export const createHrefForPost = (spaceId: string, postId: string, name: string) => {
	return `<a href="${appsUrl}/${spaceId}/${postId}">${name}</a>`
}

export const createHrefForSpace = (spaceId: string, name: string) => {
	return `<a href="${appsUrl}/${spaceId}">${name}</a>`
}

export const createHrefForAccount = (followingId: string, name: string) => {
	return `<a href="${appsUrl}/accounts/${followingId}">${name}</a>`
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

export const getAccountName = async (account: string): Promise<string> => {
	const subsocial = await resolveSubsocialApi()
	const profile = await subsocial.findProfile(account)
	if (profile?.content) {
		const name = profile.content.name
		return name
	}
	else return account
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