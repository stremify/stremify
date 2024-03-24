/**
 * This file includes code that is inspired and derived by/from AnimeScrap by fakeyatogod
 * fakeyatogod/AnimeScrap-AP is licensed under the MIT License.
 * 
 * You can find the original source and license at:
 * https://github.com/fakeyatogod/AnimeScrap/
 * 
 * MIT License
 * 
 * Copyright (c) 2022 Yato
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */


import { createCipheriv, createDecipheriv } from 'crypto';

export async function pladaricResolver(url: URL) {
    const key = "93422192433952489752342908585752";
    const iv = "9262859232435825";

    const params = new URLSearchParams(url.search);
    const id = params.get('id')
    const token = params.get('token')
    if (id != null && token != null) {
        const encryptedID = encryptData(id, key, iv)

        const streamData = await fetch(`https://pladrac.net/encrypt-ajax.php?id=${encryptedID}&token=${token}`)
        if (streamData.ok != true) {
            return([])
        }

        const jsonString = await streamData.text()

        const dataJSON = JSON.parse(jsonString)

        if (dataJSON.data != null) {
            const streamData = decryptData(dataJSON.data, key, iv)

            const streamURL = JSON.parse(streamData).source[0].file
            return(streamURL)
        }
    } else {
        return([])
    }
}

function encryptData(data: string, key: string, iv: string): string {
    const keyBuffer = Buffer.from(key, 'utf-8');
    const ivBuffer = Buffer.from(iv, 'utf-8');
    const cipher = createCipheriv('aes-256-cbc', keyBuffer, ivBuffer);
    let encrypted = cipher.update(data, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return encrypted;
}

function decryptData(encryptedData: string, key: string, iv: string): string {
    const keyBuffer = Buffer.from(key, 'utf-8');
    const ivBuffer = Buffer.from(iv, 'utf-8');
    const decipher = createDecipheriv('aes-256-cbc', keyBuffer, ivBuffer);
    let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}
