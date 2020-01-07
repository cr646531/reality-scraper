
function createQueue(paragraphs, url) {

    var queue = [];

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
                        // definitions begin with "wikt" in their title
                        // portal links begin with "Portal" in their title
                        // redirects have a special class
                        if(curr.attribs.title.indexOf('wikt') == -1 && curr.attribs.title.indexOf('Portal') == -1 && curr.attribs.class !== 'mw-redirect'){
                            
                            // each element of the queue contains an array w/ the title, URL, and parent URL
                            queue.push([curr.attribs.title, curr.attribs.href, url.slice(24)]);
                        }
                    } 
                }
            }
        }
    }

    return queue;
}

module.exports = {
    createQueue
}