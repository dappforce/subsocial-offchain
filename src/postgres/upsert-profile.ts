import { pg } from '../connections/connect-postgres';
import { Profile, WhoAndWhen} from '@subsocial/types/substrate/interfaces/subsocial';
import { resolveCidOfContent } from '@subsocial/api/utils';
import { profileField } from '../sql/TablesFields';

export const upsertProfile = async (profile: Profile) => {
	const { created } = profile
	const updated: WhoAndWhen | undefined = profile.updated.unwrapOr(undefined)
	const content = resolveCidOfContent(profile.content)

	const params = [
		created.account.toString(),
		created.block.toNumber(),
		created.time.toNumber(),
		updated?.account.toString(),
		updated?.block.toNumber(),
		updated?.time.toNumber(),
		content
	]

	const paramsJoined = params.map((_, i) => `$${i + 1}`).join(', ')
	const paramsForUpdate = profileField.map((value, i) => `${value} = $${i + 1}`).join(', ')

			
	const query = `
		INSERT INTO df.profile
			VALUES(DEFAULT, ${paramsJoined})
			ON CONFLICT (id) DO UPDATE SET
				${paramsForUpdate}`;

	await pg.query(query, params)
}