import React from 'react';
import {Button, Divider, Form, InputNumber, message, Modal, Result, Switch, Typography} from 'antd';
import {instanceOf} from 'prop-types'
import {Cookies} from 'react-cookie'

const {Title, Paragraph} = Typography;

const txnMessage = 'transaction';

class RequestForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            advanced: false,
            // loading: props.loading
        };
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
                // console.log('Received values of form: ', values);
                this.props.callback(values);
            }
        });
    };

    render() {
        const {form} = this.props;
        const {getFieldDecorator} = form;
        //
        let adv = this.state.advanced ?
            <Form.Item label="Burst data volume (MB)">
                {getFieldDecorator('burst')(
                    <InputNumber style={{width: '200px'}} min={1} max={200}/>
                )}
            </Form.Item> : <div/>;

        return (
            <Form style={{width: '200px', marginTop: '50px', margin: 'auto'}} layout="vertical"
                  onSubmit={this.handleSubmit}>
                <Form.Item label="Desired bandwidth (MB/s):">
                    {getFieldDecorator('bandwidth')(
                        <InputNumber style={{width: '200px'}} min={0} max={50}/>
                    )}

                </Form.Item>

                <Form.Item label="Threshold bid (Per second):">
                    {getFieldDecorator('bid')(
                        <InputNumber style={{width: '200px'}} min={0}/>
                    )}
                </Form.Item>

                <Form.Item label="Balance to be credited (wei):">
                    {getFieldDecorator('deposit')(
                        <InputNumber style={{width: '200px'}} min={0}/>
                    )}
                </Form.Item>

                {adv}

                <div style={{marginBottom: '10px'}}>
                    <Switch style={{display: 'inline-block'}} onChange={this.onChange}/> <p
                    style={{display: 'inline-block', marginLeft: '15px'}}> Advanced Setting </p>
                </div>


                <Form.Item>
                    <Button type="primary" htmlType="submit" style={{width: '200px'}} loading={this.props.loading}>
                        Submit
                    </Button>
                </Form.Item>

            </Form>
        )
    }
}

const InlineRequestForm = Form.create({name: 'request_form'})(RequestForm);

class Home extends React.Component {

    static propTypes = {
        cookies: instanceOf(Cookies).isRequired
    };

    constructor(props) {
        super(props);
        const {cookies} = props;
        this.state = {
            address: props.address || cookies.get('address'),
            password: props.password || cookies.get('password'),
            contract: null,
            loading: false,
            txnModal: false,
            advanced: false,
            success: false,
            receipt: NaN,
            error: NaN,
            totalTime: 0,
        };
        this.onChange = this.onChange.bind(this);
        this.setUpConnection = this.setUpConnection.bind(this);
        this.setTxnVisible = this.setTxnVisible.bind(this);
    }


    componentDidMount() {
        const {drizzle} = this.props;
        const contract = drizzle.contracts.WifiAllocation;
        // console.log(contract);
        // const userId = contract.methods["getUserID"].cacheCall(this.state.userAdd);
        this.setState({contract});
    }

    onChange(checked) {
        this.setState({
            advanced: checked
        })
    }

    setTxnVisible(visibility) {
        this.setState({txnModal: visibility});
    }

    setUpConnection(values) {
        // let start = new Date().getTime();
        this.setState({loading: true});
        message.loading({content: 'Processing your request', key: txnMessage});
        console.log(values);
        let burst = values.burst ? values.burst : 1;
        values["burst"] = burst;
        values["addr"] = this.state.address;
        values["pw"] = this.state.password;
        console.log(values);
        fetch('http://192.168.1.241:5000', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(values)
        }).then(function(response) {
            console.log(response);
            message.success({content: 'Request approved!', key: txnMessage});
            return response.json()
        }).then(data => console.log(data));
        // console.log(this.state);
    }

    render() {

        return (
            <div>
                <Typography>
                    <Title level={2}>Request for Bandwidth</Title>
                    <Title level={4}>Please indicate your demand for bandwidth:</Title>

                    <Divider/>

                    <InlineRequestForm callback={this.setUpConnection} loading={this.state.loading}/>

                    <Divider/>
                    <Paragraph ellipsis={{rows: 3, expandable: true}}>
                        Notice: The actual bandwidth allocated to you can be less than what you desire.
                        The system periodically deducts from your balance according to the current price.
                        The bid refers to the amount deducted per unit time. If the bid is less than the
                        threshold, you might be guaranteed to fully receive your desired bandwidth.
                    </Paragraph>

                </Typography>
                <Modal
                    title="Request result:"
                    centered
                    visible={false}
                    onCancel={() => this.setTxnVisible(false)}
                    onOk={() => this.setTxnVisible(false)}>
                    {this.state.success ?
                        <Result
                            status="success"
                            title="Your request is approved."
                            subTitle="Note: Blow is your receipt.">
                            <Typography>
                                <Paragraph>{this.state.receipt}</Paragraph>
                                <Divider/>
                                <Paragraph>Time cost: {this.state.totalTime} ms </Paragraph>
                            </Typography>
                        </Result>
                        :
                        <Result
                            status="error"
                            title="Unexpected error occurred."
                            subTitle="Note: Blow is error massage.">
                            <Typography>
                                <Paragraph>{this.state.error}</Paragraph>
                                <Divider/>
                                <Paragraph>Time cost: {this.state.totalTime} ms </Paragraph>
                            </Typography>
                        </Result>
                    }
                </Modal>
            </div>

        );
    }
}

export default Home;