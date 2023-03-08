// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

interface IERC20Token {
    function transfer(address, uint256) external returns (bool);

    function approve(address, uint256) external returns (bool);

    function transferFrom(
        address,
        address,
        uint256
    ) external returns (bool);

    function totalSupply() external view returns (uint256);

    function balanceOf(address) external view returns (uint256);

    function allowance(address, address) external view returns (uint256);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );
}

contract Fundraising {

    address internal cUsdTokenAddress = 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;
    uint internal totalCampaigns = 0;

    // Struct to store fundraising details
    struct Campaign {
        string image;
        string description;
        address beneficiary;
        uint totalRaised;
        uint goal;
    }
    
    // Mapping to store campaigns
    mapping(uint => Campaign) public campaigns;
    
    // Event to emit when a campaign is created
    event CampaignCreated(
        address indexed beneficiary,
        uint goal
    );
    
    // Event to emit when a campaign is funded
    event CampaignFunded(
        address indexed beneficiary,
        uint amount
    );
    
    // Event to emit when a campaign reaches its goal
    event CampaignGoalReached(
        address indexed beneficiary
    );
    
    // Create a new campaign
    function createCampaign(string memory _image, string memory _description, address _beneficiary, uint _goal) public {
        // Only the beneficiary can create a campaign
        require(msg.sender == _beneficiary);
        // Create a new campaign
       

        Campaign storage campaign = campaigns[totalCampaigns];
        campaign.image = _image;
        campaign.description = _description;
        campaign.beneficiary = _beneficiary;
        campaign.totalRaised = 0;
        campaign.goal = _goal;
        totalCampaigns ++;
        
        // Emit the CampaignCreated event
        emit CampaignCreated(_beneficiary, _goal);
    }
    
    // Fund an existing campaign
    function fundCampaign(uint _campaignId, uint _amount) public payable {
        // Get the campaign
        Campaign storage campaign = campaigns[_campaignId];
        
        // Ensure that the sender is not the beneficiary
        require(msg.sender != campaign.beneficiary);
        require(campaign.totalRaised < campaign.goal, "Campaign goal reached");
        
        // Add the amount to the total raised
        campaign.totalRaised += _amount;
        
        // Transfer the amount to the beneficiary
         require(
            IERC20Token(cUsdTokenAddress).transferFrom(
                msg.sender,
                campaign.beneficiary,
                _amount
            ),
            "Transfer failed."
        );
 
        
        // Emit the CampaignFunded event
        emit CampaignFunded(campaign.beneficiary, _amount);
        
        // Check if the campaign has reached its goal
        if (campaign.totalRaised >= campaign.goal) {
            // Emit the CampaignGoalReached event
            emit CampaignGoalReached(campaign.beneficiary);
        }
    }
    
    function getCampaign(uint256 _campaignId)
        public
        view
        returns (
            string memory,
            string memory,
            address,
            uint,
            uint
        )
    {
         Campaign storage campaign = campaigns[_campaignId];
        return (
            campaign.image,
            campaign.description,
            campaign.beneficiary,
            campaign.totalRaised,
            campaign.goal
        );
    }

     function getCampaignLength() public view returns (uint256){
         return (totalCampaigns);
     }
}