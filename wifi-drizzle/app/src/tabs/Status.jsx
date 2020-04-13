import React from 'react';
import {Button, Divider, Form, InputNumber, message, Typography} from 'antd';
import {newContextComponents} from "@drizzle/react-components";
import {DrizzleContext} from "@drizzle/react-plugin";
import options from "../drizzleOptions";

const {ContractData} = newContextComponents;
const {Title, Paragraph} = Typography;
const priceScalingFactor = 100;
const bandwidthScalingFactor = 100;


class TopUpForm extends React.Component {

    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
    }

    onChange(checked) {
        this.setState({
            advanced: checked
        })
    }

    handleSubmit = e => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.props.callback(values);
            }
        });
    };

    render() {
        const {form} = this.props;
        const {getFieldDecorator} = form;

        return (
            <Form style={{width: '200px', marginTop: '50px', margin: 'auto'}} layout="vertical"
                  onSubmit={this.handleSubmit}>
                <Form.Item label="Value (wei):">
                    {getFieldDecorator('value', {
                        initialValue: 0
                    })(
                        <InputNumber style={{width: '200px'}} min={0}/>
                    )}

                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" style={{width: '200px'}}>
                        Submit
                    </Button>
                </Form.Item>

            </Form>
        )
    }
}

const InlineTopUpForm = Form.create({name: 'topup_form'})(TopUpForm);


function UserStatus(props) {
    const {userId} = props;
    // console.log(userId);
    let id = 0;
    if (userId !== undefined) {
        id = parseInt(userId) - 1;
        // console.log(id);
    }

    // const id = parseInt(userId);
    return (
        <DrizzleContext.Consumer>
            {
                drizzleContext => {

                    const {drizzle, drizzleState, initialized} = drizzleContext;
                    if (!initialized) {
                        return "Loading...";
                    } else {

                        return (
                            userId === undefined || isNaN(id) || id === -1 ?
                                <Typography>
                                    <Title level={2}>Sorry, you're not an active user in the system currently.</Title>
                                    <Paragraph>Please go to <a href="/Home">Home</a> page.</Paragraph>
                                </Typography>
                                :
                                <Typography>

                                    <Title level={4}>Allocated Bandwidth:
                                        <ContractData contract="WifiAllocation" method="allocatedBandwidth"
                                                      drizzle={drizzle} drizzleState={drizzleState}
                                                      methodArgs={[id]}
                                                      render={res => res / bandwidthScalingFactor}/>
                                        MB/s
                                    </Title>

                                    <Title level={4}>
                                        Price:
                                        <ContractData contract="WifiAllocation" method="actualPrices"
                                                      methodArgs={[id]} render={res => res / priceScalingFactor}
                                                      drizzle={drizzle} drizzleState={drizzleState}/>
                                        wei/s
                                    </Title>
                                    <Title level={4}>
                                        Remain balance: <ContractData contract="WifiAllocation"
                                                                      method="currentBalances"
                                                                      drizzle={drizzle} drizzleState={drizzleState}
                                                                      methodArgs={[id]}/>
                                        wei
                                    </Title>
                                    <Title level={4}>
                                        Burst data: <ContractData contract="WifiAllocation" method="burstVol"
                                                                  methodArgs={[id]}
                                                                  drizzle={drizzle} drizzleState={drizzleState}/>
                                        MB
                                    </Title>
                                    <Divider/>

                                    <Title level={3}>Top up your balance</Title>
                                    <Paragraph>Your address: {props.address}</Paragraph>
                                    <InlineTopUpForm callback={props.callback}/>

                                    <Divider/>

                                    <Paragraph ellipsis={{rows: 3, expandable: true}}>
                                        Notice: Due to the transaction cost, the status is updated
                                        at a certain time interval. Upon refreshing, you may still see the
                                        same result.
                                    </Paragraph>

                                </Typography>

                        )
                    }
                }
            }
        </DrizzleContext.Consumer>
    )
}

class Status extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            address: props.address,
            password: props.password,
            contract: null,
            userIdKey: 0,
        };
        this.topUp = this.topUp.bind(this);
    }

    componentDidMount() {
        const {drizzle} = this.props;
        const contract = drizzle.contracts.WifiAllocation;
        const userIdKey = contract.methods["getUserID"].cacheCall(this.state.address);

        this.setState({userIdKey, contract})
    }

    topUp(values) {
        const {value} = values;
        const w3 = options.web3.httpProvider;
        w3.eth.personal.unlockAccount(this.state.address, this.state.password, 1500).then((response) => {
            this.state.contract.methods.addBalance().send({
                from: this.state.address,
                gas: 3000000,
                value: Number(value)
            }).on('transactionHash', function (hash) {
                console.log('hash:', hash);
            }).on('confirmation', function (confirmationNumber, receipt) {
                console.log('confirmed:', confirmationNumber);
            }).on('receipt', function (receipt) {
                console.log(receipt);
            }).on('error', function (error, receipt) {
                console.log('error', error);
            });
        }).catch((error) => {
            console.log(error);
            message.error({content: "Wrong password!"});
        });
    }

    render() {
        const {WifiAllocation} = this.props.drizzleState.contracts;
        const userId = WifiAllocation.getUserID[this.state.userIdKey];

        return (
            <div>
                <UserStatus userId={userId && userId.value} callback={this.topUp} address={this.state.address}/>
            </div>
        );
    }
}

export default Status;