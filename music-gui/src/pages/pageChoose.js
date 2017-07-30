import React, {Component} from 'react';
import dataManager from '../dataManager';
import YouTubeLogo from '../YouTube.png';
import $ from 'jquery';
import '../bulma.css';
import '../balloon.css';

function QueueObject(props) {
    let first = (props.index === 0);
    return (
        <div>
            <div className={"panel-block"+(first ? " is-active" : "")}>
                {(first ? "Now Playing" : "#"+props.index)} - {props.title}
            </div>
            <div className="panel-block">
                <span style={{marginLeft: "10px"}}><small><i>Queued by {props.user.name}#{props.user.discriminator}</i></small></span>
            </div>
        </div>
    );
}

function VideoResult(props) {
    return (
        <tr>
            <td>{props.title}</td>
            <td>{props.channel}</td>
            <td><button className="button" onClick={() => {dataManager.socket.send(JSON.stringify({e: "QUEUE", d:{id: props.id}})); alert("Queued.");}}>Queue</button></td>
        </tr>
    );
}

function getCookie(name) {
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
}

class pageChoose extends Component {
    constructor() {
        super();
        this.search = this.search.bind(this);
        this.state = {results: []};
    }
    search() {
        $.ajax(dataManager.homeBase+'mapi/ytsearch?q='+encodeURIComponent(document.getElementById("search_box").value), {headers: {Authorization: getCookie("token")}}).done((data) => {
            let nr = [];
            for(let i=0;i<data.items.length;i++) {
                let item = data.items[i];
                nr.push({title: item.snippet.title, channel: item.snippet.channelTitle, id: item.id.videoId});
            }
            this.setState((e) => {
                return {results: nr};
            });
        });
    }
    render() {
        let queue = [];
        for(let i=0;i<dataManager.queue.length;i++) {
            queue.push(<QueueObject title={dataManager.queue[i].title} user={dataManager.queue[i].user} index={i} />)
        }
        if(queue.length === 0) {
            queue.push(<div className="panel-block is-active">
                Nothing queued.
            </div>);
        }
        let results = this.state.results;
        let nr = [];
        if(results.length == 0) {
            nr.push(<tr>
                <td>Enter an item to search for</td>
                <td>--</td>
                <td></td>
            </tr>);
        } else {
            for(let i=0;i<results.length;i++) {
                let result = results[i];
                nr.push(<VideoResult title={result.title} channel={result.channel} id={result.id} />);
            }
        }
        return (
            <div>
                <div className="container">
                    <div className="columns">
                        <div className="column is-half">
                            <nav className="panel">
                                <p className="panel-heading">
                                    Current Queue
                                </p>
                                <div className="panel-block">
                                    <progress className="progress" value={dataManager.percentage} max="100">{dataManager.percentage}%</progress>
                                </div>
                                {queue}
                                <div className="panel-block">
                                    <button className="button is-fullwidth is-primary is-outlined" disabled data-balloon="All updating is done automagically!" data-balloon-pos="down">Refresh Queue</button>
                                </div>
                            </nav>
                        </div>
                        <div className="column is-half">
                            <div className="card">
                                <header className="card-header">
                                    <p className="card-header-title">
                                        Choose Song
                                    </p>
                                </header>
                                <div className="card-content">
                                    <div className="columns">
                                        <div className="column is-one-quarter">
                                            <img src={YouTubeLogo} height="100" />
                                        </div>
                                        <div className="column" style={{display: "flex", alignItems: "center"}}>
                                            <input type="text" className="input" id="search_box" onKeyDown={(event) => {if(event.keyCode === 13) this.search();}} />
                                        </div>
                                        <div className="column is-one-quarter" style={{display: "flex", alignItems: "center"}}>
                                            <button className="button is-fullwidth" onClick={this.search}>Search</button>
                                        </div>
                                    </div>
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Uploaded By</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                        {nr}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default pageChoose;