const express = require('express');
const app = express();

const axios = require('axios');
const cheerio = require("cheerio");

const { createQueue } = require('./funcs.js');


const player = require("play-sound")();


const port = process.env.PORT || 3000;
app.listen(port, ()=> {
    console.log(`listening on port ${port}`)
})

const fetchData = async (url) => {
  const result = await axios.get(url);
  return cheerio.load(result.data);
};


/* 

Bidirection Search Algorithm which finds the shortest path between the start and destination pages

*/




app.get('/', async (req, res) => {
    console.log('Fetching data');

    var oneUrl = '/wiki/Masquerade_ceremony';
    var twoUrl = '/wiki/Pineapple_juice';

    var startUrl = 'https://en.wikipedia.org' + oneUrl;
    var endUrl = 'https://en.wikipedia.org' + twoUrl;

    var startQueue = [];
    var endQueue = [];

    var startVisited = [];
    var endVisited = [];

    var b = true;
    var check;

    while(b) {

        // grab the html for the start page
        var $ = await fetchData(startUrl);

        // create array of all the paragraphs on the page
        var paragraphs = $('p', '.mw-parser-output');

        // use the paragraphs array to find the links and add them to the queue
        var temp = createQueue(paragraphs, startUrl);
        startQueue = startQueue.concat(temp);


        /*
            find the next link that has NOT been visited
            check to see if this link is in the end queue
                if it is, we have found the common path
                if not, continue on
        */

        var flag = 1;
        var next;

        // find the next link that has NOT already been visited
        while(flag) {
            next = startQueue.shift();
            flag = startVisited.find(element => element[1] == next[1]);
        }

        // add this link to the array of visited sites so we don't go there again
        startVisited.push(next);
        console.log(next);

        // set the next URL to be visited
        startUrl = 'https://en.wikipedia.org' + next[1];

        // check to see if the link is in the end queue 
        check = endQueue.find(element => element[1] == next[1]);

        // if the link was in the end queue, then we have discovered a common path
        if(check){
            console.log(check);
            // break the loop - we have finished traversing pages
            b = false;
        }

        if(b){


            // grab the html for the destination page
            var $ = await fetchData(endUrl);

            // create an array of all the paragraphs on the page
            var paragraphs = $('p', '.mw-parser-output');

            // use the paragraphs array to find the links on the page and add them to the queue
            var temp = createQueue(paragraphs, endUrl);
            endQueue = endQueue.concat(temp);



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

        // add the link to the list of visited pages
        endVisited.push(next);
        console.log(next);

        // set the next URL to be visited
        endUrl = 'https://en.wikipedia.org' + next[1];

        // check to see if the link is in the startQueue
        check = startQueue.find(element => element[1] == next[1]);

        // if the link is in the start queue - we have found a common path
        if(check){
                console.log(check);
                // break the loop - we have finished traversing pages
                b = false;
        } 

        }
    }


    // find the path from the common page back to startUrl

    console.log(check);
    var search = check[1];
    var startArray = [];
    var found;
    var searchVisited = [];

    while(search !== oneUrl) {
       
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

    // find the path from the common page back to endUrl

    var search = check[1];
    var endArray = [];
    var index;
    var found;
    searchVisited = [];

    while(search !== twoUrl) {

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


    // generate the ouput to send to the page

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

var notes = ["a-3.mp3", "a-4.mp3", "a-5.mp3", "a3.mp3", "a4.mp3", "a5.mp3", "b3.mp3", "b4.mp3", "b5.mp3", "c-3.mp3", "c-4.mp3", "c-5.mp3", "c3.mp3", "c4.mp3", "c5.mp3", "c6.mp3", "d-3.mp3", "d-4.mp3", "d-5.mp3", "d3.mp3", "d4.mp3", "d5.mp3", "e3.mp3", "e4.mp3", "e5.mp3", "f-3.mp3", "f-4.mp3", "f-5.mp3", "g-3.mp3", "g-4.mp3", "g-5.mp3", "g3.mp3", "g4.mp3", "g5.mp3"];


/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 * The value is no lower than min (or the next integer greater than min
 * if min isn't an integer) and no greater than max (or the next integer
 * lower than max if max isn't an integer).
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateSong(notes) {
    var song = [];

    for(var i = 0; i < 4; i++){
        var base = getRandomInt(1, notes.length - 2);
        song.push(base - 1);
        song.push(base);
        song.push(base + 1);
    }

    return song;
}

app.get('/sound', async (req, res) => {

    var index = 0;
    var offset = 1;

    setInterval(function(){ 
        
        player.play(`./media/${notes[index]}`, (err) => {
            if(err) {
                console.log("error");
            }
        });
        index += offset;
        if(index == notes.length  || index == 0){
            offset = -offset;
        }
    }, 100);
})