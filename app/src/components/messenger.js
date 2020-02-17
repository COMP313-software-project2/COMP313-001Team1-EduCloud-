import React, {Component} from'react'
import '../css/app.css'
import classNames from 'classnames'
import _ from 'lodash'
import {OrderedMap} from 'immutable'
import {ObjectID} from '../helpers/objectid.js'


export default class Messenger extends Component{

    constructor(props) {

        super(props);

        this.state={
            height:window.innerHeight,
            newMessage: 'Hello there...'
         
        }

        this._onResize = this._onResize.bind(this);
        this.addTestMessages = this.addTestMessages.bind(this);
        this.handleSend = this.handleSend.bind(this);
        this.renderMessage = this.renderMessage.bind(this);
        this.scrollMessagesToBottom = this.scrollMessagesToBottom.bind(this);
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
            this.addTestMessages();
        }

        addTestMessages(){
           
            const {store}  = this.props;

            // const store =this.props.store;

            for(let i = 0; i < 100; i ++) {
                let isMe = false;

            if(i % 3 === 0) {
                isMe= true
            }
                const newMsg = {
                    _id: `${i}`,
                    body: `The body of message ${i}`,
                    author: `Author: ${i}`,
                    me: isMe
                }
                console.log(typeof i);
                store.addMessage(i, newMsg);
                //i need upsate my componen and re-render it now because new messages added 
            }

                   //create some test channels
                   for(let c = 0; c < 10; c++) {
                    let newChannel = {
                        _id: `${c}`,
                        title: `Channel title ${c}`,
                        lastMessage:`Hey there here...${c}`,
                        members: new OrderedMap({
                            '2':true,
                            '3':true,
                            '1':true,
                        }),
                        messages: new OrderedMap(),
                    }
                    const msgId = `${c}`;
                    const moreMsgId = `${c + 1}`
                    newChannel.messages = newChannel.messages.set(msgId, true);
                    newChannel.messages = newChannel.messages.set(moreMsgId, true);
                    store.addChannel(c, newChannel);
                }

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


    // if(activeChannel){
    // console.log("Active channel is: ", activeChannel);
    // console.log("Message in channel", activeChannel._id, messages);  
    // }
    return (
     <div style={style} className="app-messenger">
                <div className="header">
                    <div className="left">
                        <button className="left-action"><i className="icon-paperplane"/></button>
                        <button className="right-action"><i className="icon-edit-modify-streamline"/></button>
                        <h2>Messenger</h2>
                      
                    </div>    
                    <div className="content"><h2>{_.get(activeChannel, 'title', '')}</h2></div>
                    <div className="right">
                        <div className="user-bar">
                            <div className="profile-name">James Ray</div>
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
                                        <h2>{channel.title}</h2>
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
                           <div className="messenger-input">
                               <div className="text-input">
                                    <textarea onKeyUp = {(event) => {

                                        if(event.key ==='Enter' && !event.shiftKey){
                                        this.handleSend();}
                                        }
                                        }
                                    onChange={(event) => {
                                        //console.log("Text is changing: ", event.target.value);
                                        this.setState({newMessage: _.get(event, 'target.value')});

                                        }} value={this.state.newMessage} placeholder ="Write your message" />
                               </div>
                               <div className="actions">
                                   <button onClick={this.handleSend} className="send">Send</button>
                               </div>
                               </div>
                               </div>
                        <div className="sidebar-right">
                            <h2 className="title">Members</h2>
                            <div className="members">
                            {members.map((member, key) => {
                                
                                    return (
                                        
                                    <div className="member">
                                        <div className="user-image"></div>
                                        <div className="member-info">
                                            <h2>{member.name}</h2>
                                            <p>Joined: 3 days ago</p>
                                        </div>
                                    </div>
                                    )
                                })}
                               

                                </div>

                            </div>



                        </div>
                </div>
            
                
        )      
}
}
