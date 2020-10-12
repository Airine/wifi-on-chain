import React from 'react';
import {Button, Layout, Menu} from 'antd';
import 'antd/dist/antd.css';
import './style/App.css';
import Home from './tabs/Home'
import Status from './tabs/Status'
import Information from './tabs/Information'
import {DrizzleContext} from '@drizzle/react-plugin';
import {BrowserRouter as Router, Link, Route, Switch} from "react-router-dom";

const {Header, Content, Footer} = Layout;

function Main(props) {

    return (
        <Router>
            <Layout className="layout">

                <Header>

                    <Menu
                        theme="dark" mode="horizontal"
                        defaultSelectedKeys={['1']}
                        style={{lineHeight: '64px'}}>

                        <Menu.Item key="1">
                            <Link to="/">Home</Link>
                        </Menu.Item>
                        <Menu.Item key="2">
                            <Link to="/status">Status</Link>
                        </Menu.Item>
                        <Menu.Item key="3">
                            <Link to="/info">Information</Link>
                        </Menu.Item>

                        <Button type="ghost"
                                style={{color: "#ffffff", float: "right", marginTop: "16px"}}
                                onClick={props.onLogOut}>
                            Log out </Button>

                    </Menu>

                </Header>

                <Content style={{padding: '50px 50px 0px 50px'}}>
                    <div className="content">
                        <DrizzleContext.Consumer>
                            {drizzleContext => {
                                const {drizzle, drizzleState, initialized} = drizzleContext;

                                if (!initialized) {
                                    return "Loading...";
                                }

                                return (
                                    <Switch>

                                        <Route path="/info">
                                            <Information drizzle={drizzle} drizzleState={drizzleState}
                                                         address={props.address} password={props.password}
                                            />
                                        </Route>

                                        <Route path="/status">
                                            <Status drizzle={drizzle} drizzleState={drizzleState}
                                                    address={props.address} password={props.password}
                                            />
                                        </Route>


                                        <Route path="/">
                                            <Home drizzle={drizzle} drizzleState={drizzleState}
                                                  address={props.address} password={props.password}
                                            />
                                        </Route>

                                    </Switch>
                                )
                            }
                            }
                        </DrizzleContext.Consumer>


                    </div>
                </Content>
                <Footer className="footer" style={{textAlign: 'center'}}></Footer>
            </Layout>
        </Router>
    );
}

export default Main;
