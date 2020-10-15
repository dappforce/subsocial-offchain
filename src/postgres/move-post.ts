import { pg } from '../connections/connect-postgres';
import { Post, WhoAndWhen } from '@subsocial/types/substrate/interfaces/subsocial';

export const movePost = async (post: Post) => {
  const updated: WhoAndWhen | undefined = post.updated.unwrapOr(undefined)
  const space_id = post.space_id.unwrapOr(undefined)

  const params = [
    post.id.toNumber(),
    updated?.account.toString(),
    updated?.block.toNumber(),
    updated?.time.toNumber(),
    space_id.toNumber()
  ]

  const query =
    `UPDATE df.posts SET
      updated_by_account = $2,
      updated_at_block = $3,
      updated_at_time = $4,
      space_id = $5,
    WHERE id = $1`

  await pg.query(query, params)
}