import React, {Component} from 'react'
import _ from 'lodash'
import avatar from '../images/avatar.png'
import UserForm from './user-form'
import UserMenu from './user-menu'


export default class UserBar extends Component {

    constructor(props) {
        super(props);

        this.state = {
            showUserForm: false,
            showUserMenu: false,
        }


    }

    render() {

        const {store} = this.props;

        const me = store.getCurrentUser();
        const profilePicture = _.get(me, 'avatar');
        const isConnected = store.isConnected();
        const role=_.get(me,'role');

        return (
            <div className="user-bar">
                {me && !isConnected ? <div className="app-warning-state">Reconnecting... </div> : null}
                {!me ? <button onClick={() => {

                    this.setState({
                        showUserForm: true,
                    })

                }} type="button" className="login-btn">Sign In</button> : null}
                
            {
            _.get(me,'role')!=""?
             (role==="student"  ?
            <div><img src="/images/S.png" style={{height:"20px", width:"20px"}}/></div> : <div></div>):<div></div>}
               { 
                _.get(me,'role')!=""?
             (role==="mentor"  ?
            <div><img src="/images/m1.jpg" style={{height:"20px", width:"20px"}}/></div> : <div></div>):<div></div>}
            
                <div className="profile-name">{_.get(me, 'name')}</div>
                <div className="profile-image" onClick={() => {

                    this.setState({
                        showUserMenu: true,
                    })

                }}><img src={profilePicture ? profilePicture : avatar} alt=""/></div>

                {!me && this.state.showUserForm ? <UserForm onClose={(msg) => {


                    this.setState({
                        showUserForm: false,
                    })

                }} store={store}/> : null}


                {this.state.showUserMenu ? <UserMenu
                    store={store}
                    onClose={() => {

                        this.setState({
                            showUserMenu: false,
                        })
                    }}

                /> : null}

            </div>
        );
    }
}