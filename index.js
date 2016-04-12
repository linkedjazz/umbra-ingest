var ingestElastic = require("./lib/ingest_elastic")
var compare = require("./lib/compare")
var dbLoad = require("./lib/db_load")


if (process.argv[2] && process.argv[2].toLowerCase() === 'ingest') {
	ingestElastic.ingest()
}

if (process.argv[2] && process.argv[2].toLowerCase() === 'compare') {
	compare.compare()
}

if (process.argv[2] && process.argv[2].toLowerCase() === 'load') {
	dbLoad()
}





