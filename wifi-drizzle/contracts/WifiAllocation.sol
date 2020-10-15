pragma solidity >= 0.5.0 < 0.7.0;
// pragma experimental ABIEncoderV2; // To support struct as return value

// WifiAllocation.sol: Performs bandwidth allocation according to the proportional rule
// Based on the previous version, and added support for requesting both (1) bandwidth and (2) burst data volume
contract WifiAllocation {
    // Only owner can perform the allocation
    address payable public owner;
    uint public totalBandwidth;
    uint public totalDesiredBandwidth;
    uint public totalDesiredNonDynamic;
    uint public totalDesiredDynamic;
    uint public totalDesiredBurst;
    // The owner can set a minimum unit price of the bandwidth.
    // Unit: wei
    // The price has to be an integer, so it is scaled for higher precision; same for bandwidth
    uint constant bandwidthPriceScalingFactor = 100;
    uint constant bandwidthScalingFactor = 100;
    uint constant burstPriceScalingFactor = 100;
    uint public minBandwidthPrice;
    uint public bandwidthPrice;
    uint public oldPrice;
    uint public minBurstPriceFactor;
    // If user does not specify desired burst, a default value is returned (e.g., 1MB)
    uint public burstPrice;
    // uint public weight; // Changed to local variables to reduce gas cost
    // uint public weightedPrice;
    // The bids to be collected by the contract owner
    uint public pendingCollection;
    uint public totalCollected;
    uint public latestTransaction;
    
    // Keep record of all users
    uint public numUsers;
    uint[] public allocatedBandwidth;
    uint[] public currentBalances;
    bool[] public isActive;
    // Whether the user accepts dynamic bandwidth allocation
    // i.e., the allocated bandwidth may fluctuate, while the bid remains the same
    bool[] public isDynamic;
    // The corresponding prices that users are charged according to
    uint[] public actualPrices;
    uint[] public burstVol;
    
    struct User {
        address userAddress;
        uint desiredBandwidth;
        uint receivedBandwidth;
        uint lastPaymentTime;
        uint thresholdBid;
        uint burst;
    }
    
    mapping(uint => User) users;
    mapping(address => uint) occupiedID;
    mapping(address => uint) pendingWithdrawl;
    
    event UponAllocation(
        uint _numUsers,
        uint[] _allocatedBandwidth,
        uint[] _currentBalances,
        uint[] _actualPrices,
        bool[] _isActive,
        uint[] _burstVol
    );
    
    modifier onlyOwner {
        require(
            msg.sender == owner,
            "Only the owner can call this function"
        );
        _;
    }
    
    modifier onlyNotOwner {
        require(
            msg.sender != owner,
            "The owner cannot call this function"
        );
        _;
    }
    
    modifier requirePayment {
        require(
            msg.value > 0,
            "You must pay some value !"
        );
        _;
    }
    
    constructor(uint _totalBandwidth, uint _minBandwidthPrice, uint _minBurstPriceFactor) public {
        // Initialises with the total bandwidth specified
        owner = msg.sender;
        totalBandwidth = _totalBandwidth;
        minBandwidthPrice = _minBandwidthPrice;
        minBurstPriceFactor = _minBurstPriceFactor;
        bandwidthPrice = minBandwidthPrice * bandwidthPriceScalingFactor;
        // By default totalDesiredBurst is set to 1
        burstPrice = minBurstPriceFactor * 1 * 1;
    }
    
    // Called by a user when joining or exitting the wifi connection
    function uponConnection(uint bandwidth, uint thresholdBid, uint burst) public payable onlyNotOwner {
        latestTransaction = now;
        if(bandwidth > 0) {
            // The user wants to join the connection
            // Check if user already exists
            if(occupiedID[msg.sender] > 0) {
                uint userID = occupiedID[msg.sender];
                // Array index starts from 0, userID starts from 1
                if(isActive[userID - 1]) {
                    /// @notice Case1: The user is still actively connected: renewal of connection
                    connectionRenewal(userID, bandwidth, thresholdBid, burst);
                } else {
                    /// @notice Case2: The user has been disconnected: reentry of connection
                    connectionReentry(userID, bandwidth, thresholdBid, burst);
                }
            } else {
                /// @notice Case3: The user has never connected before: initialisation of connection
                occupiedID[msg.sender] = connectionInitialisation(bandwidth, thresholdBid, burst);
            }
        } else {
            /// @notice Case4: The user wants to quit the connection (by indicating a bandwidth of 0)
            require(occupiedID[msg.sender] > 0, "You are not an existing user!");
            connectionTermination(occupiedID[msg.sender]);
            withdrawBalance();
        }
    }
    
    // Called by an ACTIVE user when he only selects to top up balance
    function addBalance() public payable onlyNotOwner {
        require(occupiedID[msg.sender] > 0, "You are not an existing user!");
        currentBalances[occupiedID[msg.sender] - 1] += msg.value;
    }
    
    // // Called by the owner to check results for testing purposes
    // function getAllocationResults() public onlyOwner {
    // // returns (uint[] memory, uint[] memory, uint, bool[] memory, bool[] memory, uint[] memory) {
    //     // updateBalance();
    //     emit UponAllocation(numUsers, allocatedBandwidth, currentBalances, actualPrices, isActive);
    //     // return (currentBalances, actualPrices, totalCollected, isActive, isDynamic, allocatedBandwidth);
    // }
    
    // // Called by users to check the real-time supply and price
    // function getPriceAndSupply() public view returns (uint, uint, uint, uint) {
    //     // Param1: current unit price of bandwidth (scaled by bandwidthPriceScalingFactor)
    //     // Param2: total demand (totalDesiredBandwidth)
    //     // Param3: total demand of dynamic users (totalDesiredDynamic)
    //     // Param4: total demand of non-dynamic users (totalDesiredNonDynamic)
    //     return (bandwidthPrice, totalDesiredBandwidth, totalDesiredDynamic, totalDesiredNonDynamic);
    // }
    
    // Get user profile
    // function getUserProfile(uint userID) public view returns (User memory) {
    //     return users[userID];
    // }
    
    // Get userID
    function getUserID(address _user) public view returns (uint) {
        return occupiedID[_user];
    }
    
        
    // Perform bandwidth allocation depending on the demand and supply
    function performAllocation() public {
        if(totalDesiredBandwidth <= totalBandwidth) {
            demandNotExceedSupply();
        } else {
            demandExceedSupply();
        }
    }
    
    // Deduct balance according to usage
    // If the balance is not enough, the user is deactived from connection
    function updateBalance() public {
        for(uint i = 0; i < numUsers; i++) {
            if(isActive[i]) {
                uint currentTime = now;
                uint currentFee = bandwidthPrice * users[i + 1].receivedBandwidth * (currentTime - users[i + 1].lastPaymentTime) / (bandwidthPriceScalingFactor * bandwidthScalingFactor);
                // Since there is no capacity limit on burst volume, users are only charged at a constant price specified by owner
                // The cost of burst is VOLUME * UNIT PRICE * TIME DURATION
                currentFee += burstPrice * users[i + 1].burst * (currentTime - users[i + 1].lastPaymentTime) / burstPriceScalingFactor;
                users[i + 1].lastPaymentTime = currentTime;
                if(currentBalances[i] >= currentFee) {
                    currentBalances[i] -= currentFee;
                    pendingCollection += currentFee;
                } else {
                    // Deactivate the user from connection
                    currentFee = currentBalances[i];
                    currentBalances[i] = 0;
                    pendingCollection += currentFee;
                    users[i + 1].receivedBandwidth = 0;
                    totalDesiredBandwidth -= users[i + 1].desiredBandwidth;
                    if(isDynamic[i]) {
                        totalDesiredDynamic -= users[i + 1].desiredBandwidth;
                    } else {
                        totalDesiredNonDynamic -= users[i + 1].desiredBandwidth;
                    }
                    users[i + 1].desiredBandwidth = 0;
                    allocatedBandwidth[i] = 0;
                    actualPrices[i] = 0;
                    isActive[i] = false;
                    isDynamic[i] = false;
                    users[i + 1].burst = 0;
                    burstVol[i] = 0;
                    // Calculate the allocation again since the demand has changed
                    performAllocation();
                }
            }
        }
        collectBids();
        emit UponAllocation(numUsers, allocatedBandwidth, currentBalances, actualPrices, isActive, burstVol);
    }
    
    // Top-up back to user according to the bandwidth wasted
    // e.g. userID 1, bandwidth 1MB, duration 2 second: (1, 100, 200, false)
    function topBack(uint userID, uint bandwidth, uint duration, bool useOldPrice) public onlyOwner {
        uint timingFactor = 100;
        if(isActive[userID]) {
            uint price = useOldPrice ? oldPrice : bandwidthPrice;
            uint topBackFee = price * bandwidth * duration / (bandwidthPriceScalingFactor * bandwidthScalingFactor * timingFactor);
            currentBalances[userID] += topBackFee;
            if (pendingCollection >= topBackFee) {
                pendingCollection -= topBackFee;
            } else {
                pendingCollection = 0;
            }
        }
    }
    
    
    // When the user has never connected before
    function connectionInitialisation(uint bandwidth, uint thresholdBid, uint burst) internal requirePayment returns (uint userID) {
        // Create profile for the new user
        userID = ++numUsers;
        // {userAddress, desiredBandwidth, receivedBandwidth, lastPaymentTime, thresholdBid, burst}
        users[userID] = User(msg.sender, bandwidth, 0, now, thresholdBid, burst);
        isActive.push(true);
        totalDesiredBandwidth += bandwidth;
        // In this case, the thresholdBid is compared with desiredBandwidth * bandwidthPrice to determine whether the user is dynamic
        if(bandwidthPrice * bandwidth / bandwidthPriceScalingFactor > thresholdBid) {
            isDynamic.push(true);
            totalDesiredDynamic += bandwidth;
        } else {
            isDynamic.push(false);
            totalDesiredNonDynamic += bandwidth;
        }
        totalDesiredBurst += burst;
        allocatedBandwidth.push(0);
        currentBalances.push(msg.value);
        actualPrices.push(bandwidthPrice);
        burstVol.push(burst);
        updatePrice(bandwidth * bandwidthScalingFactor, true);
        performAllocation();
        updateBalance();
    }
    
    // When the user is still connected
    // The user can either top up his balance or modify his desired bandwidth
    function connectionRenewal(uint userID, uint bandwidth, uint thresholdBid, uint burst) internal {
        totalDesiredBandwidth = totalDesiredBandwidth + bandwidth - users[userID].desiredBandwidth;
        // Since the user is still active, there is no need to update isDynamic (later in performAllocation())
        if(isDynamic[userID - 1]) {
            totalDesiredDynamic = totalDesiredDynamic + bandwidth - users[userID].desiredBandwidth;
        } else {
            totalDesiredNonDynamic = totalDesiredNonDynamic + bandwidth - users[userID].desiredBandwidth;
        }
        totalDesiredBurst = totalDesiredBurst + burst - users[userID].burst;
        // Update user profile
        currentBalances[userID - 1] += msg.value;
        users[userID].desiredBandwidth = bandwidth;
        users[userID].thresholdBid = thresholdBid;
        users[userID].burst = burst;
        burstVol[userID - 1] = burst;
        // No need to update lastPaymentTime here
        // Check whether the demand is increasing or decreasing, depending on the *actually received bandwidth(WHICH IS SCALED)*
        // e.g., User i desires 40 units bandwidth at price 1.2, but receives 32 units at price 1.5
        // Now he only wants 20 units instead, so the total bid is reduced by 1.5 * (32 - 20)
        // ***NOTE***: receivedBandwidth is scaled by bandwidthScalingFactor
        bool isPositive = (bandwidth * bandwidthScalingFactor >= users[userID].receivedBandwidth);
        updatePrice(isPositive ? (bandwidth * bandwidthScalingFactor - users[userID].receivedBandwidth) : (users[userID].receivedBandwidth - bandwidth * bandwidthScalingFactor), isPositive);
        // --------------------------------------
        // // ***REMOVED***: depending on the *desired bandwidth* instead, otherwise a user who only wants to top up his balance but retaining his desired bandwidth may 
        // // unintentionally increase the price
        // bool isPositive = (bandwidth >= users[userID].desiredBandwidth);
        // updatePrice(isPositive ? (bandwidth - users[userID].desiredBandwidth) * bandwidthScalingFactor : (users[userID].desiredBandwidth - bandwidth) * bandwidthScalingFactor, isPositive);
        performAllocation();
        updateBalance();
    }
    
    // When the user has connected before but was deactivated from connection
    // The owner still keeps the user profile for a certain period
    function connectionReentry(uint userID, uint bandwidth, uint thresholdBid, uint burst) internal requirePayment {
        // Update user profile
        isActive[userID - 1] = true;
        totalDesiredBandwidth += bandwidth;
        // In this case, the thresholdBid is compared with desiredBandwidth * bandwidthPrice to determine whether the user is dynamic
        if(bandwidthPrice * bandwidth / bandwidthPriceScalingFactor > thresholdBid) {
            isDynamic[userID - 1] = true;
            totalDesiredDynamic += bandwidth;
        } else {
            isDynamic[userID - 1] = false;
            totalDesiredNonDynamic += bandwidth;
        }
        totalDesiredBurst += burst;
        currentBalances[userID - 1] += msg.value;
        users[userID].desiredBandwidth = bandwidth;
        users[userID].lastPaymentTime = now;
        users[userID].thresholdBid = thresholdBid;
        users[userID].burst = burst;
        burstVol[userID - 1] = burst;
        updatePrice(bandwidth * bandwidthScalingFactor, true);
        performAllocation();
        updateBalance();
    }
    
    // When the user wants to quit the connection
    // The owner still keeps the user profile for a certain period
    function connectionTermination(uint userID) internal {
        uint deltaBandwidth = users[userID].receivedBandwidth;
        // uint deltaBandwidth = users[userID].desiredBandwidth * bandwidthScalingFactor;
        pendingWithdrawl[users[userID].userAddress] += (currentBalances[userID - 1] + msg.value);
        isActive[userID - 1] = false;
        totalDesiredBandwidth -= users[userID].desiredBandwidth;
        if(isDynamic[userID - 1]) {
            totalDesiredDynamic -= users[userID].desiredBandwidth;
        } else {
            totalDesiredNonDynamic -= users[userID].desiredBandwidth;
        }
        totalDesiredBurst -= users[userID].burst;
        isDynamic[userID - 1] = false;
        currentBalances[userID - 1] = 0;
        users[userID].receivedBandwidth = 0;
        users[userID].desiredBandwidth = 0;
        users[userID].thresholdBid = 0;
        users[userID].burst = 0;
        burstVol[userID - 1] = 0;
        allocatedBandwidth[userID - 1] = 0;
        actualPrices[userID - 1] = 0;
        // Similar to connectionRenewal(), the deltaBandwidth depends on the *actually received bandwidth*
        updatePrice(deltaBandwidth, false);
        performAllocation();
        updateBalance();
    }
    
    // When the total desired bandwidth does not exceed the available bandwidth:
    // Everyone simply gets as much as desired
    function demandNotExceedSupply() internal {
        for(uint i = 0; i < numUsers; i++) {
            if(isActive[i]) {
                actualPrices[i] = bandwidthPrice;
                allocatedBandwidth[i] = users[i + 1].desiredBandwidth * bandwidthScalingFactor;
                users[i + 1].receivedBandwidth = users[i + 1].desiredBandwidth * bandwidthScalingFactor;
            }
        }
    }
    
    // When the total desired bandwidth exceeds the available bandwidth:
    // The resource allocation mechanism is triggered
    function demandExceedSupply() internal {
        // uint weight;
        uint weightedPrice;
        updateIsDynamic();
        if(totalDesiredNonDynamic >= totalBandwidth) {
            // Ignore isDynamic[] and actualPrices[], and all users are charged bandwidthPrice
            // Proportionally allocate the bandwidth according to desired bandwidth
            for(uint i = 0; i < numUsers; i++) {
                if(isActive[i]) {
                    actualPrices[i] = bandwidthPrice;
                    allocatedBandwidth[i] = users[i + 1].desiredBandwidth * totalBandwidth * bandwidthScalingFactor / totalDesiredBandwidth;
                    users[i + 1].receivedBandwidth = allocatedBandwidth[i];
                }
            }
        } else {
            // Non-dynamic users receive desired bandwidth, while dynamic users proportionally share the remaining
            // weight = totalDesiredDynamic * bandwidthPriceScalingFactor / (totalBandwidth - totalDesiredNonDynamic);
            // weightedPrice = weight * bandwidthPrice / bandwidthPriceScalingFactor;
            weightedPrice = totalDesiredDynamic * bandwidthPrice / (totalBandwidth - totalDesiredNonDynamic);
            for(uint i = 0; i < numUsers; i++) {
                if(isActive[i]) {
                    if(isDynamic[i]) {
                        actualPrices[i] = bandwidthPrice;
                        allocatedBandwidth[i] = users[i + 1].desiredBandwidth * (totalBandwidth - totalDesiredNonDynamic) * bandwidthScalingFactor / totalDesiredDynamic;
                        users[i + 1].receivedBandwidth = allocatedBandwidth[i];
                    } else {
                        // actualPrices[i] = weight * bandwidthPrice / bandwidthPriceScalingFactor;
                        actualPrices[i] = weightedPrice;
                        allocatedBandwidth[i] = users[i + 1].desiredBandwidth * bandwidthScalingFactor;
                        users[i + 1].receivedBandwidth = users[i + 1].desiredBandwidth * bandwidthScalingFactor;
                    }
                }
            }
        }
    }
    
    // Update the real-time unit price according to user demand
    // NOTICE: deltaBandwidth is a scaled value
    function updatePrice(uint deltaBandwidth, bool isPositive) internal {
        // uint prevPrice = bandwidthPrice;
        oldPrice = bandwidthPrice;
        if(totalDesiredBandwidth <= totalBandwidth) {
            bandwidthPrice = minBandwidthPrice * bandwidthPriceScalingFactor;
        } else {
            if(isPositive) {
                // New price = Total bid / Total bandwidth = Current price * (Total allocated bandwidth + New demand) / Total bandwidth
                // (1) Total allocated bandwidth < Total bandwidth, i.e., totalDesiredBandwidth - deltaBandwidth < totalBandwidth
                // (2) Total allocated bandwidth = Total bandwidth, i.e., totalDesiredBandwidth - deltaBandwidth >= totalBandwidth
                if(totalDesiredBandwidth * bandwidthScalingFactor - deltaBandwidth < totalBandwidth * bandwidthScalingFactor) {
                    bandwidthPrice = bandwidthPrice * totalDesiredBandwidth / totalBandwidth;
                } else {
                    bandwidthPrice = bandwidthPrice * (totalBandwidth * bandwidthScalingFactor + deltaBandwidth) / (totalBandwidth * bandwidthScalingFactor);
                    // bandwidthPrice = bandwidthPrice * totalDesiredBandwidth * bandwidthScalingFactor / (totalDesiredBandwidth * bandwidthScalingFactor - deltaBandwidth);
                }
            } else {
                // The condition has guaranteed that: Total allocated bandwidth = Total bandwidth
                // New price = Total bid / Total bandwidth = Current Price * (Total bandwidth - Reduced demand) / Total bandwidth
                bandwidthPrice = bandwidthPrice * (totalBandwidth * bandwidthScalingFactor - deltaBandwidth) / (totalBandwidth * bandwidthScalingFactor);
                // bandwidthPrice = bandwidthPrice * totalDesiredBandwidth * bandwidthScalingFactor / (totalDesiredBandwidth * bandwidthScalingFactor + deltaBandwidth);
            }
        }
        burstPrice = minBurstPriceFactor * totalDesiredBurst * totalDesiredBurst;
    }

    // Update whether the user is dynamic according to current demand and price
    function updateIsDynamic() internal {
        // uint weight;
        uint weightedPrice;
        if(totalDesiredNonDynamic >= totalBandwidth) {
            for(uint i = 0; i < numUsers; i++) {
                if(isActive[i]) {
                    // In this case, the thresholdBid is compared with desiredBandwidth * bandwidthPrice to determine whether the user is dynamic
                    if(!isDynamic[i] && bandwidthPrice * users[i + 1].desiredBandwidth / bandwidthPriceScalingFactor > users[i + 1].thresholdBid) {
                        isDynamic[i] = true;
                        totalDesiredNonDynamic -= users[i + 1].desiredBandwidth;
                        totalDesiredDynamic += users[i + 1].desiredBandwidth;
                    } else if (isDynamic[i] && bandwidthPrice * users[i + 1].desiredBandwidth / bandwidthPriceScalingFactor <= users[i + 1].thresholdBid) {
                        isDynamic[i] = false;
                        totalDesiredDynamic -= users[i + 1].desiredBandwidth;
                        totalDesiredNonDynamic += users[i + 1].desiredBandwidth;
                    }
                }
            }
        }
        // Not using *else* here, since a second-round update may be needed after the first *if*
        // weight > 1, so some non-dynamic users after the first round may be tagged as dynamic in this round
        // weight is decreasing, so probably multiple rounds of update are needed
        // ***UPDATE***: Limit the number of cycles to avoid gas over limit
        uint numCycle;
        while(true) {
            numCycle++;
            bool hasChanged;
            if(totalDesiredNonDynamic < totalBandwidth) {
                // weight = totalDesiredDynamic * bandwidthPriceScalingFactor / (totalBandwidth - totalDesiredNonDynamic);
                // weightedPrice = weight * bandwidthPrice / bandwidthPriceScalingFactor;
                weightedPrice = totalDesiredDynamic * bandwidthPrice / (totalBandwidth - totalDesiredNonDynamic);
                // If the bid per unit time exceeds the thresholdBid, the user becomes dynamic
                for(uint i = 0; i < numUsers; i++) {
                    if(isActive[i]) {
                        // In this case, the thresholdBid is compared with desiredBandwidth * weightedPrice to determine whether the user is dynamic
                        if(!isDynamic[i] && weightedPrice * users[i + 1].desiredBandwidth / bandwidthPriceScalingFactor > users[i + 1].thresholdBid) {
                            isDynamic[i] = true;
                            totalDesiredNonDynamic -= users[i + 1].desiredBandwidth;
                            totalDesiredDynamic += users[i + 1].desiredBandwidth;
                            hasChanged = true;
                        } else if(isDynamic[i] && weightedPrice * users[i + 1].desiredBandwidth / bandwidthPriceScalingFactor <= users[i + 1].thresholdBid) {
                            isDynamic[i] = false;
                            totalDesiredDynamic -= users[i + 1].desiredBandwidth;
                            totalDesiredNonDynamic += users[i + 1].desiredBandwidth;
                            hasChanged = true;
                        }
                    }
                }
            }
            // Check numCycle to avoid infinite loop, e.g., when a user keeps changing between the dynamic and non-dynamic users
            if(!hasChanged || numCycle == 10 || totalDesiredNonDynamic == 0) {
                break;
            }
        }
    }
    
        
    // Allow the user to withdraw remaining balance upon connection termination
    function withdrawBalance() internal {
        uint amount = pendingWithdrawl[msg.sender];
        pendingWithdrawl[msg.sender] = 0;
        msg.sender.transfer(amount);
    }
    
    // Allow the owner to collect bids submitted by users
    function collectBids() internal {
        uint amount = pendingCollection;
        pendingCollection = 0;
        totalCollected += amount;
        owner.transfer(amount);
    }
    
    // Clearing all existing user profiles and reset the parameters
    function resetAll() internal onlyOwner {
        for(uint i = 0; i < numUsers; i++) {
            delete(pendingWithdrawl[users[i + 1].userAddress]);
            delete(occupiedID[users[i + 1].userAddress]);
            delete(users[i + 1]);
        }
        delete currentBalances;
        delete allocatedBandwidth;
        delete actualPrices;
        delete isDynamic;
        delete isActive;
        delete numUsers;
        delete totalCollected;
        delete pendingCollection;
        bandwidthPrice = minBandwidthPrice * bandwidthPriceScalingFactor;
        delete totalDesiredBurst;
        delete totalDesiredDynamic;
        delete totalDesiredNonDynamic;
        delete totalDesiredBandwidth;
        delete burstVol;
    }
}
