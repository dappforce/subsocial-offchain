import { EnumType } from '@polkadot/types/codec';
import { BlockNumber } from '@polkadot/types';
export declare class Announcing extends BlockNumber {
}
export declare class Voting extends BlockNumber {
}
export declare class Revealing extends BlockNumber {
}
export declare class ElectionStage extends EnumType<Announcing | Voting | Revealing> {
    constructor(value?: any, index?: number);
    /** Create a new Announcing stage. */
    static Announcing(endsAt: BlockNumber | number): ElectionStage;
    /** Create a new Voting stage. */
    static Voting(endsAt: BlockNumber | number): ElectionStage;
    /** Create a new Revealing stage. */
    static Revealing(endsAt: BlockNumber | number): ElectionStage;
    static newElectionStage(stageName: string, endsAt: BlockNumber | number): ElectionStage;
}
export declare function registerDfTypes(): void;
