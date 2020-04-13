import React from 'react';
import {Form, Typography} from 'antd';
import LoginForm from './custom/LoginForm'
import RegisterForm from './custom/RegisterFrom'
import './style/login.css'
import 'antd/dist/antd.css';

const {Title} = Typography;

class Login extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            login: true,
        }
    }

    switchState(msg) {
        this.setState({
            login: Boolean(msg)
        });
    }

    render() {
        const NormalLoginForm = Form.create({name: 'normal_login'})(LoginForm);
        const NormalRegisterForm = Form.create({name: 'normal_register'})(RegisterForm);
        let CurrentForm = this.state.login ? NormalLoginForm : NormalRegisterForm;
        let style = this.state.login ? {width: "300px"} : {width: "400px"};
        let text = this.state.login ? "Welcome Back!" : "Welcome, New Friend!";
        return (
            <div className="login-form" style={style}>
                <Title style={{textAlign: "center"}}
                >{text}</Title>
                <CurrentForm switchState={this.switchState.bind(this)} homeCallback={this.props.homeCallback}/>
                <p style={{textAlign: 'center'}}>WiFi-Drrizle © 2020 Created by Runxin</p>
            </div>
        )
    }
}

export default Login;