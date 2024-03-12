const manifest = {
	"id": "com.stremify",
	"version": "2.5.0",
	"catalogs": [],
	"resources": [
		"stream"
	],
	"types": [
		"movie",
		"series"
	],
	"name": "Stremify",
	"description": "",
	"idPrefixes": [
		"tt"
	]
}

export default eventHandler((event) => {
    return manifest;
  });
  