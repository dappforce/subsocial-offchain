import { pg } from '../connections/connect-postgres';
import { Post, WhoAndWhen} from '@subsocial/types/substrate/interfaces/subsocial';
import { resolveCidOfContent } from '@subsocial/api/utils';

export const upsertPostOrComment = async (post: Post) => {
    const { id, created } = post
    const updated: WhoAndWhen | undefined = post.updated.unwrapOr(undefined)
    const space_id = post.space_id.unwrapOr(undefined)
    const content = resolveCidOfContent(post.content)
    const shared_post_id = post.extension.isSharedPost ? post.extension.asSharedPost : null
    const comment = post.extension.isComment ? post.extension.asComment : null
    const parent_id_unwrapd = comment?.parent_id.unwrapOr(undefined)

    const params = [
        id.toNumber(),
        created.account.toString(),
        created.block.toNumber(),
        created.time.toNumber(),
        updated?.account.toString(),
        updated?.block.toNumber(),
        updated?.time.toNumber(),
        post.owner.toString(),
        shared_post_id?.toNumber(),
        parent_id_unwrapd?.toNumber(),
        comment?.root_post_id.toNumber(),
        space_id?.toNumber(),
        content,
        post.extension.type,
        post.hidden.valueOf(),
        post.replies_count.toNumber(),
        post.hidden_replies_count.toNumber(),
        post.shares_count.toNumber(),
        post.upvotes_count.toNumber(),
        post.downvotes_count.toNumber(),
        post.score.toNumber()
    ]

    const paramsJoined = params.map((_, i) => `$${i + 1}`).join(', ')

        
    const query = `
        INSERT INTO df.posts
            VALUES(${paramsJoined})
            ON CONFLICT (id) DO UPDATE SET
                created_by_account = $2,
                created_at_block = $3,
                created_at_time = $4,
                updated_by_account = $5,
                updated_at_block = $6,
                updated_at_time = $7,
                owner = $8,
                shared_post_id = $9,
                parent_id = $10,
                root_post_id = $11,
                space_id = $12,
                content = $13,
                type = $14,
                hidden = $15,
                replies_count = $16,
                hidden_replies_count = $17,
                shares_count = $18,
                upvotes_count = $19,
                downvotes_count = $20,
                score = $21`;

    await pg.query(query, params)
}