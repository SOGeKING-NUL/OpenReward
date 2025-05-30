//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {LinkTokenInterface} from "../lib/chainlink-brownie-contracts/contracts/src/v0.8/shared/interfaces/LinkTokenInterface.sol";

import {AutomationRegistrar2_1} from "../lib/chainlink-brownie-contracts/contracts/src/v0.8/automation/v2_1/AutomationRegistrar2_1.sol";

contract Bounty{

    /*
        @title Payment Escrow Contract 
        @notice This contract is created to facilitate payments beetween the bountyProvider and the bountyHunter 
        @dev This implements an Escrow contract with a buyer and seller
    */

   
    //CREATE BOUNTY BY PROVIDER WITH FUNDS, AN OPEN STATUS AND TIME PERIOD
    //HUNTERS JOIN THE BOUNTY
    //HUNTER FINDS SOLUTION AND PR MERGED BEFORE TIME PERIOD ENDS
    //BOUNTY AS COMPLETED
    //BOUNTY MARKED AS CLOSED
    //BOUNTY RELEASED TO HUNTER AFTER BOUNTY CLOSED IF MARKED COMPLETED
    //BOUNTY CANCELLED AND FUNDS RETURNED TO BOUNTY PROVIDER IF TIME PERIOD ENDS AND NOT COMPLETED


    //errors
    error Bounty__TransferFailed();
    error Bounty__UpkeepNotNeeded();
    event Bounty__UpkeepRegistrationFailed();

    //emits
    event BountyCreated(address indexed provider, uint256 amount);
    event HunterAddedSuccessfully(address indexed hunter);
    event BountyCancelled(address indexed bountyProvider, uint256 amount);
    event WinnerSelected(address indexed winner, uint256 amount);
    event BountyCompleted();
    event BountyUnderReview();
    event UpkeepRegistered(uint256 indexed upkeepId);

    enum BountyState{
        OPEN,
        COMPLETED,
        UNDER_REVIEW,
        CLOSED,
        CANCELLED
    }

    address private constant LINK_TOKEN= 0x779877A7B0D9E8603169DdbD7836e478b4624789;
    address private constant REGISTRAR= 0xb0E49c5D0d05cbc241d68c05BC5BA1d1B7B72976;

    address immutable private i_bountyProvider;
    address [] private s_bountyHunters;
    address private s_winnerHunter;
    mapping(address => bool) private s_isBountyHunter; //false by default
    uint256 immutable private i_bountyAmount;
    uint256 immutable private i_timeInterval;
    uint256 immutable private i_reviewTime;
    uint256 private s_initialTimestamp;
    uint256 private s_reviewStartTimestamp;
    uint256 public upkeepId;

    BountyState private s_bountyState;

    constructor(
        uint256 _timeInterval, 
        uint256 _reviewTime,
        uint96 _linkAmount,
        string memory _upkeepName
        ) payable{
        require(msg.value >0, "must send some funds to create Bounty");
        require(_timeInterval > 0, "time interval must be greater than 0");
        require(_reviewTime > 0, "review time must be greater than 0");
        require(_linkAmount > 0, "LINK amount has to be greater than 0");

        i_bountyProvider= msg.sender;
        i_bountyAmount= msg.value;
        i_timeInterval= _timeInterval;
        s_initialTimestamp= block.timestamp;
        i_reviewTime = _reviewTime;
        s_bountyState = BountyState.OPEN;

        _registerUpkeep(_linkAmount, _upkeepName);

        emit BountyCreated(i_bountyProvider, i_bountyAmount);
    }

    function _registerUpkeep(uint295 _linkAmount, string memory _upkeepName) private{

        LinkTokenInterface linkToken= LinkTokenInterface(LINK_TOKEN);

        require(linkToken.transferFrom(msg.sender, address(this), _linkAmount), "Link transfer failed");
        require(linkToken.approve(REGISTRAR, _linkAmount), "LINK approval failed");

        AutomationRegistrar2_1.RegistrationParams memory params= AutomationRegistrar2_1.RegistrationParams({
            name: _upkeepName,
            encryptedEmail: hex"",
            upkeepContract: address(this),
            gasLimit: 500000,
            adminAddress: i_bountyProvider,
            triggerType: 0, //custom logic trigger
            checkData: hex"",
            triggerConfig: hex"",
            offchainConfig: hex"",
            amount: _linkAmount
        });

        /*  struct RegistrationParams {
                string name;
                bytes encryptedEmail;
                address upkeepContract;
                uint32 gasLimit;
                address adminAddress;
                uint8 triggerType;
                bytes checkData;
                bytes triggerConfig;
                bytes offchainConfig;
                uint96 amount;
            }
        */

        upkeepId= AutomationRegistrar2_1(REGISTRAR).registerUpkeep(params);   
        if (upkeepId == 0){
            revert Bounty__UpkeepRegistrationFailed();
        }     

        emit UpkeepRegistered(upkeepId);
    }

    modifier onlyBountyProvider{
        require(msg.sender == i_bountyProvider,"Only bounty provider can call this function");
        _;
    }

    function addHunter() public{
        require(!s_isBountyHunter[msg.sender], "Already added");
        require(msg.sender != i_bountyProvider, "Bounty Provider can't join as hunter");
        require(block.timestamp - s_initialTimestamp < i_timeInterval, "Bounty has expired");
        require(s_bountyState == BountyState.OPEN, "Bounty is not open for hunters");

        s_isBountyHunter[msg.sender] = true;
        s_bountyHunters.push(msg.sender);

        emit HunterAddedSuccessfully(msg.sender);
    }

    function markBountyAsCompleted() public onlyBountyProvider {
        require(s_bountyState == BountyState.OPEN, "Bounty must be open to mark as completed");
        s_bountyState = BountyState.COMPLETED;
        emit BountyCompleted();
    }

    function markBountyUnderReview() public onlyBountyProvider {
        require(s_bountyState == BountyState.COMPLETED, "Bounty must be completed to go under review");
        s_bountyState = BountyState.UNDER_REVIEW;
        s_reviewStartTimestamp = block.timestamp;
        emit BountyUnderReview();
    }

    function selectWinner(address _winner) public onlyBountyProvider {
        require(s_bountyState == BountyState.UNDER_REVIEW, "Bounty must be under review to select winner");
        require(s_isBountyHunter[_winner], "Winner must be a registered hunter");
        require(block.timestamp - s_reviewStartTimestamp <= i_reviewTime, "Review period has expired");
        
        s_winnerHunter = _winner;
    }

    function checkUpkeep(bytes memory /*CheckData*/) public view returns(bool upkeepNeeded, bytes memory /*performData*/){
        bool bountyExpired = (block.timestamp - s_initialTimestamp) > i_timeInterval;
        bool reviewExpired = false;
        bool hasWinner = (s_winnerHunter != address(0));
        bool isClosed = (s_bountyState == BountyState.CLOSED);
        bool isUnderReview = (s_bountyState == BountyState.UNDER_REVIEW);
        
        if (isUnderReview && s_reviewStartTimestamp > 0) {
            reviewExpired = (block.timestamp - s_reviewStartTimestamp) > i_reviewTime;
        }

        // Upkeep needed if:
        // 1. Bounty is closed and has a winner (transfer to winner)
        // 2. Bounty expired without completion (refund to provider)
        // 3. Review period expired without winner selection (refund to provider)
        upkeepNeeded = (isClosed && hasWinner) || 
                      (bountyExpired && s_bountyState == BountyState.OPEN) ||
                      (reviewExpired && !hasWinner);
        
        return(upkeepNeeded, "");
    }

    function performUpkeep(bytes memory /*performData*/) public {
        (bool upkeepNeeded, ) = checkUpkeep("");
        if(!upkeepNeeded){
            revert Bounty__UpkeepNotNeeded();
        }

        bool bountyExpired = (block.timestamp - s_initialTimestamp) > i_timeInterval;
        bool reviewExpired = false;
        bool hasWinner = (s_winnerHunter != address(0));
        bool isUnderReview = (s_bountyState == BountyState.UNDER_REVIEW);
        
        if (isUnderReview && s_reviewStartTimestamp > 0) {
            reviewExpired = (block.timestamp - s_reviewStartTimestamp) > i_reviewTime;
        }

        if (isUnderReview && hasWinner) {
            (bool success,) = s_winnerHunter.call{value: address(this).balance}("");
            s_bountyState = BountyState.CLOSED;
            if(!success){
                revert Bounty__TransferFailed();
            }
            emit WinnerSelected(s_winnerHunter, i_bountyAmount);
        }

        else if ((bountyExpired && s_bountyState == BountyState.OPEN) || (reviewExpired && !hasWinner)) {
            (bool success,) = i_bountyProvider.call{value: address(this).balance}("");
            if(!success){
                revert Bounty__TransferFailed();
            }
            s_bountyState = BountyState.CANCELLED;
            emit BountyCancelled(i_bountyProvider, i_bountyAmount);
        }
    }

    function markBountyAsClosed() public onlyBountyProvider {
        require(s_bountyState == BountyState.UNDER_REVIEW, "Bounty must be under review to close");
        require(s_winnerHunter != address(0), "Winner must be selected before closing");
        s_bountyState = BountyState.CLOSED;
    }

    function markBountyAsCancelled() public onlyBountyProvider {
        require(s_bountyState == BountyState.OPEN, "Can only cancel open bounties");
        (bool success,) = i_bountyProvider.call{value: address(this).balance}("");
        if(!success){
            revert Bounty__TransferFailed();
        }
        s_bountyState = BountyState.CANCELLED;
        emit BountyCancelled(i_bountyProvider, i_bountyAmount);
    }

    function markBountyAsOpen() public onlyBountyProvider {
        require(s_bountyState == BountyState.CANCELLED, "Can only reopen cancelled bounties");
        s_bountyState = BountyState.OPEN;
    }

    //getters

    function getBountyProvider() public view returns(address){
        return i_bountyProvider;
    }

    function getBountyHunters() public view returns(address [] memory){
        return s_bountyHunters;
    }

    function getBountyAmount() public view returns(uint256){
        return i_bountyAmount;
    }

    function getReviewTime() public view returns(uint256){
        return i_reviewTime;
    }

    function getTimeInterval() public view returns(uint256){
        return i_timeInterval;
    }

    function getWinnerHunter() public view returns(address){

        return s_winnerHunter;
    }

    function getBountyIsOpen() public view returns(bool){
        return (s_bountyState == BountyState.OPEN);
    }

    function getBountyIsCompleted() public view returns(bool){
        return (s_bountyState == BountyState.COMPLETED);
    }

    function getBountyIsUnderReview() public view returns(bool){
        return (s_bountyState == BountyState.UNDER_REVIEW);
    }

    function getBountyIsClosed() public view returns(bool){
        return (s_bountyState == BountyState.CLOSED);
    }

    function getBountyIsCancelled() public view returns(bool){
        return (s_bountyState == BountyState.CANCELLED);
    }

    function getRemainingTime() public view returns(uint256){
        if (block.timestamp >= s_initialTimestamp + i_timeInterval) {
            return 0;
        }
        return (s_initialTimestamp + i_timeInterval) - block.timestamp;
    }

    function getRemainingReviewTime() public view returns(uint256){
        if (s_bountyState != BountyState.UNDER_REVIEW || s_reviewStartTimestamp == 0) {
            return 0;
        }
        if (block.timestamp >= s_reviewStartTimestamp + i_reviewTime) {
            return 0;
        }
        return (s_reviewStartTimestamp + i_reviewTime) - block.timestamp;
    }
    
    function getUpkeepId() public view returns (uint256) {
        return upkeepId;
    }
}
