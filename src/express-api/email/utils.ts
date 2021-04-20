import { SpaceId } from '@subsocial/types/substrate/interfaces';
import { newLogger, nonEmptyStr } from '@subsocial/utils';
import { resolveSubsocialApi } from '../../connections/subsocial';
import { appBaseUrl, ipfsGatewayUrl } from '../../env';
import { ActivityTable } from '../../postgres/queries/feed-and-notifs';
import { Activity } from '../telegramWS';
import { NotificationTemplateProp, FeedTemplateProp } from './types';
import { AnyAccountId } from '@subsocial/types';
import { TemplateType } from './templates';
import dayjs from 'dayjs'
import LocalizedFormat from 'dayjs/plugin/localizedFormat'
dayjs.extend(LocalizedFormat)
export const log = newLogger("Email")

// FIXME: export these to JS libs

type TableNameByActivityType = Record<TemplateType, ActivityTable>
export const TableNameByActivityType: TableNameByActivityType = {
	'feed': 'news_feed',
	'notifications': 'notifications',
	'confirmation': null
}

export type CreateEmailMessageFn = (activity: Activity) => Promise<NotificationTemplateProp | FeedTemplateProp>

export const createHrefForPost = (spaceId: string, postId: string) => {
	return `${appBaseUrl}/${spaceId}/${postId}`
}

export const createHrefForSpace = (spaceId: string) => {
	return `${appBaseUrl}/${spaceId}`
}

export const createHrefForAccount = (followingId: string) => {
	return `${appBaseUrl}/accounts/${followingId}`
}

export const createMessageForFeeds = (link: string, account: string, spaceName: string, date: string) => {
	return link + "\n" + "Posted by " + account + " in space " + spaceName + "\n" + date
}

export const toShortAddress = (_address: AnyAccountId) => {
  const address = (_address || '').toString()

  return address.length > 13 ? `${address.slice(0, 6)}…${address.slice(-6)}` : address
}

export const resolveIpfsUrl = (cid: string) => {
    return nonEmptyStr(cid) ? `${ipfsGatewayUrl}/ipfs/${cid}` : ''
}

export const DEFAULT_DATE_FORMAT = 'D MMM, YYYY h:mm A'

export const getAccountContent = async (account: string) => {
	const subsocial = await resolveSubsocialApi()
	const profile = await subsocial.findProfile(account)
	const shortAddress = toShortAddress(account)
	if (profile?.content) {
		const name = profile.content.name || shortAddress
		const avatar = profile.content.avatar ? resolveIpfsUrl(profile.content.avatar) : ''
		return { name, avatar }
	}
	else return { name: shortAddress, avatar: '' }
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

export const getExpiresOnDate = () => dayjs().add(1, 'hours').format('YYYY-MM-DDTHH:mm:ss').toString()

export const getFormatDate = (date: string) => dayjs(date).format('lll')

/**
 * Format date:
 * DD - 01-31
 * MMMM - January-December
 * YYYY - 2000
 * dddd - Monday-Subday
 * Full example: 01 January 2000 (Monday)
 */
export const getWeeklyDayDate = () => dayjs().format('DD MMMM YYYY (dddd)')