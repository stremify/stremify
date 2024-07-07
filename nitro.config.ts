//https://nitro.unjs.io/config

export default defineNitroConfig({
  srcDir: "server",
  experimental: {
    websocket: true,
  },
});
