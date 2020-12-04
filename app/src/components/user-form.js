import React, {Component} from 'react'
import _ from 'lodash'
import classNames from 'classnames'


export default class UserForm extends Component {

    constructor(props) {

        super(props);


        this.state = {
            message: null,
            isLogin: true,
            user: {
                role:'student',
                name: '',
                email: '',
                password: '',
                
            },
            phone: '',
            reqId: '',
            code: ''
            
        }

        this.onSubmit = this.onSubmit.bind(this);
        
        this.onSelectionChange = this.onSelectionChange.bind(this);
        this.onTextFieldChange = this.onTextFieldChange.bind(this);
        this.onClickOutside = this.onClickOutside.bind(this);
        this.onCodeFieldChange = this.onCodeFieldChange.bind(this);
        this.onPhoneFieldChange = this.onPhoneFieldChange.bind(this);
        this.onCheckCode = this.onCheckCode.bind(this);
        
    }

    onClickOutside(event) {

        if (this.ref && !this.ref.contains(event.target)) {


            if (this.props.onClose) {
                this.props.onClose();
            }

        }
    }

    componentDidMount() {

        window.addEventListener('mousedown', this.onClickOutside);

    }

    componentWillUnmount() {

        window.removeEventListener('mousedown', this.onClickOutside);

    }

    onSubmit(event) {
        const {user, isLogin,phone} = this.state;
        const {store} = this.props;
        event.preventDefault();
        this.setState({
            message: null,
        }, () => {
            if(isLogin){
                store.login(user.email, user.password).then((user) => {
                    if (this.props.onClose) {
                        this.props.onClose();
                    }
                }).catch((err) => {
                    console.log("err", err);
                    this.setState({
                        message: {
                            body: err,
                            type: 'error',
                        }
                    })
                });
            }else{
                 store.register(user).then((_)=> {
                    this.setState({
                        message: {
                            body: 'User created.',
                            type: 'success'
                        }
                    }, () => {
                        // now login this user
                        store.login(user.email, user.password).then(() => {
                            if (this.props.onClose) {
                                this.props.onClose();
                            }
                        })
                    })
                }) 
            }
        })
    }

    onTextFieldChange(event) {

        let {user} = this.state;


        const field = event.target.name;

        user[field] = event.target.value;

        this.setState({
            user: user
        });


    }
    onPhoneFieldChange(event) {
        console.log(event.target.value);
       this.setState({
           phone: event.target.value
       });

    }

    onSelectionChange(event) {
        this.setState({value: event.target.value});

    }

    onCodeFieldChange(event) {
        console.log(event.target.value);
        this.setState({
            code: event.target.value
        });
 
    }


     onCheckCode() {
        const {store} = this.props;
         const {reqId,code,user} = this.state;
         store.checkCode(reqId,code).then((res) => {
             if(res.status == 0 ){
                store.register(user).then((_)=> {
                    this.setState({
                        message: {
                            body: 'User created.',
                            type: 'success'
                        }
                    }, () => {
                        // now login this user
                        store.login(user.email, user.password).then(() => {
                            if (this.props.onClose) {
                                this.props.onClose();
                            }
                        })
                    })
                   
                
                })
             } else{
                 console.log("code invalid. please try again");
             }
         })
     }

    render() {

        const {user, message, isLogin} = this.state;

        return (

            <div className="user-form" ref={(ref) => this.ref = ref}>
                <div>
                <form onSubmit={this.onSubmit} method="post">
                    {message ?
                        <p className={classNames('app-message', _.get(message, 'type'))}>{_.get(message, 'body')}</p> : null}

                    {!isLogin ?  <div>
                        <div className="form-item">
                        <label>Role:</label>
                        <select  value={this.state.value} onChange={this.onTextFieldChange} type={'text'} name={"role"} >
                            <option value="student">Student</option>
                            <option value="mentor">Mentor</option>
                        </select>
                    </div>
                    <div className="form-item">
                        <label>Name</label>
                        <input placeholder={'Full name'} onChange={this.onTextFieldChange} type={'text'} value={_.get(user, 'name', '')} name={"name"} />
                    </div>
                    </div> : null }

                    <div className="form-item">
                        <label>Email</label>
                        <input value={_.get(user, 'email')} onChange={this.onTextFieldChange} type="email"
                               placeholder="Email addresss..." name="email"/>
                    </div>

                    <div className="form-item">
                        <label>Password</label>
                        <input value={_.get(user, 'password')} onChange={this.onTextFieldChange} type="password"
                               placeholder="Password" name="password"/>
                    </div>


                    <div className="form-actions">
                        {isLogin ? <button onClick={() => {
                            this.setState({
                                isLogin: false,
                            })

                        }} type="button">Create an account?
                        </button> : null}

                        <button className="primary" type="submit">{isLogin ? 'Sign In' : 'Create new account'}</button>
                    </div>
                </form>
                </div> 
                
            </div>

        );
    }
}