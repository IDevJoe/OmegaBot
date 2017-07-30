import React, { Component } from 'react';
import dataManager from './dataManager';
import PageChoose from './pages/pageChoose';
import './App.css';
import './bulma.css';
import './balloon.css';

class App extends Component {
    constructor() {
        super();
        dataManager.app = this;
    }
    render() {
        let toRender = <span>This is odd.. You shouldn't be here.</span>;
        if(dataManager.page == "choose") toRender = <PageChoose />;
        if(!dataManager.dontLoadDefault) return (
            <div>
                <section className="hero is-primary is-bold">
                    <div className="hero-head">
                        <header className="nav">
                            <div className="container">
                                <div className="nav-left">
                                    <a href="#" className="nav-item">
                                        Hurricane
                                    </a>
                                </div>
                                <div className="nav-right">
                                    <a href="https://discordapp.com/api/oauth2/authorize?client_id=295593778633375744&scope=bot&permissions=8" className="nav-item">
                                        Invite
                                    </a>
                                    <a href="https://discord.gg/uDpAgVg" className="nav-item">
                                        Support / Discord Server
                                    </a>
                                </div>
                            </div>
                        </header>
                    </div>
                    <div className="hero-body">
                        <div className="container">
                            <h1 className="title">
                                Hurricane Music Control <span className="tag is-info">Beta</span>
                            </h1>
                            <h2 className="subtitle">No need to memorize any commands.</h2>
                        </div>
                    </div>
                    <div className="hero-foot">
                        <nav className="tabs is-boxed">
                            <div className="container">
                                <ul>
                                    <li className="is-active"><a>Choose Songs</a></li>
                                    <li><a>Manage</a></li>
                                </ul>
                            </div>
                        </nav>
                    </div>
                </section>
                <div style={{marginTop: "50px"}}></div>
                {toRender}
            </div>
        );
        if(dataManager.page == "load") return (
            <div className="hero is-dark is-fullheight is-bold">
                <div className="hero-body">
                    <div className="container has-text-centered">
                        <h1 className="title">Please wait</h1>
                        <h2 className="subtitle">We're getting some information to have the best experience...</h2>
                    </div>
                </div>
            </div>
        );
        if(dataManager.page === "notConnected") return (
            <div className="hero is-danger is-fullheight is-bold">
                <div className="hero-body">
                    <div className="container has-text-centered">
                        <h1 className="title">Not connected</h1>
                        <h2 className="subtitle">Hurricane is not connected to this server.</h2>
                    </div>
                </div>
            </div>
        );
        if(dataManager.page === "disconnected") return (
            <div className="hero is-danger is-fullheight is-bold">
                <div className="hero-body">
                    <div className="container has-text-centered">
                        <h1 className="title">Disconnected</h1>
                        <h2 className="subtitle">Either your session timed out, or something went horribly, horribly wrong.</h2>
                        <h2>Refresh the page to reconnect.</h2>
                    </div>
                </div>
            </div>
        );
    }
}

export default App;
