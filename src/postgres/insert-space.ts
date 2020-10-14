import { pg } from '../connections/connect-postgres';
import { Space, WhoAndWhen } from '@subsocial/types/substrate/interfaces/subsocial';
import { resolveCidOfContent } from '@subsocial/api/utils';

export const insertSpace = async (space: Space) => {
    const { id, created } = space
    const updated: WhoAndWhen | undefined = space.updated.unwrapOr(undefined)
    const parent_id = space.parent_id.unwrapOr(undefined)
    const handle = space.handle.unwrapOr(undefined)
    const content = resolveCidOfContent(space.content)

    const params = [
        id.toNumber(),
        created.account.toString(),
        created.block.toNumber(),
        created.time.toNumber(),
        updated?.account.toString(),
        updated?.block.toNumber(),
        updated?.time.toNumber(),
        space.owner.toString(),
        parent_id?.toNumber() || null,
        handle?.toString(),
        content,
        space.hidden.valueOf(),
        space.posts_count.toNumber(),
        space.hidden_posts_count.toNumber(),
        space.followers_count.toNumber(),
        space.score.toNumber()        
    ]

    const query = `
        INSERT INTO df.spaces
            VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING *`

    await pg.query(query, params)
}