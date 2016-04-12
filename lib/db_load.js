var _ = require("highland")
var fs = require("fs")
var MongoClient = require('mongodb').MongoClient



module.exports = exports = function(){



	MongoClient.connect("mongodb://localhost:27017/lj", function(err, db) {

		db.collection('umbraMatches').drop(() => {

			var collection = db.collection('umbraMatches')


			function insert(items, callback) {


				var bulk = collection.initializeUnorderedBulkOp()

				items.forEach(function(b){
					bulk.insert(b)
				})
				bulk.execute((err,results) =>{
					callback(err,results)
				})


			}





			collection.createIndex("hash", {background: true })
			collection.createIndex("uri", {background: true })
			collection.createIndex("random", {background: true })
			collection.createIndex("complete", {background: true })



			_(fs.createReadStream('./results/matches.ndjson'))
				.split()
				.compact()
				.map(JSON.parse)
				.map( (x) => {


					var results = x.hits.map((hit) => {
						if (hit.highlight['title.folded']){
							hit.highlight['title.folded'].forEach( (phrase) => {
								hit.source.title = hit.source.title.replace( phrase.replace(/<em>|<\/em>/gi,''), phrase)
							})
						}

						if (hit.highlight['description.folded']){
							hit.highlight['description.folded'].forEach( (phrase) => {
								hit.source.description = hit.source.description.replace( phrase.replace(/<em>|<\/em>/gi,''), phrase)
							})
						}

						if (hit.highlight['subjects.folded']){
							hit.highlight['subjects.folded'].forEach( (phrase) => {
								hit.source.subjects = hit.source.subjects.replace( phrase.replace(/<em>|<\/em>/gi,''), phrase)
							})

						}

						return {
							name: x.ljData.name,
							uri: x.ljData.uri,
							hash: hit.source['record-hash'],
							object: hit.source.object,
							isShownAt: hit.source.isShownAt,
							title: hit.source.title,
							description: hit.source.description,
							subjects: hit.source.subjects,
							complete: false,
							random: Math.floor(Math.random() * (100000 - 1)) + 1
						}


					})
					return results

				})
				.map(_.curry(insert))
				.nfcall([])
				.series()
				.done(()=> { console.log("Done!"); db.close() })

			})

	})



}