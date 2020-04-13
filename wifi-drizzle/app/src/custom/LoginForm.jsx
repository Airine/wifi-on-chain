import React from 'react';
import {Button, Checkbox, Form, Icon, Input} from 'antd';

class LoginForm extends React.Component {

    cb = (msg) => {
        return () => {
            this.props.switchState(msg);
        }
    };

    handleSubmit = e => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                // console.log('Received values of form: ', values);
                this.props.homeCallback(values);
            }
        });

    };

    render() {
        const {getFieldDecorator} = this.props.form;
        return (

            <Form onSubmit={this.handleSubmit} className="login-form">
                <Form.Item>
                    {getFieldDecorator('address', {
                        rules: [{required: true, message: 'Please input your address!'}],
                    })(
                        <Input
                            prefix={<Icon type="user" style={{color: 'rgba(0,0,0,.25)'}}/>}
                            placeholder="Address"
                        />,
                    )}
                </Form.Item>
                <Form.Item>
                    {getFieldDecorator('password', {
                        rules: [{required: true, message: 'Please input your password!'}],
                    })(
                        <Input
                            prefix={<Icon type="lock" style={{color: 'rgba(0,0,0,.25)'}}/>}
                            type="password"
                            placeholder="Password"
                        />,
                    )}
                </Form.Item>
                <Form.Item>
                    {getFieldDecorator('remember', {
                        valuePropName: 'checked',
                        initialValue: true,
                    })(<Checkbox>Remember me</Checkbox>)}
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" className="login-form-button">
                        Log in
                    </Button>


                    <Button
                        type="link"
                        className="login-form-forgot"
                        onClick={this.cb(false)}
                        style={{float: "right"}}
                    >
                        Register now!
                    </Button>
                </Form.Item>
            </Form>
        );
    }
}

export default LoginForm;