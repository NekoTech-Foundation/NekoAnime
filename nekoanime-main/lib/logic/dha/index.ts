
// Wrapper for the DHA WASM logic
// We import the main.js which we patched to use the public WASM file

// @ts-ignore
import { init as initWasm, decryptM3u8 as decrypt } from "./main.js";

export const init = initWasm;
export const decryptM3u8 = decrypt;
