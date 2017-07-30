$(document).ready(function() {
    var body = document.getElementsByTagName("body")[0];
    body.innerHTML = "<div>" +
    "<section class='hero is-dark is-bold' id='main-hero'>" +
    "<div class='hero-head'>" +
    "<header class='nav'><div class='container'>" +
    "<div class='nav-left'><a class='nav-item' href='#'>Hurricane Music</a></div>" +
    "<div class='nav-right'>" +
    "<a class='nav-item' href='https://discordapp.com/api/oauth2/authorize?client_id=295593778633375744&scope=bot&permissions=8'>Invite</a>" +
    "<a class='nav-item' href='https://discord.gg/uDpAgVg'>Support</a>" +
    "</div>" +
    "</div></header>" +
    "</div>" +
    "<div class='hero-body'><div class='container'>" +
    "<h1 class='title'>Hurricane Music Control <span class='tag'>Beta</span></h1>" +
    "<h2 class='subtitle'>No need to memorize any commands.</h2>" +
    "</div></div>" +
    "<div class='hero-foot'>" +
    "<nav class='tabs is-boxed'><div class='container' id='nav-tabs'>" +
    "<ul><li"+(tab == "choose" ? " class='is-active'" : "")+"><a"+(tab == "manage" ? " onclick='choose()'" : "")+">Choose Songs</a></li><li"+(tab == "manage" ? " class='is-active'" : "")+"><a"+(tab == "choose" ? " onclick='manage()'" : "")+">Manage</a></li></ul>" +
    "</div></nav>" +
    "</div>" +
    "</section>" +
    "<div id='tab-body'></div>";
    update();
});
let token = getCookie("token");
if(token == null) {
    window.location.href = "/login/?next="+encodeURIComponent("/music/"+serv);
}
function validateToken() {
    $.ajax("/api/tokenvalid?token="+encodeURIComponent(token)+"&for=music").then(function(e) {
        if(!e.valid) window.location.href = "/login/?next="+encodeURIComponent("/music/"+serv);
    });
}
validateToken();

var searchResults = "<tr><td>Enter an item to search for</td><td>--</td><td></td></tr>";
var lsearch = "";
var tab = "choose";
var tl = tab;
let canManage = false;

function tabswitch() {var body = document.getElementById("nav-tabs"); if(body != null) {var ts =
    "<ul><li"+(tab == "choose" ? " class='is-active'" : "")+"><a"+(tab == "manage" ? " onclick='choose()'" : "")+">Choose Songs</a></li><li"+(tab == "manage" ? " class='is-active'" : "")+"><a"+(tab == "choose" ? " onclick='manage()'" : "")+">Manage</a></li></ul>";
    if(ts != body.innerHTML) body.innerHTML = ts;} else {body = document.getElementsByTagName("body")[0];}};

function update() {
    var body = document.getElementsByTagName("body")[0];
    $.ajax('/mapi/' + serv, {statusCode: {404: function() {
        body.innerHTML = "<section class='hero is-danger is-fullheight'>" +
            "<div class='hero-body'>" +
            "<div class='container'>" +
            "<h1 class='title'>Guild Not Found</h1>" +
            "<h2 class='subtitle'>Either the guild has ran off, or it doesn't exist at all. That's up for you to decide, though.</h2>" +
            "</div>" +
            "</div>" +
            "</section>";
    }}, headers: {Authorization: token}}).then(function (data) {
        if (!data.connected) {
            body.innerHTML = "<section class='hero is-danger is-fullheight'>" +
                "<div class='hero-body'>" +
                "<div class='container'>" +
                "<h1 class='title'>Not connected</h1>" +
                "<h2 class='subtitle'>Hurricane is not connected to this server. Join a voice channel and use ..\\music to begin.</h2>" +
                "</div>" +
                "</div>" +
                "</section>";
            return;
        }
        canManage = data.canManage;
        if(tl != tab) tabswitch();
        tl = tab;
        renderTabs(data, document.getElementById("tab-body"));
    });
}

function renderTabs(data, elm) {
    if(tab == "choose") {
        var queued = "";
        var isFirst = true;
        var num = 0;
        data.queue.forEach(function (e) {
            queued += "<div class='panel-block" + (isFirst ? ' is-active' : '') + "'>" +
                (isFirst ? "Now Playing" : "#" + num) + " - " + htmlEncode(e.title) +
                "</div><div class='panel-block'><p style='margin-left: 30px;'><small><i>Queued by "+htmlEncode(e.user.name)+"#"+htmlEncode(e.user.discriminator)+"</i></small></p></div>";
            isFirst = false;
            num++;
        });
        if (data.queue == 0) {
            queued += "<div class='panel-block" + (isFirst ? ' is-active' : '') + "'>" +
                "Nothing queued." +
                "</div>";
        }
        elm.innerHTML =
            "<div class='container' style='margin-top: 50px;'><div class='columns'>" +
            "<div class='column is-half'><nav class='panel'>" +
            "<p class='panel-heading'>Song Queue</p>" +
            "<div class='panel-block'>" +
            "<progress class='progress' value='"+data.percentage*100+"' max='100'>"+data.percentage*100+"%</progress>" +
            "</div>" +
            queued +
            "<div class='panel-block'>" +
            "<button class='button is-fullwidth is-dark' onClick='update()'>Refresh Queue</button>" +
            "</div>" +
            "</nav></div>" +
            "<div class='column is-half'><div class='card'>" +
            "<header class='card-header'><p class='card-header-title'>Choose Song</p></header>" +
            "<div class='card-content'>" +
            "<div class='columns'><div class='column is-one-quarter'><img src='/static/YouTube.png' height='100' /></div><div class='column' style='display: flex; align-items: center;'><input type='text' value='" + lsearch + "' class='input' id='search_box' /></div><div class='column is-one-quarter' style='display: flex; align-items: center;'><button class='button is-fullwidth' onClick='search()'>Search</button></div></div>" +
            "<table class='table'>" +
            "<thead><tr><th>Name</th><th>Uploaded By</th><th>Actions</th></tr></thead>" +
            "<tbody>" + searchResults + "</tbody>" +
            "</table>" +
            "</div>" +
            "</div></div>" +
            "</div></div>" +
            "</div>";
        //console.log(document.getElementById("main-hero").id);
    } else if(tab == "manage") {
        elm.innerHTML = "<div class='container' style='margin-top: 50px;'>" +
            "<div class='columns'>" +
            "<div class='column is-half'>" +
            "<div class='card'>" +
            "<header class='card-header'><p class='card-header-title'>Volume</p></header>" +
            "<div class='card-content'>" +
            "<div class='columns'>" +
            "<div class='column'><input type='range' id='volumecontrol' style='width: 100%' value='"+data.volume+"' onchange='updatevolume()' oninput='updatevolumedisp()' /></div>" +
            "<div class='column is-one-quarter has-text-centered'><span id='volumedisplay'>"+data.volume+"%</span></div>" +
            "</div>" +
            "</div>" +
            "</div>" +
            "</div>" +
            "<div class='column is-half'>" +
            "" +
            "</div>" +
            "</div>" +
            "</div>";
    }
    if(data.playing) document.getElementById("main-hero").className = "hero is-primary is-bold";
    if(!data.playing) document.getElementById("main-hero").className = "hero is-dark is-bold";
}

function updatevolumedisp() {
    document.getElementById("volumedisplay").innerHTML = document.getElementById("volumecontrol").value+"%";
}

function updatevolume() {
    $.ajax("/mapi/"+encodeURIComponent(serv)+"/volume", {method: "PATCH", headers: {Authorization: htmlEncode(getCookie("token"))}, data: JSON.stringify({volume: document.getElementById("volumecontrol").value}), contentType: "application/json"});
}

function search() {
    var searchFor = document.getElementById("search_box").value;
    lsearch = searchFor;
    if(searchFor == "") {
        searchResults = "<tr><td>Enter an item to search for</td><td>--</td><td></td></tr>";
        update();
        return;
    }
    $.ajax("/mapi/ytsearch?q="+encodeURIComponent(searchFor), {headers: {Authorization: token}}).then(function(e) {
        searchResults = "";
        e.items.forEach(function(i) {
            searchResults += "<tr><td>"+i.snippet.title+"</td><td>"+i.snippet.channelTitle+"</td><td><button class='button' onClick='add(\""+i.id.videoId+"\")'>Queue</button></td></tr>"
        });
        if(e.items.length == 0) {
            searchResults = "<tr><td>No results.</td><td>--</td><td></td></tr>";
        }
        update();
    });
}

function manage() {
    if(!canManage) {
        alert("You don't have permission to do that.");
        return;
    }
    tab = "manage";
    update();
}
function choose() {
    tab = "choose";
    update();
}

function add(id) {
    $.ajax("/mapi/"+encodeURIComponent(serv)+"/queue", {headers: {Authorization: token}, method: "PUT", contentType: "application/json", data: JSON.stringify({id: id})}).then(function(e) {
        update();
        alert("Queued.");
    });
}

// Third-party functions

function htmlEncode(value){
    //create a in-memory div, set it's inner text(which jQuery automatically encodes)
    //then grab the encoded contents back out.  The div never exists on the page.
    return $('<div/>').text(value).html();
}

function htmlDecode(value){
    return $('<div/>').html(value).text();
}

function getCookie(name) {
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
}