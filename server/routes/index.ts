export default eventHandler((event) => {

  return(`<!DOCTYPE html>
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
      <p>Version: 2.6.0</p>
      <a id="install-link" class="button">Installation Method One</a>
      <a id="alt-install-link" class="button">Installation Method Two</a>
    </div>
  
    <script>
      function setPluginInstallLink() {
        var currentUrl = window.location.href;
        var pluginUrl = currentUrl.replace("https://", "").replace("http://", "") + "manifest.json";
        var pluginUrlAlt = currentUrl.replace("https://", "").replace("http://", "") + "catalog.json";
      document.getElementById('install-link').setAttribute('href', \`stremio://\${pluginUrl}\`);
      document.getElementById('alt-install-link').setAttribute('href', \`stremio://\${pluginUrlAlt}\`);
      }
      window.onload = setPluginInstallLink;
    </script>
  </body>
  
  </html>
  `)
});