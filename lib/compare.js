var _ = require("highland")
var fs = require("fs")
var jsonStream = require("jsonStream")
var elasticsearch = require("elasticsearch")


module.exports = exports = {}


exports.compare = function(){


	var client = new elasticsearch.Client({
		host: "localhost:9200"
	})


	function search(ljData, callback) {

		var body = {
		  "query": {
		    "bool": {
		      "should": [
		        {
		          "match_phrase": {
		            "description.folded": {
		              "query": ljData.nameClean,
		              "slop": 3
		            }
		          }
		        },
		        {
		          "match_phrase": {
		            "title.folded": {
		              "query": ljData.nameClean,
		              "slop": 3
		            }
		          }
		        },
		        {
		          "match_phrase": {
		            "subjects.folded": {
		              "query": ljData.nameClean,
		              "slop": 3
		            }
		          }
		        }
		      ]
		    }
		  },
		  "highlight": {
		    "fields": {
		      "title.folded": {},
		      "subjects.folded": {},
		      "description.folded": {}
		    }
		  },
		  "size": 500
		}

		client.search({
			  index: 'umbra',
			  type: 'item',
			  body: body
		}).then(function (resp) {

		    var hits = resp.hits.hits.map( (hit) => { return { source: hit._source, highlight: hit.highlight }   } )

		    callback(null, { ljData: ljData, hits: hits})
		}, function (err) {
			console.log(err)
		    console.trace(err.message)

		});





	}


	var out = fs.createWriteStream('./results/matches.ndjson')

	_(fs.createReadStream('./data/LJ_namedict.json'))
		.through(jsonStream.parse('*'))
		.map((x) => {
			return {
				name: x['full name'],
				'nameClean' : x['full name'].replace(/&quot;/gi,'').replace(/&#039;/gi,'\''),
				'uri':  x['URI']
			}
		})
		.map(_.curry(search))
		.nfcall([])
		.series()
		.map((results) => {

			if (results.hits.length == 0){
				return ""
			}else if (results.hits.length == 500){
				//console.log("Greater than 500 results, not outputing!",results.ljData.name, results.ljData.uri)
				return ""
			}else{
				console.log(results.ljData.name,"\t",results.hits.length,"\t",results.ljData.uri)
				return results
			}
		})
		.compact()
		.map(JSON.stringify)
		.map((results) => {return results + '\n'})
		.pipe(out)




}
