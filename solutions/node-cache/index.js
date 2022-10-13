const express = require('express');
const path = require('path');
const NodeCache = require("node-cache");
const web = express();
const axios = require('axios')

const cache = new NodeCache({ stdTTL: 15 });

const fixedApi ='https://api.dictionaryapi.dev/api/v2/entries/en/hello'

const verifyCache = (req, res, next) => {
    try {
      const id  = fixedApi;
      if (cache.has(id)) {
        return res.status(200).json(cache.get(id));
      }
      return next();
    } catch (err) {
      throw new Error(err);
    }
  };

web.get('/', verifyCache, (req, res) => {
    axios.get(fixedApi, {})
.then((response) => {
    console.log('call ext')
    cache.set(fixedApi, response.data);
    res.json(response.data);
 
    })
})


web.listen(8001, () => console.log('start at port localhost:8001'));