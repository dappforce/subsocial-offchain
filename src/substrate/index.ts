import { resolveSubsocialApi } from "../connections";
import { startSubstrateSubscriber } from "./subscribe";

resolveSubsocialApi().then(({ substrate }) => startSubstrateSubscriber(substrate))