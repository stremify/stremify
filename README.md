<h1 align="center">
  <img src="https://avatars.githubusercontent.com/u/160156210?s=200&v=4" alt="isolated logo" width="100"/>
  <p>Stremify</p>
</h1>
<p align="center">A selfhosted addon for Stremio allowing for streaming from numerous different sources via @movie-web/providers.</p>
<h2 align="center"> Getting Started </h2>
Getting started is simple, you can either host it directly via Node, or host on <a href="https://nitro.unjs.io/deploy#zero-config-providers">any of the Nitro zero-config providers</a> (note that hosting on Cloudflare workers may cause Showbox to not work).
<br> <br>
Once you have chosen a provider, you would need to configure the following within the environmental variables as seen in the <b>example.env</b> file:
<br> <br>
- TMDB_API_KEY: your TMDB API KEY
<br>
- isPrivate: true/false - set to true if you want to prevent unauthorised usage by requiring access tokens
<br>
- access_tokens: array - an array of access tokens, only works if isPrivate is set to true
<br><br>
