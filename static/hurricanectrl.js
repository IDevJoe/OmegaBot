function loading(isLoading) {
    if(isLoading) {
        $(".loading").html('<div class="progress" style="position:fixed;top:55px;left:0px;right:0px;"> <div class="indeterminate"></div> </div>');
    } else {
        $(".loading").html('');
    }
}

$(document).ready(function() {
    $("#fetcherror").modal();
    if(localStorage.getItem('token') === null && window.location.href !== window.location.origin+"/login") {
        window.location.href = "/login";
        console.log("redirecting...");
    }
});

function getStats() {
    if(localStorage.getItem('token') === null) return;
    loading(true);
    $.ajax('/api/info').done(function(data) {
        $("#stats_servers_joined").html(data.serversJoined);
        $("#stats_total_channels").html(data.totalChannels);
        $("#stats_total_users").html(data.totalUsers);
        $("#stats_bot_name").html(data.botName+"#"+data.botDiscrminator);
        $("#stats_bot_id").html(data.botId);
        $("#quick_actions_invite").attr("href", "https://discordapp.com/api/oauth2/authorize?client_id="+data.botId+"&scope=bot&permissions=8");
    }).fail(function(a, b, c) {
        $("#fetcherror").modal('open');
    }).always(function() {
        loading(false);
    });
}

function shutdownBot() {
    if(localStorage.getItem('token') === null) return;
    $.ajax('/api/shutdown', {
        method: "POST",
        headers: {Authorization: localStorage.getItem("token")}
    }).done(function() {
        alert("Bot has been shut down.");
    });
}

function getGuilds() {
    if(localStorage.getItem('token') === null) return;
    loading(true);
    $.ajax('/api/guilds', {headers: {Authorization: localStorage.getItem("token")}}).done(function(data) {
        let html = "";
        data.forEach(function(d) {
            html += "<li class=\"collection-item\"><div>"+htmlEncode(d.name)+"<a href=\"#\" onclick=\"leaveServer('"+d.id+"')\" class=\"secondary-content tooltipped\" data-position='left' data-delay='50' data-tooltip='Leave Guild'><i class='material-icons'>remove_circle_outline</i></a></div></li>";
        });
        if(data.length === 0) {
            $("#guilds_collection").html("<li class='collection-item'>No guilds</li>")
        } else {
            $("#guilds_collection").html(html);
            $(".tooltipped").tooltip({delay: 50});
        }
    }).fail(function(a, b, c) {
        if(a.status === 401) {
            window.location.href="/login";
        }
        $("#fetcherror").modal('open');
    }).always(function() {
        loading(false);
    });
}

function getCommandLog() {
    if(localStorage.getItem('token') === null) return;
    loading(true);
    $.ajax('/api/commandlog', {headers: {Authorization: localStorage.getItem("token")}}).done(function(data) {
        let html = "";
        data.forEach(function(d) {
            html += "<li class=\"collection-item avatar\"><img src='"+d.message.author.avatar+"' alt='' class='circle'><span class='title'>"+htmlEncode(d.message.author.name)+"</span><p><strong>Author ID:</strong> "+d.message.author.id+"<br /><strong>Full message:</strong> "+htmlEncode(d.message.content)+"<br /><strong>Channel:</strong> "+htmlEncode(d.message.channel.name)+" ("+d.message.channel.id+")<br /><strong>Guild:</strong> "+htmlEncode(d.message.guild.name)+" ("+d.message.guild.id+")<br /><strong>Successful:</strong> "+d.success+"</strng><br /><small>"+d.timestamp+"</small></p></li>";
        });
        if(data.length === 0) {
            $("#command_collection").html("<li class='collection-item'>No commands</li>")
        } else {
            $("#command_collection").html(html);
        }
    }).fail(function(a,b,c) {
        if(a.status === 401) {
            window.location.href="/login";
        }
        $("#fetcherror").modal('open');
    }).always(function() {
        loading(false);
    });
}

function reportStats() {
    if(localStorage.getItem('token') === null) return;
    $.ajax('/api/reportstats', {
        method: 'PUT',
        headers: {Authorization: localStorage.getItem("token")}
    });
    alert("Done.");
}

function changeStatus() {
    if(localStorage.getItem('token') === null) return;
    var toChangeTo = prompt("Enter new game");
    if(!toChangeTo) return;
    $.ajax('/api/status', {
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({newStatus: toChangeTo}),
        headers: {Authorization: localStorage.getItem("token")}
    }).done(() => {
        alert("Updated");
    });
}

function leaveServer(serverId){
    if(localStorage.getItem('token') === null) return;
    let confirmation = confirm("Are you sure you want to leave this server?");
    console.log(serverId);
    if(confirmation) $.ajax('/api/guilds/'+serverId, {
        method: 'DELETE',
        headers: {Authorization: localStorage.getItem("token")}
    }).done((data) => {
        let html = "";
        data.forEach(function(d) {
            html += "<li class=\"collection-item\"><div>"+htmlEncode(d.name)+"<a href=\"#\" onclick=\"leaveServer('"+d.id+"')\" class=\"secondary-content tooltipped\" data-position='left' data-delay='50' data-tooltip='Leave Guild'><i class='material-icons'>remove_circle_outline</i></a></div></li>";
        });
        if(data.length === 0) {
            $("#guilds_collection").html("<li class='collection-item'>No guilds</li>")
        } else {
            $("#guilds_collection").html(html);
            $(".tooltipped").tooltip({delay: 50});
        }
    });
}

function htmlEncode(value){
    //create a in-memory div, set it's inner text(which jQuery automatically encodes)
    //then grab the encoded contents back out.  The div never exists on the page.
    return $('<div/>').text(value).html();
}