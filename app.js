const express = require('express');
const app = express();

const axios = require('axios');
const cheerio = require("cheerio");

const siteUrl = "https://en.wikipedia.org/wiki/Reality";

const port = process.env.PORT || 3000;
app.listen(port, ()=> {
    console.log(`listening on port ${port}`)
})

const fetchData = async () => {
  const result = await axios.get(siteUrl);
  return cheerio.load(result.data);
};


app.get('/', async (req, res) => {
    console.log('Fetching data');
    const $ = await fetchData();

    var textArray = $('a', '.mw-parser-output');

    console.log(textArray.length);
    console.log(textArray[1]);
    
    res.send('test');
});