import { schedule } from 'node-cron'
import { getAllEmailSettings } from '../../postgres/selects/getAllEmailSettings';
import { EmailSettings } from '../utils';
import { getActivitiesForEmailSender } from '../../postgres/selects/getActivitiesForEmailSender'
import * as BN from 'bn.js';
import { createNotifsEmailMessage } from './notifications';
import { sendEmail } from './emailSender';
import { createFeedEmailMessage } from './feed';
import { newLogger } from '@subsocial/utils';
import { updateLastPush } from '../../postgres/updates/updateLastActivities';

const log = newLogger('Cron job')

schedule('*/5 * * * *', async () => {
	log.log('Running a task every 5 minutes');
	await sendNotificationsAndFeeds('Immediately')
});

schedule('0 23 * * *', async () => {
	log.log('Running a task every day at 23:00 ');
	await sendNotificationsAndFeeds('Daily')
});

schedule('0 23 * * 0', async () => {
	log.log('Running a task every week at 23:00');
	await sendNotificationsAndFeeds('Weekly')
});

const sendNotificationsAndFeeds = async (recurrence: string) => {
	const emailSettings: EmailSettings[] = await getAllEmailSettings(recurrence)

	for (const emailSetting of emailSettings) {
		const { account, last_block_bumber, last_event_index, email } = emailSetting

		if (emailSetting.send_notifs) {
			const notifsActivities = await getActivitiesForEmailSender(account, new BN(last_block_bumber), last_event_index, 'notifications')
			let notifsMessage = ''
			for (const activity of notifsActivities) {
				notifsMessage += await createNotifsEmailMessage(activity)
			}

			if (notifsMessage) {
				await sendEmail(email, notifsMessage, 'notifications')
				const { block_number, event_index } = notifsActivities.pop()
				await updateLastPush(account, block_number, event_index)
			}
		}
		if (emailSetting.send_feeds) {
			const feedsActivities = await getActivitiesForEmailSender(account, new BN(last_block_bumber), last_event_index, 'news_feed')
			let feedsMessage = ''
			for (const activity of feedsActivities) {
				feedsMessage += await createFeedEmailMessage(activity)
			}

			if (feedsMessage) {
				await sendEmail(email, feedsMessage, 'feeds')
				const { block_number, event_index } = feedsActivities.pop()
				await updateLastPush(account, block_number, event_index)
			}
		}
	}
}