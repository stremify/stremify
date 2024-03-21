import { buildHTMLselectors } from "../additional-sources/languages/id-based-scraper"
let section = null;

export default eventHandler(async (event) => {
  if (section == null) {
      section = await buildHTMLselectors()
  }
  return (`
  <html lang="en">

  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Stremify</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100vh;
        margin: 0;
        background-color: #f0f0f0;
      }
  
      #base64-result {
        font-family: 'Courier New', Courier, monospace;
        background-color: #f9f9f9;
        border: 1px solid #ccc;
        border-radius: 4px;
        padding: 8px;
        width: 100%;
        box-sizing: border-box;
        margin-top: 10px;
      }
  
      .content {
        text-align: center;
        max-width: 600px;
        padding: 20px;
        background-color: white;
        border-radius: 10px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
  
      .button {
        display: inline-block;
        padding: 10px 20px;
        background-color: #0084ff;
        color: white;
        text-decoration: none;
        border-radius: 5px;
        margin-top: 20px;
        cursor: pointer;
      }
  
      p {
        color: #333;
      }
    </style>
  </head>
  
  <body>
    <div class="content">
      <h1>Stremify</h1>
      <p>Version: 2.7.0</p>
      <a id="install-link" class="button">Default Install (English Only)</a>
      <p style="color:grey"><i>or</i></p>
      ${section}
      <button type="button" class="button" onclick="encodeSelection()">Get Link</button>
      <input type="text" id="base64-result" readonly></p>
      <a id="config-install-link" class="button">Install with configuration</a>
      <hr>
      <p style="color: grey;"><i>Made with ❤️, open source on <a href="https://github.com/stremify/stremify"
            style="color: grey;">GitHub</a></i></p>
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