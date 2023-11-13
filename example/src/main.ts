/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
// deno-lint-ignore-file no-window-prefix

declare global {
    interface Window {
        dataLayer: unknown[];
    }

    export const dataLayer: unknown[];
}

import { version } from "../../version.ts";

alert(`You are using version v${version}`)