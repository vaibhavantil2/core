import { WorkspacesController } from "./controller";
import { Npm } from "../initiate/npm";

const npm = new Npm();
export const workspacesController = new WorkspacesController(npm);