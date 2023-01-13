// SPDX-License-Identifier: MIT
pragma solidity =0.8.7;

import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/utils/ERC1155HolderUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/IERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";

/// @custom:security-contact dev@maxion.tech
contract MaxionNFTMarketplace is
    PausableUpgradeable,
    AccessControlUpgradeable,
    ERC1155HolderUpgradeable
{
    using SafeMathUpgradeable for uint256;
    using SafeERC20Upgradeable for IERC20Upgradeable;

    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant PARAMETER_SETTER_ROLE =
        keccak256("PARAMETER_SETTER_ROLE");

    bytes32 public constant TRADE_HANDLER_ROLE =
        keccak256("TRADE_HANDLER_ROLE");

    IERC20Upgradeable public currencyContract;

    // totalFee = platform fee + partner fee
    // total total fee percent
    uint256 public _totalFeePercent;
    // split of total fee percent
    uint256 public _platformFeePercent;
    uint256 public _partnerFeePercent;
    // minimum trade price (amount * price)
    uint256 public _minimumTradePrice;

    uint256 public constant FEE_DENOMINATOR = 10**10; // 10**10
    IERC1155Upgradeable public nft;

    address public partner;
    address public platformTreasury;

    // struct
    struct TradeData {
        address seller;
        address buyer;
        uint256 tokenId;
        uint256 amount;
        uint256 price;
        bool isBuyLimit;
    }

    event SetTotalFeePercent(uint256 newTotalFeePercent);
    event SetFeePercent(
        uint256 newPlatformFeePercent,
        uint256 newPartnerFeePercent
    );
    event SetMinimumTradePrice(uint256 newMinimumTradePrice);

    event Sold(
        address indexed seller,
        address indexed buyer,
        uint256 tokenId,
        uint256 amount,
        uint256 price,
        uint256 priceAfterFee,
        bool isBuyLimit
    );

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address nftAddress,
        address currencyAddress,
        address platformTreasuryAddress,
        address partnerAddress,
        uint256 totalFeePercent,
        uint256 platformFeePercent,
        uint256 partnerFeePercent,
        uint256 minimumTradePrice,
        address admin
    ) external initializer {
        uint256 totalFeePercentFeeDeno = totalFeePercent.mul(100).div(
            FEE_DENOMINATOR
        );
        uint256 platformFeePercentFeeDeno = platformFeePercent.mul(100).div(
            FEE_DENOMINATOR
        );
        uint256 partnerFeePercentFeeDeno = partnerFeePercent.mul(100).div(
            FEE_DENOMINATOR
        );
        require(
            address(currencyAddress) != address(0),
            "Address must not be zero"
        );
        require(
            address(platformTreasuryAddress) != address(0),
            "Platform treasury address address must not be zero"
        );
        require(
            address(partnerAddress) != address(0),
            "Partner address must not be zero"
        );
        require(
            totalFeePercentFeeDeno <= 100,
            "Total fee must not be more than 100"
        );
        require(
            platformFeePercentFeeDeno.add(partnerFeePercentFeeDeno) == 100,
            "Platform fee + partner fee must be 100%"
        );
        require(
            address(admin) != address(0) && address(admin) != msg.sender,
            "Admin address must not be zero or msg.sender"
        );
        nft = IERC1155Upgradeable(nftAddress);
        currencyContract = IERC20Upgradeable(currencyAddress);
        _totalFeePercent = totalFeePercent;
        _platformFeePercent = platformFeePercent;
        _partnerFeePercent = partnerFeePercent;
        platformTreasury = platformTreasuryAddress;
        partner = partnerAddress;
        _minimumTradePrice = minimumTradePrice;

        emit SetTotalFeePercent(totalFeePercentFeeDeno);
        emit SetFeePercent(platformFeePercentFeeDeno, partnerFeePercentFeeDeno);
        emit SetMinimumTradePrice(minimumTradePrice);

        __Pausable_init();
        __AccessControl_init();
        __ERC1155Holder_init();

        _grantRole(DEFAULT_ADMIN_ROLE, address(admin));
    }

    modifier tradable(TradeData memory tradeData) {
        require(
            tradeData.seller != address(0),
            "Seller address must not be zero"
        );
        require(
            tradeData.buyer != address(0),
            "Buyer address must not be zero"
        );
        require(tradeData.amount > 0, "Amount must be more than 0");
        require(
            nft.balanceOf(tradeData.seller, tradeData.tokenId) >=
                tradeData.amount,
            "Seller insufficient NFT amount"
        );
        require(
            nft.isApprovedForAll(tradeData.seller, address(this)),
            "Seller does not approve NFT yet"
        );
        uint256 totalPrice = tradeData.price.mul(tradeData.amount);

        require(
            totalPrice >= _minimumTradePrice,
            "Total price must be >= minimum trade price"
        );

        require(
            currencyContract.allowance(tradeData.buyer, address(this)) >=
                totalPrice,
            "Buyer insufficient allowance"
        );
        require(
            currencyContract.balanceOf(tradeData.buyer) >= totalPrice,
            "Buyer insufficient balance"
        );
        _;
    }

    function divFeeDenominator(uint256 number)
        public
        pure
        returns (uint256 result)
    {
        return number.div(FEE_DENOMINATOR);
    }

    function calculatePriceAndFee(uint256 price, uint256 amount)
        public
        view
        returns (
            uint256 totalPrice,
            uint256 totalFee,
            uint256 priceAfterFee,
            uint256 platformFee,
            uint256 partnerFee
        )
    {
        require(price > 0, "Price must more than zero");
        require(amount > 0, "Amount must more than zero");
        totalPrice = price.mul(amount);
        totalFee = divFeeDenominator(totalPrice.mul(_totalFeePercent));
        priceAfterFee = totalPrice.sub(totalFee);
        platformFee = divFeeDenominator(totalFee.mul(_platformFeePercent));
        partnerFee = divFeeDenominator(totalFee.mul(_partnerFeePercent));
    }

    function trade(
        address seller,
        address buyer,
        uint256 tokenId,
        uint256 amount,
        uint256 price,
        bool isBuyLimit
    )
        external
        whenNotPaused
        onlyRole(TRADE_HANDLER_ROLE)
        // make struct to prevent stack too deep
        tradable(TradeData(seller, buyer, tokenId, amount, price, isBuyLimit))
    {
        (
            ,
            ,
            uint256 priceAfterFee,
            uint256 platformFee,
            uint256 partnerFee
        ) = calculatePriceAndFee(price, amount);
        emit Sold(
            seller,
            buyer,
            tokenId,
            amount,
            price,
            priceAfterFee,
            isBuyLimit
        );

        // Transfer nft to buyer
        nft.safeTransferFrom(seller, buyer, tokenId, amount, "0x0");

        // Transfer currency to seller
        currencyContract.safeTransferFrom(buyer, seller, priceAfterFee);

        // Transfer currency to owner for platform fee
        currencyContract.safeTransferFrom(buyer, platformTreasury, platformFee);

        // Transfer currency to partner for partner fee
        currencyContract.safeTransferFrom(buyer, partner, partnerFee);
    }

    function setTotalFeePercent(uint256 newTotalFeePercent)
        external
        onlyRole(PARAMETER_SETTER_ROLE)
    {
        uint256 newTotalFeePercentFeeDeno = newTotalFeePercent.mul(100).div(
            FEE_DENOMINATOR
        );
        require(
            newTotalFeePercentFeeDeno <= 100,
            "Fee must not be more than 100"
        );
        _totalFeePercent = newTotalFeePercent;
        emit SetTotalFeePercent(newTotalFeePercentFeeDeno);
    }

    function setFeePercent(
        uint256 newPartnerFeePercent,
        uint256 newPlatformFeePercent
    ) external onlyRole(PARAMETER_SETTER_ROLE) {
        uint256 newPartnerFeePercentFeeDeno = newPartnerFeePercent.mul(100).div(
            FEE_DENOMINATOR
        );
        uint256 newPlatformFeePercentFeeDeno = newPlatformFeePercent
            .mul(100)
            .div(FEE_DENOMINATOR);
        require(
            newPlatformFeePercentFeeDeno.add(newPartnerFeePercentFeeDeno) ==
                100,
            "Platform fee + partner fee must be 100%"
        );

        _partnerFeePercent = newPartnerFeePercent;
        _platformFeePercent = newPlatformFeePercent;
        emit SetFeePercent(
            newPlatformFeePercentFeeDeno,
            newPartnerFeePercentFeeDeno
        );
    }

    function setMinimumTradePrice(uint256 newMinimumTradePrice)
        external
        onlyRole(PARAMETER_SETTER_ROLE)
    {
        _minimumTradePrice = newMinimumTradePrice;
        emit SetMinimumTradePrice(newMinimumTradePrice);
    }

    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    // The following functions are overrides required by Solidity.
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155ReceiverUpgradeable, AccessControlUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
