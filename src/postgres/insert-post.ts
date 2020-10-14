import { pg } from '../connections/connect-postgres';
import { Post, WhoAndWhen} from '@subsocial/types/substrate/interfaces/subsocial';
import { resolveCidOfContent } from '@subsocial/api/utils';

export const insertPostOrComment = async (post: Post) => {
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

    const query = `
        INSERT INTO df.posts
            VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
        RETURNING *`;

    await pg.query(query, params)
}