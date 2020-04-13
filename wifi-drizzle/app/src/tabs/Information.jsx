import React from 'react';
import {Divider, Typography} from 'antd';
import {makeStyles} from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import {DrizzleContext} from "@drizzle/react-plugin";
import {newContextComponents} from "@drizzle/react-components";

const {Title, Paragraph} = Typography;
const priceScalingFactor = 100;
const bandwidthScalingFactor = 100;
const {ContractData} = newContextComponents;
const useStyles = makeStyles({
    table: {
        minWidth: 650,
    },
});

function SimpleTable(props) {
    const {num} = props;
    // console.log('table:', num);
    let rows = new Array(0);
    if (num !== undefined) {
        let real_num = parseInt(num);
        rows = [...Array(real_num).keys()];
    }
    const classes = useStyles();
    return (
        num === undefined ? <div/> :
            <TableContainer component={Paper}>
                <Table className={classes.table} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>#</TableCell>
                            <TableCell align="right">Active</TableCell>
                            <TableCell align="right">Bandwidth (MB/s)</TableCell>
                            <TableCell align="right">Balance (wei)</TableCell>
                            <TableCell align="right">Price (wei/s)</TableCell>
                            <TableCell align="right">Burst (MB)</TableCell>
                        </TableRow>
                    </TableHead>
                    <DrizzleContext.Consumer>
                        {
                            drizzleContext => {

                                const {drizzle, drizzleState, initialized} = drizzleContext;

                                if (!initialized) {
                                    return "Loading...";
                                } else {

                                    return (
                                        <TableBody>
                                            {rows.map(row => (
                                                <TableRow key={row}>
                                                    <TableCell component="th" scope="row">
                                                        {row}
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <ContractData contract="WifiAllocation" method="isActive"
                                                                      drizzle={drizzle} drizzleState={drizzleState}
                                                                      methodArgs={[row]}
                                                                      render={res => res ? "√" : "x"}/>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <ContractData contract="WifiAllocation"
                                                                      method="allocatedBandwidth"
                                                                      drizzle={drizzle} drizzleState={drizzleState}
                                                                      methodArgs={[row]}
                                                                      render={res => res / bandwidthScalingFactor}/>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <ContractData contract="WifiAllocation" method="currentBalances"
                                                                      drizzle={drizzle} drizzleState={drizzleState}
                                                                      methodArgs={[row]}/>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <ContractData contract="WifiAllocation" method="actualPrices"
                                                                      drizzle={drizzle} drizzleState={drizzleState}
                                                                      methodArgs={[row]}
                                                                      render={res => res / priceScalingFactor}/>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <ContractData contract="WifiAllocation" method="burstVol"
                                                                      drizzle={drizzle} drizzleState={drizzleState}
                                                                      methodArgs={[row]}/>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    )
                                }
                            }
                        }
                    </DrizzleContext.Consumer>
                </Table>
            </TableContainer>
    );
}

class Information extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            userNumKey: null // data key
        };
    }

    componentDidMount() {
        const {drizzle} = this.props;
        const contract = drizzle.contracts.WifiAllocation;

        const userNumKey = contract.methods["numUsers"].cacheCall();

        this.setState({userNumKey});
    }

    render() {
        const {WifiAllocation} = this.props.drizzleState.contracts;
        const numUser = WifiAllocation.numUsers[this.state.userNumKey];
        return (
            <div>
                <DrizzleContext.Consumer>
                    {
                        drizzleContext => {

                            const {drizzle, drizzleState, initialized} = drizzleContext;

                            if (!initialized) {
                                return "Loading...";
                            } else {

                                return (
                                    <Typography>
                                        <Title level={2}>Overall Information of the system </Title>
                                        <br/>
                                        <b>Owner</b>: <ContractData contract="WifiAllocation" method="owner"
                                                                    drizzle={drizzle} drizzleState={drizzleState}/>
                                        <br/>
                                        <b>Total Bandwidth</b>: <ContractData contract="WifiAllocation"
                                                                              drizzle={drizzle}
                                                                              drizzleState={drizzleState}
                                                                              method="totalBandwidth"/> MB/s
                                        <br/>
                                        <b>Number of users: </b> <ContractData contract="WifiAllocation"
                                                                               drizzle={drizzle}
                                                                               drizzleState={drizzleState}
                                                                               method="numUsers"/>
                                        <br/>
                                        <Divider/>

                                        <SimpleTable num={numUser && numUser.value}/>
                                        {/*rows={[...Array(numUser && numUser.value).keys()]}*/}

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
            </div>
        );
    }
}

export default Information;