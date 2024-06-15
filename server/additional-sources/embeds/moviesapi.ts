import * as crypto from 'crypto';

export async function resolveMoviesapi(url: URL) {
    const datafromembed = await fetch(url, {
        headers: {
            'Referer': 'https://moviesapi.club'
        }
    })
    if (datafromembed.ok != true) {
        console.log(datafromembed)
        return(null)
    }
    const jscriptregex = /JScripts = '([\w\W]*?)'/

    const encryptedcode = jscriptregex.exec(await datafromembed.text())

    if (encryptedcode == null) {
        return(null)
    }
    
    const decrypted = decrypt(encryptedcode[1], 'a7igbpIApajDyNe')
    console.log(decrypted)
    const fileregex = /sources: \[\{\"file\":"([^"]+)"/

    const fileurl = fileregex.exec(decrypted)

    if (fileurl != null && fileurl[1] != null) {
        return(fileurl[1])
    }

}

function decrypt(jsonStr: string, passphrase: string): any {
  const json = JSON.parse(jsonStr);
  const salt = Buffer.from(json.s, 'hex');
  const iv = Buffer.from(json.iv, 'hex');
  const ct = Buffer.from(json.ct, 'base64');

  const passphraseBuffer = Buffer.from(passphrase);
  let keyMaterial = Buffer.concat([passphraseBuffer, salt], passphraseBuffer.length + salt.length);
  let md5: Buffer[] = [];
  md5[0] = crypto.createHash('md5').update(keyMaterial).digest();

  for (let i = 1; i < 3; i++) {
    md5[i] = crypto.createHash('md5').update(Buffer.concat([md5[i-1], keyMaterial])).digest();
  }

  const key = Buffer.concat([md5[0], md5[1]], 32);

  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = Buffer.concat([decipher.update(ct), decipher.final()]);

  return JSON.parse(decrypted.toString());
}