# Selfhosting
Selfhosting Stremify is required in order to use most of the foreign providers that Stremify offers. Refer to the table in the [README.md](https://github.com/stremify/stremify/blob/main/README.md) file for more information on that.

There are 4 self-hosting methods available, depending on what your use case is:

## Starting a local-hosted instance

Ensure that NPM, Git and Node are installed on your system. Once that is done proceed with:
```sh
$ git clone stremify/stremify
$ cd stremify
$ npm i
{configure .env file to your liking}
$ npm run dev
```
Once that is done your Stremify instance will be acessible from localhost:3000. It is currently being hosted without SSL, so it will **usually not** work in browsers. If you wish to use SSL in your instance, please refer to the steps below.

## SSL via a reverse proxy
You can use SSL via a reverse proxy like [Ngrok](https://ngrok.com) or [Telebit](https://telebit.cloud), this does however open your instance to external access. (both services provide static domains, but for ngrok you need to do some additional configuration)

When choosing what protocol to forward, forward it over HTTP.
## SSL via PimpMyStremio proxy
We also offer a [PimpMyStremio](https://github.com/sungshon/PimpMyStremio/tree/master) [proxy plugin](https://github.com/stremify/stremify-ssl-mirror). This runs on the side of your Stremify instance and proxies your instance via the stremio.rocks remote proxy. You can use this if you do not wish to open up your Stremify instance to the internet. 

You may need to select the access method to LAN, in order for HTTPS to properly work.


## Remote Hosting
You are also able to host Stremify remotely on any of the [zero-config providers that Nitro provides](https://nitro.unjs.io/deploy#zero-config-providers). This will cause some of the streams provided from the custom/foreign providers to not work due to the same-IP policies, however.

Once you have chosen a provider, fork the repository and follow the steps on the provider's website, if it asks you for environmental variables, refer to the last section.

## .env
For faster setup you are also able to copy the ``example.env`` and fill out the details directly from there.

```.env
TMDB_API_KEY="your tmdb api key, this is only needed if you are also scraping English providers"
scrape_english="true/false - disables or enables English providers, TMDB API KEY needed if this is set to true"
foreign_provider_languages="de,it,fr,es - list of languages that you want your instance to scrape, no spaces in between the languages"
remote_host="true/false - disables same IP hosts for remote instances"
```
