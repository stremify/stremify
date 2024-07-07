import decode from "./decryption"
import { VM } from "vm2"
import { writeFile } from "fs"

export async function pjsExtractor(configurl) {
    const scriptFetchData = await fetch(configurl)
    const scriptData = await scriptFetchData.text()

    const scriptEvalRegex = /eval(\(function\(.*?\)\s*\{[\s\S]*?\}\(.*?).split\('"/

    const script = scriptEvalRegex.exec(scriptData)

    const regex = /eval(\(function\(.*?\)\s*\{[\s\S]*?\}\(.*?{}\)\))/
    const matches = regex.exec(script.toString())

    if (matches && matches[1]) {
        const deobfuscated = await deobfuscate(`console.log(${matches[1]})`)

        if (deobfuscated) {
            const configRegex = /false,u:\'([^']*)/
            const configRegexResult = configRegex.exec(deobfuscated)

            if (configRegexResult[1]) {
                const config = configRegexResult[1]

                const decodedConfig = decode(config)

                const keyRegex = /"bk0":"([^"]*)","bk1":"([^"]*)","bk2":"([^"]*)","bk3":"([^"]*)","bk4":"([^"]*)"/

                const keyData = keyRegex.exec(decodedConfig)

                return([
                    keyRegex[1],
                    keyRegex[2],
                    keyRegex[3],
                    keyRegex[4],
                    keyRegex[5]
                ])

            } else {
                throw new Error('Config not found.')
            }
        }

    }
}

export async function deobfuscate(script) {
    let capturedContent = "";

    const sandbox = {
        console: {
            log: (code) => {
                const codeStr = typeof code === 'string' ? code : JSON.stringify(code);
                capturedContent += codeStr + "\n";
            }
        },
        eval: (code) => {
            sandbox.console.log(code);
            return code;
        }
    };

    const vm = new VM({
        sandbox: sandbox,
        timeout: 2000,
    });

    try {
        vm.run(script);
        return Promise.resolve(capturedContent);
    } catch (error) {
        return Promise.reject('Error deobfuscating.');
    }
}