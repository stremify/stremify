const manifest = {
	"id": "com.stremify",
	"version": "2.6.0",
	"catalogs": [],
	"resources": [
		"stream"
	],
	"types": [
		"movie",
		"series"
	],
	"name": "Stremify",
	"description": "A multi-server streaming addon.",
	"idPrefixes": [
		"tt"
	],
	"logo": "https://i.ibb.co/GWB1pwy/160156210.png"
}

export default eventHandler((event) => {

	setHeader(event, 'Access-Control-Allow-Origin', '*'); // Allow any domain
	setHeader(event, 'Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
	setHeader(event, 'Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return manifest;
  });
  