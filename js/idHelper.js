
function makeID()
{   //http://stackoverflow.com/questions/1349404/generate-a-string-of-5-random-characters-in-javascript
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 6; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function getID()
{   
    //strip the leading slash first
    var id = window.location.pathname.substr(1);
    //strip a trailing slash, if it exists
    if (id.charAt(id.length - 1) === "/") {
        window.location.href = "../" + id.substr(0, id.length - 1);
    }
    return id;
}

function getListID() {    
    var id = getID();
    if(id) {
        return id;
    }
    else {
        window.location.href = makeID();
    }
}