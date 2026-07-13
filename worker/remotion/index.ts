/**
 * Remotion entry point — registerRoot must be called here.
 * The bundler uses this file as the webpack entry point.
 */
import { registerRoot } from "remotion";
import { RemotionRoot } from "./Root";

registerRoot(RemotionRoot);
