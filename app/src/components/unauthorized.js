
import { Redirect } from 'react-router-dom'
import educloud_logo from './educloud_logo.png'


import React, {Component} from 'react'
import classNames from 'classnames'
import {OrderedMap} from 'immutable'
import _ from 'lodash'
import {ObjectID} from '../helpers/objectid'
import SearchUser from './search-user'
import moment from 'moment'
import UserBar from './user-bar'


export default class Unauthorized extends Component {

    constructor(props) {
        console.log(props.store + "in unauth constructor")
        super(props);

        this.state = {
            height: window.innerHeight,
            
        }

        this._onResize = this._onResize.bind(this);

        const {store} = props
           

            
 
       
    }

   

    _onResize() {

        this.setState({
            height: window.innerHeight
        });
    }

  

    componentDidMount() {


        window.addEventListener('resize', this._onResize);


    }


    componentWillUnmount() {

        window.removeEventListener('resize', this._onResize)

    }

    render() {
        
        const {store} = this.props;

        console.log(store + " in unauth render()")
        const {height} = this.state;

        const style = {
            height: height,
        };

    return (
            

        <div style={style} className="app-messenger">
            <div className="header">
                
                <div className="content"></div>
                <div className="right">
                    <UserBar store={store}/>
                </div>
            </div>
            <div className="main">                 
                <div className="content">
                    <center>
                        <img src={educloud_logo} alt="logo"/>
                        <div className="app-warning-state"> Sign in to view! </div>
                    </center>
                </div>                   
            </div>
        </div>
    )

       
    }
}