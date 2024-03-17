const manifest = [
    {
       "manifest":{
          "id":"com.stremify",
          "version":"2.6.0",
          "catalogs":[
             
          ],
          "resources":[
             "stream"
          ],
          "types":[
             "movie",
             "series"
          ],
          "name":"Stremify",
          "description":"A plugin that allows you to directly stream content from multiple different sources.",
          "idPrefixes":[
             "tt"
          ],
          "logo":"https://i.ibb.co/GWB1pwy/160156210.png"
       },
       "transportName":"http",
       "transportUrl":"http://localhost:3000/manifest.json"
    }
 ]

export default eventHandler((event) => {
    return(manifest)
})