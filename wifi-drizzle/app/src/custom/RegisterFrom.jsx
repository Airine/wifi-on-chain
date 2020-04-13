import React from 'react';
import {Button, Checkbox, Form, Input,} from 'antd';

class RegisterForm extends React.Component {


    state = {
        confirmDirty: false,
        autoCompleteResult: [],
    };

    cb = (msg) => {
        return () => {
            this.props.switchState(msg);
        }
    };

    handleSubmit = e => {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                console.log('Received values of register form: ', values);
                this.props.homeCallback(values);
                this.props.switchState(true);
            }
        });
    };

    handleConfirmBlur = e => {
        const {value} = e.target;
        this.setState({confirmDirty: this.state.confirmDirty || !!value});
    };

    compareToFirstPassword = (rule, value, callback) => {
        const {form} = this.props;
        if (value && value !== form.getFieldValue('password')) {
            callback('Two passwords that you enter is inconsistent!');
        } else {
            callback();
        }
    };

    validateToNextPassword = (rule, value, callback) => {
        const {form} = this.props;
        if (value && this.state.confirmDirty) {
            form.validateFields(['confirm'], {force: true});
        }
        callback();
    };

    render() {
        const {getFieldDecorator} = this.props.form;

        const formItemLayout = {
            labelCol: {
                xs: {span: 24},
                sm: {span: 8},
            },
            wrapperCol: {
                xs: {span: 24},
                sm: {span: 16},
            },
        };
        const tailFormItemLayout = {
            wrapperCol: {
                xs: {
                    span: 24,
                    offset: 0,
                },
                sm: {
                    span: 16,
                    offset: 8,
                },
            },
        };


        return (
            <Form {...formItemLayout} onSubmit={this.handleSubmit}>

                <Form.Item label="Password" hasFeedback>
                    {getFieldDecorator('password', {
                        rules: [
                            {
                                required: true,
                                message: 'Please input your password!',
                            },
                            {
                                validator: this.validateToNextPassword,
                            },
                        ],
                    })(<Input.Password/>)}
                </Form.Item>
                <Form.Item label="Confirm" hasFeedback>
                    {getFieldDecorator('confirm', {
                        rules: [
                            {
                                required: true,
                                message: 'Please confirm your password!',
                            },
                            {
                                validator: this.compareToFirstPassword,
                            },
                        ],
                    })(<Input.Password onBlur={this.handleConfirmBlur}/>)}
                </Form.Item>

                <Form.Item {...tailFormItemLayout}>
                    {getFieldDecorator('auto', {
                        valuePropName: 'checked',
                        initialValue: true
                    })(
                        <Checkbox>
                            Auto login after registration
                        </Checkbox>,
                    )}
                </Form.Item>

                <Form.Item {...tailFormItemLayout}>
                    {getFieldDecorator('remember', {
                        valuePropName: 'checked',
                        initialValue: true,
                    })(<Checkbox>
                        Remember me
                    </Checkbox>)}
                </Form.Item>

                <Form.Item {...tailFormItemLayout}>
                    <Button type="primary" htmlType="submit">
                        Register
                    </Button>
                    <Button
                        type="link"
                       onClick={this.cb(true)}
                       style={{float: "right"}}
                    >
                        Already have account?
                    </Button>
                </Form.Item>
            </Form>
        );
    }
}

export default RegisterForm;