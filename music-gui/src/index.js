import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import needle from 'needle';
import registerServiceWorker from './registerServiceWorker';
import dataManager from './dataManager';
import './index.css';

function getCookie(name) {
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
}

if(getCookie("token") == null) {
    window.location.href = dataManager.homeBase+"login";
}
needle.get(dataManager.homeBase+'api/tokenvalid?token='+encodeURIComponent(getCookie("token"))+"&for=music", (err, resp) => {
    if(!resp.body.valid) window.location.href = dataManager.homeBase+"login?next="+encodeURIComponent(window.location.href);
});

ReactDOM.render(<App />, document.getElementById('root'));
// registerServiceWorker();

var WebSocketClient = require('websocket').w3cwebsocket;
const socket = WebSocketClient(dataManager.wsHomeBase+"music/ws");
dataManager.socket = socket;

socket.onopen = () => {
    socket.send(JSON.stringify({e: "IDENT", d:{token: getCookie("token"), guild: window.thisguild}}));
    console.log("Connection established to websocket.");
};
socket.onclose = () => {
    dataManager.page = "disconnected";
    dataManager.dontLoadDefault = true;
    dataManager.app.forceUpdate();
};
socket.onmessage = (m) => {
    let sent = JSON.parse(m.data);
    if(sent.e === "HELLO" || sent.e === "UPDATE") {
        if (!sent.d.connected) {
            dataManager.page = "notConnected";
            dataManager.dontLoadDefault = true;
            dataManager.app.forceUpdate();
            return;
        }
        dataManager.queue = sent.d.queue;
        dataManager.canManage = sent.d.canManage;
        dataManager.volume = sent.d.volume;
        dataManager.percentage = sent.d.percentage*100;
        dataManager.page = "choose";
        dataManager.dontLoadDefault = false;
        dataManager.app.forceUpdate();
    }
};