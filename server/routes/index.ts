import { buildHTMLselectors } from "../additional-sources/languages/custom-wrapper"
let selectors = null;

import 'dotenv/config'
const name = process.env.name || 'Stremify'
const description = process.env.description || ''

export default eventHandler(async (event) => {
  if (selectors == null) {
    selectors = await buildHTMLselectors()
  }
  return (`
  <html lang="en">

  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Stremify</title>
    <style>
    body {
      font-family: Ubuntu, sans-serif;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      background-color: #000000;
    }

    a {
      color: #34a4eb;
      text-decoration: none;
    }

    #base64-result {
      font-family: 'Courier New', Courier, monospace;
      background-color: #FFFFFF;
      border: 1px solid #5d536b;
      border-radius: 4px;
      padding: 8px;
      width: 100%;
      box-sizing: border-box;
      margin-top: 10px;
      color: #000000;
    }

    .content {
      text-align: center;
      padding: 20px;
      height: 80%;
      width: 40%;
      background-color: #1c1c1e;
      border-color: #FFFFFF;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
      border-width: 10px;
      color: #FFFFFF;
      overflow-y: auto;
    }

    .content::-webkit-scrollbar {
      display: none;
    }

    .button {
      display: inline-block;
      padding: 10px 20px;
      background-color: #FFFFFF; 
      color: #000000;
      text-decoration: none;
      border-radius: 5px;
      margin-top: 20px;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    .button:hover {
      background-color: #FFFFFF;
    }

    .bullets {
      text-align: left;
    }

    p {
      color: #FFFFFF;
    }
    
    </style>
  </head>
  
  <body>
    <div class="content">
      <h1>${name}</h1>
      <p>Version: 2.7.1</p>
      <a id="install-link" class="button">Default Install</a>
      <br> <br>
      ${description}
      ${selectors}
      <p style="color:grey"><i>or</i></p>
      <a type="button" class="button" onclick="encodeSelection()">Get Link</a>
      <input type="text" id="base64-result" readonly></p>
      <a id="config-install-link" class="button">Install with configuration</a>
    </div>
    <script>
      function setPluginInstallLink() {
        var currentUrl = window.location.href;
        var pluginUrl = currentUrl.replace("https://", "").replace("http://", "") + "manifest.json";
        document.getElementById('install-link').setAttribute('href', \`stremio://\${pluginUrl}\`);
      }
      function encodeSelection() {
        var currentUrl = window.location.href;
        var selected = [];
        document.querySelectorAll('#language-form input[type="checkbox"]:checked').forEach(function (checkbox) {
          selected.push(checkbox.value);
        });
        var base64Encoded = btoa(selected.join(','));
        document.getElementById('base64-result').value = \`\${currentUrl}\${base64Encoded}/manifest.json\`;
        document.getElementById('config-install-link').setAttribute('href', \`stremio://\${currentUrl.replace('http://', '').replace('https://', '')}\${base64Encoded}/manifest.json\`);
      }
      window.onload = setPluginInstallLink;
    </script>
  </body>
  </html>
  `)
})