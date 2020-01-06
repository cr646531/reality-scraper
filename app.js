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
                                console.log(curr);
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



app.get('/bidirectional', async (req, res) => {
    console.log('Fetching data');

    var startOutput = '';
    var endOutput = '';

    var output = '';

    var oneUrl = '/wiki/Lil_Jon';
    //var twoUrl = '/wiki/Reality';
    //var twoUrl = '/wiki/Winona_Ryder';
    var twoUrl = '/wiki/Brick';

    var startUrl = 'https://en.wikipedia.org' + oneUrl;
    var endUrl = 'https://en.wikipedia.org' + twoUrl;

    var startQueue = [];
    var endQueue = [];

    var startVisited = [];
    var endVisited = [];

    var b = true;
    var check;

    while(b) {

        /*
            visit the next page in the start queue and push all the links on the queue 
        */

        // grab the html for the start page
        var $ = await fetchData(startUrl);

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

                    // if the link does NOT go to a definition, portal, or redirect - add it to the list
                    var curr = children[j];
                    if(curr.name == 'a') {

                        if(curr.attribs.title){
                            // definitions begin with "wikt" in their title -> for example: 'wikt:entity' would lead to a definition
                            // portal links begin with "Portal" in their title
                            if(curr.attribs.title.indexOf('wikt') == -1 && curr.attribs.title.indexOf('Portal') == -1 && curr.attribs.class !== 'mw-redirect'){
                                startQueue.push([curr.attribs.title, curr.attribs.href, startUrl.slice(24)]);
                            }
                        } 
                    }
                }
            }
        }

        /*
            find the next link that has NOT been visited
            check to see if this link is in the end queue
                if it is, we have our path
                if not, continue on
        */

        var flag = 1;
        var next = 0;

        // find the next link that has NOT already been visited
        while(flag) {
            next = startQueue.shift();
            flag = startVisited.find(element => element[1] == next[1]);
        }

        startVisited.push(next);
        console.log(next);
        startUrl = 'https://en.wikipedia.org' + next[1];
        startOutput += `${next[0]} --------> `;

        check = endQueue.find(element => element[1] == next[1]);
        if(check){
            b = false;
            output = check;
            //startOutput += `${endQueue[check]}`;
        }

        // ----------------------------- //



        // grab the html for the destination page
        var $ = await fetchData(endUrl);

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
                            if(curr.attribs.title.indexOf('wikt') == -1 && curr.attribs.title.indexOf('Portal') == -1 && curr.attribs.class !== 'mw-redirect'){
                                endQueue.push([curr.attribs.title, curr.attribs.href, endUrl.slice(24)]);
                            }
                        } 
                    }
                }
            }
        }

        /*
            find the next link that has NOT been visited
            check to see if this link is in the end queue
                if it is, we have our path
                if not, continue on
        */

       var flag = 1;
       var next = 0;

       // find the next link that has NOT already been visited
       while(flag) {
           next = endQueue.shift();
           flag = endVisited.find(element => element[1] == next[1]);
       }

       endVisited.push(next);
       console.log(next);
       endUrl = 'https://en.wikipedia.org' + next[1];
       endOutput = `${next[0]} <-------- ` + endOutput;

       check = startQueue.find(element => element[1] == next[1]);
       if(check){
           b = false;
           //endOutput += `${startQueue[check]}`;
           output = check;
       } 
    }

    // find path from check back to startUrl

    var search = check[1];
    var startArray = [];
    var index;
    var found;

    console.log('\n\n\n\n--------------\n\n\n\n');

    console.log(search);

    var searchVisited = [];

    while(search !== oneUrl) {
        // find the index of search within the start queue
        found = startQueue.find(element => element[1] == search && !searchVisited.includes(element[1]));

        if(found) {
            startArray.unshift(found);
            if(found[2]) {
                search = found[2];
            }
        } else {
            found = startVisited.find(element => element[1] == search);
            
            if(found) {
                startArray.unshift(found);
                if(found[2]) {
                    search = found[2];
                }
            }
        }
        searchVisited.push(search);
    }

    // find path from check to endUrl

    var search = check[1];
    var endArray = [];
    var index;
    var found;
    searchVisited = [];

    while(search !== twoUrl) {
        // find the index of search within the start queue
        found = endQueue.find(element => element[1] == search && !searchVisited.includes(element[1]));

        if(found) {
            endArray.push(found);
            if(found[2]) {
                search = found[2];
            }
        } else {
            found = endVisited.find(element => element[1] == search);
            
            if(found) {
                endArray.push(found);
                if(found[2]) {
                    search = found[2];
                }
            }
        }
        searchVisited.push(search);
    }


    var start = oneUrl.slice(6);
    var copyStart = "";

    for(var i = 0; i < start.length; i++){
        if(start[i] == '_'){
            copyStart += ' ';
        } else {
            copyStart += start[i];
        }

    }

    var end = twoUrl.slice(6);
    var copyEnd = "";
    for(var i = 0; i < end.length; i++){
        if(end[i] == '_'){
            copyEnd += ' ';
        } else {
            copyEnd += end[i];
        }
    }

    var output = copyStart;
    for(var i = 0; i < startArray.length; i++){
        output = output + '   ----->   ' + startArray[i][0]; 
    }
    for(var i = 1; i < endArray.length; i++){
        output = output + '   <-----   ' + endArray[i][0];
    }
    output = output + '   <-----   ' + copyEnd;



    res.send(output);
});