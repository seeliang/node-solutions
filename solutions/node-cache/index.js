const express = require('express');
const path = require('path');
const web = express();
const axios = require('axios')

web.get('/', (req, res) => {
    axios.get('https://api.dictionaryapi.dev/api/v2/entries/en/hello', {})
.then(function(response) {
    res.json(response.data);
 
    })
})


web.listen(8001, () => console.log('start at port localhost:8001'));