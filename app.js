const express = require('express');
const app = express();

const axios = require('axios');
const cheerio = require("cheerio");

const siteUrl = "https://en.wikipedia.org/wiki/Reality";

//var nextUrl;


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

        for(var i = 0; i < 5; i++){

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




app.get('/philosophy', async (req, res) => {
    console.log('Fetching data');

    var output = '';
    var counter = 0;
    var url = 'https://en.wikipedia.org/wiki/Object_(philosophy)';


    // for testing purposes, only go 5 pages deep
    while(counter < 20) {

        // grab the html for the page
        var $ = await fetchData(url);

        // grab an array of all the paragraphs on the page - this is where we want to search for links
        var paragraphs = $('p', '.mw-parser-output');
        var links = [];

        // go through paragraphs and find the children of each
        for(var i = 0; i < paragraphs.length; i++){

            // go through children and find the links of each
            var children = paragraphs[i].children;
            for(var j = 0; j < children.length; j++){

                // if the link does NOT go to a definition or link to section of the page - add it to the list
                var curr = children[j];
                if(curr.name == 'a') {

                    // definitions begin with "wikt" in their title -> for example: 'wikt:entity' would lead to a definition
                    if(curr.attribs.title){
                        if(curr.attribs.title.indexOf('wikt') == -1){
                            console.log(curr.attribs.href);
                            links.push([curr.attribs.title, curr.attribs.href]);
                        }
                    } 
                }
            }
        }

        console.log('\n\n\n\n');

        output += `${links[0][0]} ------> `;

        // visit the first link and repeat
        url = 'https://en.wikipedia.org' + links[0][1];
        counter++;
    }

    res.send(output);
});