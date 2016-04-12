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