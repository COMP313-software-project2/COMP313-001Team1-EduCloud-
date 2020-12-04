import React, {Component} from 'react'
import classNames from 'classnames'
import {OrderedMap} from 'immutable'
import _ from 'lodash'
import {ObjectID} from '../helpers/objectid'
import SearchUser from './search-user'
import moment from 'moment'
import UserBar from './user-bar'
import { Redirect } from 'react-router-dom'


export default class Messenger extends Component {

    constructor(props) {
        console.log(props.store + "in messenger constructor")
        super(props);

        this.state = {
            height: window.innerHeight,
            newMessage: 'Hello there...',
            searchUser: "",
            showSearchUser: false,
            file: null,
            chunks: []
        }

        this._onResize = this._onResize.bind(this);
        this.handleSend = this.handleSend.bind(this)
        this.renderMessage = this.renderMessage.bind(this);
        this.scrollMessagesToBottom = this.scrollMessagesToBottom.bind(this)
        this._onCreateChannel = this._onCreateChannel.bind(this);
        this.renderChannelTitle = this.renderChannelTitle.bind(this)
        this.renderChannelAvatars = this.renderChannelAvatars.bind(this);
        this.sendFile = this.sendFile.bind(this);
        this.sendMsg = this.sendMsg.bind(this);
    }

    renderChannelAvatars(channel){
        const {store} = this.props;

        const members = store.getMembersFromChannel(channel);

        const maxDisplay = 4;
        const total = members.size > maxDisplay ? maxDisplay : members.size;

        const avatars = members.map((user, index) => {



            return index < maxDisplay ?  <img key={index} src={_.get(user, 'avatar')} alt={_.get(user, 'name')} /> : null

        });


        return <div className={classNames('channel-avatars', `channel-avatars-${total}`)}>{avatars}</div>
    }
    renderChannelTitle(channel = null) {

        if (!channel) {
            return null;
        }
        const {store} = this.props;

        const members = store.getMembersFromChannel(channel);


        const names = [];

        members.forEach((user) => {

            const name = _.get(user, 'name');
            names.push(name);
        })

        let title = _.join(names, ',');

        if (!title && _.get(channel, 'isNew')) {
            title = 'New message';
        }

        return <h2>{title}</h2>
    }

    _onCreateChannel() {

        const {store} = this.props;

        const currentUser = store.getCurrentUser();
        const currentUserId = _.get(currentUser, '_id');

        const channelId = new ObjectID().toString();
        const channel = {
            _id: channelId,
            title: '',
            lastMessage: "",
            members: new OrderedMap(),
            messages: new OrderedMap(),
            isNew: true,
            userId: currentUserId,
            created: new Date(),
        };

        channel.members = channel.members.set(currentUserId, true);


        store.onCreateNewChannel(channel);
    }

    scrollMessagesToBottom() {

        if (this.messagesRef) {

            this.messagesRef.scrollTop = this.messagesRef.scrollHeight;
        }
    }

    renderMessage(message) {
        const ftyp = _.get(message,'type',"string");
        let html = null;
        const content = _.get(message, 'body', '');
        if(ftyp == "string"){
            

            html = _.split(content, '\n').map((m, key) => {
    
                return <p key={key} dangerouslySetInnerHTML={{__html: m}}/>
            })
        } else {
           html = _.split(content,'\n').map((m,key) => {
                return ftyp == "image" ? 
                (<p key={key}>
                 <a target="_blank" className="img-container" href={m}><img src={m}/></a>
              </p>) :
              (<p key={key}>
                <a target="_blank" href={m}>download {m} file.</a>
              </p>);
            })
            
           
        }
        return html;
    }
    sendFile(msgId,file, offset, chunksize) {
        const {store} = this.props;
        if(file !== null){
            let reader = new FileReader();
            let con = "";
            let res = null;
            reader.onload = (e) => {
              let {result} = e.target;
              result = result.split(",")[1];
              let chunks = result.match(/.{1,19000}/g);
              _.forEach(chunks, (chunk) => {
                con += chunk;
              })
              res = store.processFile(con,file.type)
              let ft = file.type.indexOf("image") !== -1 ? "image" : "file";
                this.sendMsg(msgId,res,ft,file.type);
            }
            
            reader.readAsDataURL(file);
        }
      
      }
     

    handleSend() {

        const {newMessage} = this.state;
        
        const messageId = new ObjectID().toString();
        const {file} = this.state;

        // create new message
        if(file == null){
            if (_.trim(newMessage).length) {
                this.sendMsg(messageId,newMessage,"string","");
            }
        }else{
            
            this.sendFile(messageId,file,0,1000);
        }
        this.setState({
            newMessage: '',
            file : null
        })
        
    }
    
    
    sendMsg(msgId,content,msgtype,ftyp){
        const {store} = this.props;
        const messageId = msgId;
        const channel = store.getActiveChannel();
        const channelId = _.get(channel, '_id', null);
        const currentUser = store.getCurrentUser();
        const message = {
            _id: messageId,
            channelId: channelId,
            body: content,
            userId: _.get(currentUser, '_id'),
            me: true,
            type: msgtype,
            filetype: ftyp
        };
        store.addMessage(messageId, message);
       
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


        window.addEventListener('resize', this._onResize);


    }


    componentWillUnmount() {

        window.removeEventListener('resize', this._onResize)

    }

    render() {
        const {file} = this.state;
        const {store} = this.props;
        console.log(store + " in messenger render()")
        const {height} = this.state;

        const style = {
            height: height,
        };


        const activeChannel = store.getActiveChannel();
        const messages = store.getMessagesFromChannel(activeChannel); //store.getMessages();
        const channels = store.getChannels();
        const members = store.getMembersFromChannel(activeChannel);

        var user = store.getCurrentUser();
        if(user!=null){//any signed in user can access calendar
          var userRole=user.role;
  
        }
        else{
          userRole=null;
        }
        
        if(userRole!=null){

        return (
            <div style={style} className="app-messenger">
                <div className="header">
                    <div className="left">
                        <button className="left-action"><i className="icon-settings-streamline-1"/></button>
                        <button onClick={this._onCreateChannel} className="right-action"><i
                            className="icon-edit-modify-streamline"/></button>
                        <h2>Messenger</h2>
                    </div>
                    <div className="content">

                        {_.get(activeChannel, 'isNew') ? <div className="toolbar">
                            <label>To:</label>
                            {
                                members.map((user, key) => {

                                    return <span onClick={() => {

                                        store.removeMemberFromChannel(activeChannel, user);

                                    }} key={key}>{_.get(user, 'name')}</span>
                                })
                            }
                            <input placeholder="Type name of person..." onChange={(event) => {

                                const searchUserText = _.get(event, 'target.value');

                                //console.log("searching for user with name: ", searchUserText)

                                this.setState({
                                    searchUser: searchUserText,
                                    showSearchUser: true,
                                }, () => {


                                    store.startSearchUsers(searchUserText);
                                });


                            }} type="text" value={this.state.searchUser}/>

                            {this.state.showSearchUser ? <SearchUser
                                onSelect={(user) => {

                                    this.setState({
                                        showSearchUser: false,
                                        searchUser: '',

                                    }, () => {


                                        const userId = _.get(user, '_id');
                                        const channelId = _.get(activeChannel, '_id');

                                        store.addUserToChannel(channelId, userId);

                                    });


                                }}
                                store={store}/> : null}

                        </div> : this.renderChannelTitle(activeChannel)}


                    </div>
                    <div className="right">

                        <UserBar store={store}/>

                    </div>
                </div>
                <div className="main">
                    <div className="sidebar-left">

                        <div className="chanels">

                            {channels.map((channel, key) => {

                                return (
                                    <div onClick={(key) => {

                                        store.setActiveChannelId(channel._id);

                                    }} key={channel._id}
                                         className={classNames('chanel', {'notify': _.get(channel, 'notify') === true},{'active': _.get(activeChannel, '_id') === _.get(channel, '_id', null)})}>
                                        <div className="user-image">
                                           {this.renderChannelAvatars(channel)}
                                        </div>
                                        <div className="chanel-info">
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

                                const user = _.get(message, 'user');


                                return (
                                    <div key={index} className={classNames('message', {'me': message.me})}>
                                        <div className="message-user-image">
                                            <img src={_.get(user, 'avatar')} alt=""/>
                                        </div>
                                        <div className="message-body">
                                            <div
                                                className="message-author">{message.me ? 'You ' : _.get(message, 'user.name')} says:
                                            </div>
                                            <div className="message-text">
                                                {this.renderMessage(message)}
                                            </div>
                                        </div>
                                    </div>
                                )


                            })}


                        </div>

                        {activeChannel && members.size > 0 ? <div className="messenger-input">

                            <div className="text-input">
										<textarea onKeyUp={(event) => {


                                            if (event.key === 'Enter' && !event.shiftKey) {
                                                this.handleSend();
                                            }


                                        }} onChange={(event) => {


                                            this.setState({newMessage: _.get(event, 'target.value')});

                                        }} value={this.state.newMessage} placeholder="Write your messsage..."/>
                            </div>
                            <div className="actions">
                                <button onClick={this.handleSend} className="send">Send</button>
                            </div>
                            <input 
                            type="file"
                            id="file-to-upload"
                            style={{display: "none"}}
                            onChange={(e) => this.setState({file: e.target.files[0]})}/>
                            <label 
                            role="button"
                            htmlFor="file-to-upload"
                            className="btn btn-warning upload-file">{file !== null ? file.name : "Upload File"}</label>
                        </div> : null}


                    </div>
                    <div className="sidebar-right">

                        {members.size > 0 ? <div><h2 className="title">Members</h2>
                            <div className="members">

                                {members.map((member, key) => {


                                    const isOnline = _.get(member, 'online', false);

                                    return (
                                        <div key={key} className="member">
                                            <div className="user-image">
                                                <img src={_.get(member, 'avatar')} alt=""/>
                                                <span className={classNames('user-status', {'online': isOnline})} />
                                            </div>
                                            <div className="member-info">
                                                <h2>{member.name} - <span className={classNames('user-status', {'online': isOnline})}>{isOnline ? 'Online': 'Offline'}</span> </h2>
                                                <p>Joined: {moment(member.created).fromNow()}</p>
                                            </div>

                                        </div>
                                    )

                                })}

                            </div>
                        </div> : null}


                    </div>
                </div>
            </div>
        )}
        else{
            return(
                <div className="popup">
               
                    <span class="popuptext" id="popupAlert">Sign in to reach this page!</span>
                    <Redirect to="/unauthorized"/>
                </div>
              )
          }
    }
}