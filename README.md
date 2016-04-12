# umbra-ingest
Ingest the umbra data dumps to elasticsearch

This process requires elasticsearch and mongodb to be installed and running locally on the normal ports. You also need a newish >4 node and npm installed.


The data needs to be in the data/ directory, can be found here: https://www.dropbox.com/s/lr51wonmidl5bmn/umbra-ingest-data.zip?dl=0

Install the npm modules

```
npm install
```


Then run the scripts in this order

```
node index.js ingest
node index.js compare
node index.js load

```

To ingest the umbra data into elastic, compare them against LJ names, and load the results into the mongodb.

The data will be in `lj` database `umbraMatches` collections and will have these fields:

```
{
	"_id" : ObjectId("570d0c5bfc7a44727ef1444f"),
	"name" : "Eddie South",
	"uri" : "http://dbpedia.org/resource/Eddie_South",
	"hash" : "103152c56433118773a8228926010155c4dc834b",
	"object" : "//www.loc.gov/pictures/cdn/service/pnp/cph/3c00000/3c03000/3c03200/3c03244_150px.jpg",
	"isShownAt" : "//www.loc.gov/pictures/item/91732088/",
	"title" : "[African American musician, <em>Eddie</em> <em>South</em>, plays violin to white patrons at tables in New York night club]",
	"description" : null,
	"subjects" : "African Americans | Employment | Music halls | New York (State) | Photographic prints | <em>South</em>, <em>Eddie</em> | Violins",
	"complete" : false,
	"random" : 1217
}
```

`hash` is the umbra id

`object` is the direct link to the preview image

`isShownAt` is the link to the contributor
