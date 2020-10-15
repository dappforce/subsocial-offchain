import { pg } from '../connections/connect-postgres';
import { Space, WhoAndWhen } from '@subsocial/types/substrate/interfaces/subsocial';
import { resolveCidOfContent } from '@subsocial/api/utils';

export const upsertSpace = async (space: Space) => {
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

    const paramsJoined = params.map((_, i) => `$${i + 1}`).join(', ')

    const query = `
        INSERT INTO df.spaces
            VALUES(${paramsJoined})
            ON CONFLICT (id) DO UPDATE SET
                created_by_account = $2,
                created_at_block = $3,
                created_at_time = $4,
                updated_by_account = $5,
                updated_at_block = $6,
                updated_at_time = $7,
                owner = $8,
                parent_id = $9,
                handle = $10,
                content = $11,
                hidden = $12,
                posts_count = $13,
                hidden_posts_count = $14,
                followers_count = $15,
                score = $16`

    await pg.query(query, params)
}