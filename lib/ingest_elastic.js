var _ = require("highland")
var fs = require("fs")
var jsonStream = require("jsonStream")

var elasticsearch = require("elasticsearch")


module.exports = exports = {}


exports.ingest = function(){

	var total = 0

	var body = {
		item:{
			properties:{
				'record-hash'    : {"type" : "string", "index" : "not_analyzed"},
				object        	 : {"type" : "string", "index" : "not_analyzed"},
				isShownAt        : {"type" : "string", "index" : "not_analyzed"},
				title            : {"type" : "string", "index" : "analyzed", "fields": { "folded": { "type": "string", "analyzer": "default" } } },
				description      : {"type" : "string", "index" : "analyzed", "fields": { "folded": { "type": "string", "analyzer": "default" } } },
				subjects      : {"type" : "string", "index" : "analyzed", "fields": { "folded": { "type": "string", "analyzer": "default" } } }
			}
		}
	}

	function index(items, callback) {
		total = total+items.length
		var body = []
		items.forEach((item) => {
			body.push( { index:  { _index: 'umbra', _type: 'item'} })
			body.push(item)
		})
		client.bulk({
			body: body
		}, function (err, resp) {
			if (err) {
				callback(err)
			} else if (resp.errors){
				callback(resp.errors)
			} else {
				callback()
			}
			console.log("Posted",total)
		})
	}


	var client = new elasticsearch.Client({
		host: "localhost:9200"
	})

	client.indices.delete({
		index: 'umbra'
	}, function(err, res) {


		client.indices.create({
	    	index: 'umbra',
	    	body: {
	    		settings: {
	    			analysis: {
	    				analyzer: {
							default: {
							  tokenizer: "standard",
							  filter:  [ "lowercase", "asciifolding"]
							}
	    				}
	    			}
	    		}
	    	}
		}, function(err, res) {
			client.indices.putMapping({index:"umbra", type:"item", body:body},function(err,res){
				if (err) console.log(err)
				var files = ["UMBRA_dataset1.json",	"UMBRA_dataset2.json",	"UMBRA_dataset3.json",	"UMBRA_dataset4.json",	"UMBRA_dataset5.json"]
				files.forEach( (file) =>{
					_(fs.createReadStream(`./data/${file}`))
						.through(jsonStream.parse('*'))
						.map((x) => {
							return {
								'record-hash': (x.attributes && x.attributes['record-hash']) ? x.attributes['record-hash'] : null,
								object : (x.attributes && x.attributes.metadata && x.attributes.metadata.object) ? x.attributes.metadata.object : null,
								isShownAt : (x.attributes && x.attributes.metadata && x.attributes.metadata.isShownAt) ? x.attributes.metadata.isShownAt : null,
								title : (x.attributes && x.attributes.metadata && x.attributes.metadata.sourceResource && x.attributes.metadata.sourceResource.title) ? x.attributes.metadata.sourceResource.title : null,
								description : (x.attributes && x.attributes.metadata && x.attributes.metadata.sourceResource && x.attributes.metadata.sourceResource.description) ? x.attributes.metadata.sourceResource.description : null,
								subjects : (x.attributes && x.attributes.metadata && x.attributes.metadata.sourceResource && x.attributes.metadata.sourceResource.subject) ? x.attributes.metadata.sourceResource.subject.map((s)=>{ if (s.name) return s.name  }).join(" | ") : null
							}
						})
						.batch(999)
						.map(_.curry(index))
						.nfcall([])
						.series()
						.done(function() {
							console.log("Done")
						})
				})
			})

		})
	})


}