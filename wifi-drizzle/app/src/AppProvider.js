import React from 'react';
import Login from './Login'
import Main from './Main'
import {instanceOf} from 'prop-types'
import {Cookies, withCookies} from 'react-cookie'
import drizzleOptions from './drizzleOptions'
import {message, Modal, Result, Spin, Typography} from "antd";

const {Paragraph, Title} = Typography;

const loginMessage = 'login';

class AppProvider extends React.Component {

    static propTypes = {
        cookies: instanceOf(Cookies).isRequired
    };

    constructor(props) {
        super(props);
        const {cookies} = props;

        this.state = {
            user: cookies.get('user') || false, // skip login page
            address: cookies.get('address') || NaN,
            password: cookies.get('password') || NaN,
            loading: true,
            loginModal: false,
            registerModal: false,
        };

        this.callback = this.callback.bind(this);
        this.onLogOut = this.onLogOut.bind(this);
        this.setRegisterVisible = this.setRegisterVisible.bind(this);
        this.setLoginVisible = this.setLoginVisible.bind(this);
    }

    onLogOut() {
        const {cookies} = this.props;
        cookies.remove("user");
        cookies.remove("address");
        cookies.remove("password");
        this.setState({
            user: false,
            address: NaN,
            password: NaN,
        });
    }

    callback(msg) {
        const {cookies} = this.props;
        const w3 = drizzleOptions.web3.httpProvider;
        const {address, auto, password, remember} = msg;
        console.log(msg);
        if (auto === undefined) {
            message.loading({content: 'Verifying account...', key: loginMessage});
            w3.eth.personal.unlockAccount(address, password, 600).then((response) => {
                message.success({content: "Login Successfully.", key: loginMessage});
                if (remember) {
                    cookies.set("user", true, {path: "/"});
                    cookies.set("address", address, {path: "/"});
                    cookies.set("password", password, {path: "/"});
                }
                this.setState({
                    user: true,
                    address: address,
                    password: password
                })
                // console.log(response);
            }).catch((error) => {
                // message.error({content: error, key: loginMessage});
                // console.log(error);
                message.error({content: "Wrong password!", key: loginMessage})
            });
        } else {
            console.log("new account!!!");

            w3.eth.personal.newAccount(password).then(res => {
                console.log("new account");
                console.log(res);
                this.setState({
                    address: res,
                    password: password,
                    loading: false
                });
                if (auto) {
                    this.setState({
                        user: true
                    });
                    if (remember) {
                        cookies.set("user", true, {path: "/"});
                        cookies.set("address", this.state.address, {path: "/"});
                        cookies.set("password", this.state.password, {path: "/"});
                    }
                }
                this.setRegisterVisible(true);
            });
        }
    }

    setRegisterVisible(visibility) {
        this.setState({
            registerModal: visibility
        })
    }

    setLoginVisible(visibility) {
        if (visibility) {
            message.success({content: 'Login Successfully!', loginMessage, duration: 2});
        } else {
            message.error({content: 'Login Failed, check your account!', loginMessage, duration: 2});
        }
    }

    render() {

        return (
            <div>
                {this.state.user ?
                    <Main address={this.state.address} password={this.state.password} onLogOut={this.onLogOut}/> :
                    <Login homeCallback={this.callback}/>}
                <Modal
                    title="Successfully Registered Temporary Wallet!"
                    centered
                    visible={this.state.registerModal}
                    onOk={() => {
                        this.setRegisterVisible(false);
                        this.setState({loading: true});
                    }}
                    onCancel={() => {
                        this.setRegisterVisible(false);
                        this.setState({loading: true});
                    }}
                >
                    <Spin spinning={this.state.loading} delay={500}>
                        {!this.state.loading ?
                            <Result
                                status="success"
                                title="Successfully Registered Temporary Wallet!"
                                subTitle="Note: Please keep the information below noted by yourself, as we do not keep a copy of your private key.">
                                <Paragraph>The <b>address</b> of your temporary wallet is:</Paragraph>
                                <br/>
                                <Title copyable level={4}>{this.state.address}</Title>
                                <br/>
                                <Paragraph>The <b>private key</b> of your temporary wallet is:</Paragraph>
                                <br/>
                                <Title copyable level={4}>{this.state.password}</Title>
                                <br/>
                            </Result> :
                            <Result
                                title="Your account is generating"
                                subTitle="Note: Please keep the information below noted by yourself, as we do not keep a copy of password or private key.">
                                <Paragraph>The <b>address</b> of your temporary wallet is:</Paragraph>
                                <br/>
                                <Title copyable level={4}>Generating...</Title>
                                <br/>
                                <Paragraph>The <b>password</b> of your temporary wallet is:</Paragraph>
                                <br/>
                                <Title copyable level={4}>Generating...</Title>
                                <br/>
                            </Result>}
                    </Spin>
                </Modal>
            </div>
        )
    }
}

export default withCookies(AppProvider);