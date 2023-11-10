import * as Colors from "https://deno.land/std@0.205.0/fmt/colors.ts";
import * as semver from "https://deno.land/std@0.205.0/semver/mod.ts";
import { getEncoding } from 'https://esm.sh/js-tiktoken@1.0.7'

export const autoVersioning = (version, file) => {
    const oldHash = Deno.readTextFileSync('./integrity.hash')

    const enc = getEncoding("cl100k_base");
    const snippet = Deno.readTextFileSync(file) as string
    const hash = enc.encode(snippet).join('%')

    Deno.writeTextFileSync('./integrity.hash', hash)

    const diff = Math.round(((hash.length / oldHash.length) -1) * 100)

    const isZero = diff === 0
    const isPatch = !isZero && diff > -9 && diff <= 9
    const isMinor = !isZero && !isPatch && diff >= -33 && diff >= 10 && diff <= 33
    const isMajor = !isZero && !isMinor && !isPatch


    if(isZero) {
        console.log(Colors.gray('No changes'))
    } else {
        const suggeredVersion = semver.increment(semver.parse(version), isMajor ? 'major' : isMinor ? 'minor' : 'patch')

        console.log(Colors.green(`Changes detected: ${diff}%`))

        console.log(`${Colors.bold(`Semantic Versioning`)}: ${Colors.brightRed(version)} -> ${Colors.brightGreen(semver.format(suggeredVersion))}  (${Colors.yellow(isMajor ? 'major' : isMinor ? 'minor' : 'patch')})`)

        const shouldProceed = confirm(`Would you like to save?`);
        
        if(shouldProceed) {
            await Deno.writeTextFile('./version.ts', `export const version = "${semver.format(suggeredVersion)}";\n`)
        }
    }
}


if (Deno.args[0] && Deno.args[1]) {
    const version = import(Deno.args[0])
    autoVersioning(, Deno.args[1])
}
