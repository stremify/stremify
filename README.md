<h1 align="center">
  <img src="https://avatars.githubusercontent.com/u/160156210?s=200&v=4" alt="isolated logo" width="100"/>
  <p>Stremify</p>
</h1>
<p align="center">A selfhosted addon for Stremio allowing for streaming from numerous different sources via @movie-web/providers.</p>
<h2 align="center"> Getting Started </h2>
To get started with selfhosting, look into the <a href="https://github.com/stremify/stremify/blob/main/selfhosting.md">selfhosting.md</a> document.

V2.7 env variables:

``TMDB_API_KEY: ""``

``scrape_built_in: "true/false" ``(defaults to true, this is for the providers that are from the provider package)

``scrape_custom_providers: "true/false"`` (defaults to true, disables non-provider package providers)

``disable_same_ip_embeds: "true/false"`` (disables providers that are locked by IP, defaults to false)

``disable_websocket_proxy:"true"`` (defaults to true, disables an in-development feature that allows the server to proxy requests from the user's IP, not yet finished though)

``provider_timeout:"10000"`` (defaults to 10000, maximum amount of time a source will be waited on in ms, all sources run at the same time now so when the timeout time is reached any sources that hadn't finished yet will be marked as not having the media element and the plugin will return the response_

``cache: "true/false" `` (enables built-in caching, false by default)

``cache_time: "10800" ``(how long the cache is kept for, in seconds, defaults to 3 hrs)

``disabled_providers=""`` (disables providers based off of their IDs, you can find a list of provider IDs [here](https://github.com/stremify/stremify/blob/v2.7/server/additional-sources/languages/custom-wrapper.ts)
