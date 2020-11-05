import React, { Component } from 'react'
import { Navbar } from 'react-bootstrap';
import { NavItem } from 'react-bootstrap';
import { Nav } from 'react-bootstrap';
import Messenger from './messenger'
import { Route, Switch, BrowserRouter } from 'react-router-dom'
import EventCalendar from './calendar'
import Chatbot from './chatbot'


export default class Navigation extends Component {
   
    render() {
        const { store } = this.props;
        console.log(store);
        return (
            <div class="container">
                <BrowserRouter>
                    <Navbar fluid collapseOnSelect>
                        <Navbar.Header>
                            <Navbar.Brand>
                                EduCloud
                        </Navbar.Brand>
                            <Navbar.Toggle />
                        </Navbar.Header>
                        <Navbar.Collapse>
                            <Nav pullRight >
                                <NavItem href="/calendar">Calendar</NavItem>
                                <NavItem href="/messenger">Chat</NavItem>
                                <NavItem href="/chatbot" onClick={(event) => {event.preventDefault(); window.open("/chatbot", 'newwindow', 'width=450, height=550'); return false;}}>Help Centre</NavItem>
                            </Nav>
                        </Navbar.Collapse>
                    </Navbar>
                    <Switch>
                        
                        <Route exact path='/messenger' render={(props) => <Messenger store={store} {...props} /> } /> 
                        <Route exact path='/calendar' render={(props) => <EventCalendar store={store} {...props} /> } /> 
                        <Route exact path='/chatbot' render={(props) => <Chatbot store={store} {...props} /> } /> 
                        
                    </Switch>
                </BrowserRouter>

            </div>
        )
    }

}