const express = require('express');
const app = express();

const axios = require('axios');
const cheerio = require("cheerio");

const siteUrl = "https://en.wikipedia.org/wiki/Reality";

var nextUrl;


const port = process.env.PORT || 3000;
app.listen(port, ()=> {
    console.log(`listening on port ${port}`)
})

const fetchData = async (url) => {
  const result = await axios.get(url);
  return cheerio.load(result.data);
};


app.get('/', async (req, res) => {
    console.log('Fetching data');
    var $ = await fetchData(siteUrl);

    var links = $('a', '.mw-parser-output');

    // console.log(links.length);

    for(var i = 0; i < 20; i++){
        // if the link has a class, it's a redirect
        if(!links[i].attribs.class) {
            // if the link has no title, it's a citation
            if(links[i].attribs.title) {
                console.log(links[i].attribs.title);

                // set the next url
                nextUrl = `https://en.wikipedia.org/${links[i].attribs.href}`;
                break;
            }
        }
    }

    counter = 0;

    while(counter < 20) {

        $ = await fetchData(nextUrl);
        links = $('a', '.mw-parser-output');

        for(var i = 0; i < 20; i++){
            // if the link has a class, it's a redirect
            if(!links[i].attribs.class) {
                // if the link has no title, it's a citation
                if(links[i].attribs.title) {
                    console.log(links[i].attribs.title);
    
                    // set the next url
                    nextUrl = `https://en.wikipedia.org/${links[i].attribs.href}`;
                    break;
                }
            }
        }
        counter++;
    }
    
    res.send('test');

    //redirect to new page with the next async request
});