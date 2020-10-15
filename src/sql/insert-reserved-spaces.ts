import { SubsocialSubstrateApi } from '@subsocial/api/substrate';
import { Api } from '@subsocial/api/substrateConnect';
import { SpaceId } from '@subsocial/types/substrate/interfaces';
import { upsertSpace } from '../postgres/insert-space';

 async function insertReservedSpaces (first_space_id: number, last_space_id: number) {
    const api = await Api.connect(process.env.SUBSTRATE_URL)
    const substrate = new SubsocialSubstrateApi(api)

    for (let i = first_space_id; i <= last_space_id; i++) {
        const space_id: SpaceId = i as unknown as SpaceId
        const space = await substrate.findSpace({ id: space_id});

        await upsertSpace(space)
    }
    api.disconnect();
}

insertReservedSpaces(1, 1000)