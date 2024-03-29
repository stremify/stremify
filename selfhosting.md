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

Once you have chosen a provider, follow the steps on the provider's website, if it asks you for environmental variables, refer to the last section.

## Hosting on Vercel
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fstremify%2Fstremify)

We recommend hosting on Vercel as it is by far the easiest way to go about self-hosting.


Once you have clicked on the button above, name your respository and set it to private.
![image](https://github.com/stremify/stremify/assets/53519839/128e290a-e1e8-45cb-8f41-0d8a70c15e2f)

Next, press the deploy button and wait for Stremify to be built, once built you will be redirected to this page. Click on the "Continue to dashboard" button.

![image](https://github.com/stremify/stremify/assets/53519839/1c9af257-6270-4712-9afe-e5955b78e52b)

Go to the settings tab.
![image](https://github.com/stremify/stremify/assets/53519839/8d8a27b0-df0c-46e7-b08a-0b56bc1e8a0f)

Go to "Environment Variables".
![image](https://github.com/stremify/stremify/assets/53519839/e5843253-fcb3-4148-8484-70851500e064)

If you want to scrape English providers, now is the time to register for a TMDB API key, we reccomend following the guide from [movie-web](https://movie-web.github.io/docs/client/tmdb). (**IMPORTANT: The TMDB_API_KEY variable currently requires the TMDB API KEY, not the API Read Access Token.**)

Other than that, here is how you can fill in your environmental vairables.
![image](https://github.com/stremify/stremify/assets/53519839/45c534d8-7569-4db0-b644-edc0a692157e)

Once you filled in your environmental variables, go to deployments.
![image](https://github.com/stremify/stremify/assets/53519839/e7f1cd2e-ddff-4f92-8df7-03b062ad6a80)

Find the latest deployment and click on the "Redeploy" button. (**do not use existing build cache**)
![Screenshot 2024-03-29 at 4 43 26](https://github.com/stremify/stremify/assets/53519839/b0911020-bb6e-4470-ad7d-249060a1c298)

You can now find your instance's URL by going to the Projects tab.
![image](https://github.com/stremify/stremify/assets/53519839/90894f24-cdec-489f-a28d-8c4675574d7c)


## .env
For faster setup you are also able to copy the ``example.env`` and fill out the details directly from there.

```.env
TMDB_API_KEY="your tmdb api key, this is only needed if you are also scraping English providers"
scrape_english="true/false - disables or enables English providers, TMDB API KEY needed if this is set to true"
foreign_provider_languages="de,it,fr,es - list of languages that you want your instance to scrape, no commas in between the languages"
```
