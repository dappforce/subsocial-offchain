import { resolveSubsocialApi } from "../connections";
import { startHttpServer } from "./server";

resolveSubsocialApi().finally(startHttpServer)