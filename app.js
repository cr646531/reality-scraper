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


/* 

MAIN ROUTE

*/

app.get('/', async (req, res) => {
    console.log('Fetching data');

    var output = '';
    var counter = 0;
    var url = 'https://en.wikipedia.org/wiki/Object_(philosophy)';

    var visited = [];

    while(url !== 'https://en.wikipedia.org/wiki/Reality') {

        // grab the html for the page
        var $ = await fetchData(url);

        // grab an array of all the paragraphs on the page - this is where we want to search for links
        var paragraphs = $('p', '.mw-parser-output');
        var links = [];

        // go through paragraphs and find the children of each
        for(var i = 0; i < paragraphs.length; i++){

            // ignore paragraphs that are children of tables
            // the tables come before the main text on a Wikipedia page, and we want to ignore those
            if(paragraphs[i].parent.name !== 'td'){

                // go through children and find the links of each
                var children = paragraphs[i].children;
                for(var j = 0; j < children.length; j++){

                    // if the link does NOT go to a definition or portal - add it to the list
                    var curr = children[j];
                    if(curr.name == 'a') {

                        if(curr.attribs.title){
                            // definitions begin with "wikt" in their title -> for example: 'wikt:entity' would lead to a definition
                            // portal links begin with "Portal" in their title
                            if(curr.attribs.title.indexOf('wikt') == -1 && curr.attribs.title.indexOf('Portal') == -1){
                                console.log(curr.attribs.title);
                                links.push([curr.attribs.title, curr.attribs.href]);
                            }
                        } 
                    }
                }
            }
        }

        // go through the list of links, find the first link that has NOT already been visited, and go there
        for(var i = 0; i < links.length; i++){

            // check to see if the link has been visited
            var flag = visited.find(element => element == links[i][1]);

            // if the link has not been visited, add it to the history and go there
            if(!flag) {
                visited.push(links[i][1]);
                url = 'https://en.wikipedia.org' + links[i][1];
                output += `${links[i][0]} ------> `;
                break;
            }
        }

        console.log('\n\n\n\n');
        counter++;
    }

    res.send(output);
});


app.get('/breadth', async (req, res) => {
    console.log('Fetching data');

    var output = '';
    var counter = 0;
    //var url = 'https://en.wikipedia.org/wiki/Object_(philosophy)';

    var url = 'https://en.wikipedia.org/wiki/Johnny_Depp';

    var links = [];
    var visited = [];

    while(url !== 'https://en.wikipedia.org/wiki/Reality') {

        // grab the html for the page
        var $ = await fetchData(url);

        // grab an array of all the paragraphs on the page - this is where we want to search for links
        var paragraphs = $('p', '.mw-parser-output');

        // go through paragraphs and find the children of each
        for(var i = 0; i < paragraphs.length; i++){

            // ignore paragraphs that are children of tables
            // the tables come before the main text on a Wikipedia page, and we want to ignore those
            if(paragraphs[i].parent.name !== 'td'){

                // go through children and find the links of each
                var children = paragraphs[i].children;
                for(var j = 0; j < children.length; j++){

                    // if the link does NOT go to a definition or portal - add it to the list
                    var curr = children[j];
                    if(curr.name == 'a') {

                        if(curr.attribs.title){
                            // definitions begin with "wikt" in their title -> for example: 'wikt:entity' would lead to a definition
                            // portal links begin with "Portal" in their title
                            if(curr.attribs.title.indexOf('wikt') == -1 && curr.attribs.title.indexOf('Portal') == -1){
                                links.push([curr.attribs.title, curr.attribs.href]);
                            }
                        } 
                    }
                }
            }
        }
        
        var flag = 1;
        var next = 0;

        // find the next link that has NOT already been visited
        while(flag) {
            next = links.shift();
            flag = visited.find(element => element == next[1]);
        }

        visited.push(next[1]);
        console.log(next[1]);
        url = url = 'https://en.wikipedia.org' + next[1];
        output += `${next[0]} --------> `;

        counter++;
    }

    res.send(output);
});