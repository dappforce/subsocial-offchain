import { schedule } from 'node-cron'
import { getAllEmailSettings } from '../../postgres/selects/getAllEmailSettings';
import { EmailSettings } from '../utils';
import { getActivitiesForEmailSender } from '../../postgres/selects/getActivitiesForEmailSender'
import { createNotifsEmailMessage } from './notifications';
import { LetterParams, sendEmail } from './emailSender';
import { createFeedEmailMessage } from './feed';
import { newLogger, nonEmptyArr, isEmptyArray } from '@subsocial/utils';
import { updateLastPush } from '../../postgres/updates/updateLastActivities';
import { TableNameByActivityType, CreateEmailMessageFn, getWeeklyDayDate } from './utils';
import { Activity } from '@subsocial/types'
import BN from 'bn.js';
import { TemplateType } from './templates';
import { getCountOfUnreadNotifications } from '../../postgres/selects/getCountOfUnreadNotifications';

const log = newLogger('Cron job')

// schedule('*/1 * * * *', async () => {
//   log.log('Running a task every 5 minutes');
//   await sendNotificationsAndFeeds('Immediately')
// });

schedule('0 23 * * *', async () => {
  log.log('Running a task every day at 23:00 ');
  await sendNotificationsAndFeeds('Daily')
});

schedule('0 23 * * 0', async () => {
  log.log('Running a task every week at 23:00');
  await sendNotificationsAndFeeds('Weekly')
});

const insertEmailTemplatesImages = () => {
}

insertEmailTemplatesImages()

type ActivitiesWithType = {
  activityType: TemplateType,
  activities: Activity[]
}

// TODO: maybe move this comparsion code to JS libs?
const compareActivities = (a: Activity, b: Activity) => (
  new BN(a.block_number).sub(new BN(b.block_number)).toNumber() || a.event_index - b.event_index
)

const sendActivitiesEmail = async (email: string, activitiesWithType: ActivitiesWithType, createEmailFn: CreateEmailMessageFn, params: LetterParams) => {
  const { activityType, activities } = activitiesWithType
  let message = []
  for (const activity of activities.slice(0, 10)) {
    message.push(await createEmailFn(activity))
  }

  if (!isEmptyArray(message)) {
    await sendEmail({ email, data: message, type: activityType, ...params })
  }
}


const createNofitParams = (count): LetterParams => ({
  fromName: 'Subsocial Notifications',
  title: `Notifications for ${getWeeklyDayDate()}`,
  subject: `You have ${count} unread notifications on Subsocial`
})

const createFeedParams = (): LetterParams => ({
  fromName: 'Subsocial Feed Updates',
  title: `Notifications for ${getWeeklyDayDate()}`,
  subject: 'You have new posts in your feed on Subsocial'
})


const sendNotificationsAndFeeds = async (periodicity: string) => {
  const emailSettingsArray: EmailSettings[] = await getAllEmailSettings(periodicity)

  for (const setting of emailSettingsArray) {
    const { account, last_block_bumber, last_event_index, email, send_notifs, send_feeds } = setting
    let lastActivities: Activity[] = []
    // TODO: maybe there's a way to simplify this code and remove potential copy-paste
    if (send_notifs) {
      const unreadCount = await getCountOfUnreadNotifications(account)
      if (unreadCount > 0) {
        const activityType = 'notifications'
        const activities = await getActivitiesForEmailSender(account, new BN(last_block_bumber), last_event_index, TableNameByActivityType[activityType])
  
        await sendActivitiesEmail(email, { activityType, activities }, createNotifsEmailMessage, createNofitParams(unreadCount))
        if (nonEmptyArr(activities))
          lastActivities.push(activities.pop())
      }
    }

    if (send_feeds) {
      const activityType = 'feed'
      const activities = await getActivitiesForEmailSender(account, new BN(last_block_bumber), last_event_index, TableNameByActivityType[activityType])

      await sendActivitiesEmail(email, { activityType, activities }, createFeedEmailMessage, createFeedParams())
      if (nonEmptyArr(activities))
        lastActivities.push(activities.pop())
    }

    if (nonEmptyArr(lastActivities)) {
      const lastActivity = lastActivities
        .filter(value => value !== undefined)
        .sort(compareActivities)
        .pop()

      const { block_number, event_index } = lastActivity
      await updateLastPush(account, block_number, event_index)
    }
  }
}