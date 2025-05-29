// used by supervideo and dropload (renamed everything cause i was possed to use it for another embed too, but things didn't go to plan with it)
// used for the common eval packed method

import { VM } from "vm2";
import * as cheerio from 'cheerio';

export async function evalResolver(link: URL) {
    const response = await fetch(link, {
        redirect: 'follow'
    });
    if (!response.ok) {
        return(null)
    }

    const bodyText = await response.text();

    const $ = cheerio.load(bodyText);
    let script: string | null = null;

    $('script').each(function() {
        const scriptContent = $(this).html();
        if (scriptContent && scriptContent.includes('eval(')) {
            script = scriptContent.replace('eval', 'console.log');
            return (false); 
        }
    });

    if (script != null) {
        const deobfuscated = await deobfuscate(script)

        const streamregex = /{file:\"([^"]*)/;
        const stream = streamregex.exec(deobfuscated)
        if (stream[1]) {
            return(stream[1])
        } else {
            return(null)
        }


    } else {
        return (null)
    }

}

export async function deobfuscate(script: string): Promise < string > {
    let capturedContent = "";

    const sandbox = {
        console: {
            log: (code: any) => {
                const codeStr = typeof code === 'string' ? code : JSON.stringify(code);
                capturedContent += codeStr + "\n";
            }
        },
        eval: (code: any) => {
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
        return Promise.reject();
    }
}
