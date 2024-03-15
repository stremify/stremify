// supervideo and dropload are in practice the same in regard to scraping

import { VM } from "vm2";
import cheerio from 'cheerio';

export async function superivdeodroploadResolve(link: URL) {
    const response = await fetch(link, {
        redirect: 'follow'
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch`);
    }

    const bodyText = await response.text();

    const $ = cheerio.load(bodyText);
    let script: string | null = null;

    $('script').each(function() {
        const scriptContent = $(this).html();
        if (scriptContent && scriptContent.includes('eval(')) {
            script = scriptContent;
            return (false); 
        }
    });

    if (script != null) {

        const deobfuscated = await deobfuscate(script)


        const streamregex = /sources:\s*\[{\s*file:\s*["'](?<url>[^"']+)/;
        const stream = streamregex.exec(deobfuscated)
        if (stream?.groups) {
            return(stream.groups.url)
        } else {
            return(null)
        }


    } else {
        return (null)
    }

}

async function deobfuscate(script: string): Promise < string > {
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
        return Promise.reject('Error deobfuscating.');
    }
}
