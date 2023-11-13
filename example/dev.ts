/// <reference lib="deno.ns" />

import * as esbuild from "https://deno.land/x/esbuild@v0.19.4/mod.js";
import * as swc from "https://deno.land/x/swc@0.2.1/mod.ts";

import sass from "https://deno.land/x/denosass@1.0.6/mod.ts";
import postcss from "https://deno.land/x/postcss@8.4.16/mod.js";
import autoprefixer from "https://deno.land/x/postcss_autoprefixer@0.2.8/mod.js";
import { emptyDir, exists } from "https://deno.land/std@0.205.0/fs/mod.ts";
import { cheerio } from "https://deno.land/x/cheerio@1.0.7/mod.ts";

import { version } from "./version.ts";

const inputs = {
  css: "./src/main.scss",
  js: "./src/main.ts",
};

const outputs = {
  css: "./build/main.css",
  js: "./build/main.ecma2020.js",
  jsForOldBrowsers: "./build/main.ecma2015.js",
  readyForGTM: "./build/ready-for-gtm.html",
  demo: "./build/demo.html",
};

if (await exists("./build")) {
  emptyDir("./build");
}

/*########*
*#  JS  #*
*########*/

// Transpile to ES6 for modern browsers
// Used to bundle the code, because SWC can't import modules
await esbuild.build({
  entryPoints: [inputs.js],
  bundle: true,
  sourcemap: false,
  target: ["chrome58", "firefox57", "safari11", "edge16"],
  outfile: outputs.js,
});

// Transpile to ES5 for old browsers
const { code } = swc.transform(Deno.readTextFileSync(outputs.js), {
  minify: true,
  jsc: { target: "es5" },
  sourceMaps: false,
  module: { type: "es6" },
});

Deno.writeTextFileSync(outputs.jsForOldBrowsers, code);

/*#########*
 *#  CSS  #*
 *#########*/
await postcss([autoprefixer as never]).process(
  sass(Deno.readTextFileSync(inputs.css), {
    load_paths: [
      "./styles/abstract",
      "./styles/components",
      "./styles/layout",
      "./styles/tools",
      "./styles/vendors",
    ],
  }).to_string("compressed") as string,
  { map: false, from: inputs.css, to: outputs.css },
).then((x: unknown) =>
  Deno.writeTextFileSync(outputs.css, (x as string).toString())
);

const style = Deno.readTextFileSync(outputs.css);

/*########################*
 *#  ready-for-gtm.html  #*
 *########################*/
Deno.writeTextFileSync(
  outputs.readyForGTM,
  `<!-- Awesome Example -  v${version} -->\n<style>\n${style}\n</style><script>\n${code}\n</script>`,
);

/*###############*
 *#  demo.html  #*
 *###############*/
const $ = cheerio.load(`<html><head></head><body></body></html>`);
$("head").append(`<title>My awesome feature</title>`);
$("head").append(`<meta name="viewport" content="width=device-width, initial-scale=1.0">`);
$("head").append($$("style"));
$("body").append(`<script>window.dataLayer = []</script>`);
$("body").append(`<style>\n${style}\n</style><script>\n${code}\n</script>`);


Deno.writeTextFileSync(outputs.demo, $.html());

console.log(new Date().toLocaleString() + " - Done!");

if (Deno.args.includes("--stop")) {
  esbuild.stop();
  Deno.exit(0);
}
