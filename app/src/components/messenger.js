import React, {Component} from'react'
import '../css/app.css'
import classNames from 'classnames'
import _ from 'lodash'
import {OrderedMap} from 'immutable'
import {ObjectID} from '../helpers/objectid.js'
import SearchUser from './search-user'
import moment from 'moment'

export default class Messenger extends Component{

    constructor(props) {

        super(props);

        this.state={
            height:window.innerHeight,
            newMessage: 'Hello there...',
            searchUser:"",
            showSearchUser: false,
         
        }

        this._onResize = this._onResize.bind(this);
        this.handleSend = this.handleSend.bind(this);
        this.renderMessage = this.renderMessage.bind(this);
        this.scrollMessagesToBottom = this.scrollMessagesToBottom.bind(this);
        this._onCreateChannel = this._onCreateChannel.bind(this);
        this.renderChannelTitle = this.renderChannelTitle.bind(this);
    }

    renderChannelTitle(channel = {}){
        const {store} = this.props;

        const members = store.getMembersFromChannel(channel);


        const names=[];

        members.forEach((user) => {

            const name = _.get(user, 'name');
            names.push(name);
        });
        console.log(names);

        return <h2>{_.join(names, ', ')}</h2>
    };

    _onCreateChannel(){
        const {store} =  this.props;

        // const currentUser = store.getCurrentUser();
        // const currentUserId = _.get(currentUser, '_id');

        const channelId = new ObjectID().toString();
        const channel = {
            _id: channelId,
            title: 'New Message',
            lastMessage: "",
            members: new OrderedMap(),
            messages: new OrderedMap(),
            isNew: true,
            created: new Date(),
        };

        //channel.members = channel.members.set(currentUserId, true);

        store.onCreateNewChannel(channel);

        
    }

    scrollMessagesToBottom() {

        if (this.messagesRef) {

            this.messagesRef.scrollTop = this.messagesRef.scrollHeight;
        }
    }


    renderMessage(message){

        const text = _.get(message, 'body', '');
        const html = _.split(text, '\n').map((m, key) => {

            return <p key={key} dangerouslySetInnerHTML={{__html: m}}/>
           

        })

        return html
    }


    handleSend() {
        const {newMessage} = this.state;
        const {store} = this.props;

        //create new message
        if(_.trim(newMessage).length) {
            const messageId =  new ObjectID().toString();
            const channel = store.getActiveChannel();
            const channelId =_.get(channel, '_id', null);
            const currentUser = store.getCurrentUser();

            const message = {
                _id: messageId,
                channelId: channelId,
                body: newMessage,
                auth: _.get(currentUser, 'name', null),
                me: true,
            };

            
            store.addMessage(messageId, message);

            this.setState({
                newMessage: '',
            })
        }
        
    
        

    }
    _onResize() {

        this.setState({
            height: window.innerHeight
        });
    }
    componentDidUpdate() {

       
        this.scrollMessagesToBottom();
    }

    
        componentDidMount() {

            console.log("Component did mount");
            window.addEventListener('resize', this._onResize);
       
        }

        componentWillUnmount() {
    
          console.log("Component unmount");
          window.removeEventListener('resize', this._onResize)
    
        }
    
    

render(){

    const {store} = this.props;
    const {height}=this.state;

    const style = {
        height: height,
    };

    const activeChannel = store.getActiveChannel();
    const messages = store.getMessagesFromChannel(activeChannel);
    const channels = store.getChannels();
    const members = store.getMembersFromChannel(activeChannel);

    return (
     <div style={style} className="app-messenger">
                <div className="header">
                    <div className="left">
                        <button className="left-action"><i className="icon-paperplane"/></button>
                        <button onClick={this._onCreateChannel} className="right-action"><i className="icon-edit-modify-streamline"/></button>
                        <h2>Messenger</h2>
                      
                    </div>    
                    <div className="content">
                    {_.get(activeChannel, 'isNew') ? <div className="toolbar">
                            <label>To</label>
                            <input placeholder="Type name of person..." onChange={(event)=>{
                                const searchUserText = _.get(event, 'target.value');
                                
                                {/* console.log("searching for user with name: ",searchUserText)  */}

                                this.setState({
                                    searchUser: searchUserText,
                                    showSearchUser: true,
                                });   

                            }}
                            type="text" value={this.state.searchUser}></input>

                                {this.state.showSearchUser ? <SearchUser 
                                    onSelect={(user) => {
                                       
                                    
                                        this.setState({
                                            showSearchUser: false,
                                            searchUser:'',


                                        }, () => {
                                            
                                            const userId = _.get(user, '_id');
                                            const channelId = _.get(activeChannel, '_id');

                                            store.addUserToChannel(channelId, userId);
                                        });
                                    }}

                                     search={this.state.searchUser} store={store}/> : null }
                        
                        </div> : <h2>{_.get(activeChannel, 'title', '')}</h2>

                    }
                        </div>
                    <div className="right">
                        <div className="user-bar">
                            <div className="profile-name">Julia Ray</div>
                            <div className="profile-image"></div>
                    </div>
                    </div>
                </div>
                <div className="main">
                        <div className="sidebar-left">
                            <div className="channels">

                                {channels.map((channel, key) => {
                                    return (
                                        <div onClick={(key) => {
                                            //this._onSelectChannel(key)
                                                store.setActiveChannelId(channel._id);
                                                console.log("Channel Id is selected", channel._id);

                                            }} key={channel._id} className={classNames('channel', {'active' : _.get(activeChannel, '_id') === _.get(channel,'_id', null) } )}>
                                            <div className="user-image">
                                            </div>
                                    <div className="channel-info">
                                        {this.renderChannelTitle(channel)}
                                        <p>{channel.lastMessage}</p>
                                    </div>
                                </div>

                                    )
                                })}

                 
                            </div>

                        </div>
                        <div className="content">
                            <div ref={(ref) => this.messagesRef = ref} className="messages">

                                {messages.map((message, index) => {

                                return (
                                    <div key={index} className={classNames('message', {'me': message.me})}>
                                    <div className="message-user-image">
                                        
                                    </div>
                                    <div className="message-body">
                                    <div className="message-author">{message.me ? 'You ' : message.author} says:</div>
                                    <div className="message-text">
                                        <p>
                                            {this.renderMessage(message)}
                                        </p>
                                    </div>

                                    </div>
                                </div>
                                )
                            })}

                            </div>

                            {activeChannel ? <div className="messenger-input">
                               <div className="text-input">
                                    <textarea onKeyUp = {(event) => {

                                        if(event.key ==='Enter' && !event.shiftKey){
                                        this.handleSend();
                                        }
                                    }}
                                    onChange={(event) => {
                                        //console.log("Text is changing: ", event.target.value);
                                        this.setState({newMessage: _.get(event, 'target.value')});

                                        }} value={this.state.newMessage} placeholder ="Write your message" />
                                    </div>
                                    <div className="actions">
                                        <button onClick={this.handleSend} className="send">Send</button>
                                    </div> 
                               </div> : null }

                               </div>
                        <div className="sidebar-right">

                            { members.size > 0 ? <div>
                            <h2 className="title">Members</h2>
                            <div className="members">
                            {members.map((member, key) => {
                                
                                    return (
                                        
                                    <div className="member">
                                        <div className="user-image">
                                            <img src={_.get(member,'avatar')} alt="..."></img>
                                        </div>
                                        <div className="member-info">
                                            <h2>{member.name}</h2>
                                            <p>Joined:{moment(member.created).fromNow().toString()}</p>
                                        </div>
                                    </div>
                                    )
                                })}
                               
                                </div></div> :  null}

                            </div>



                        </div>
                </div>
            
                
        )      
}
}
