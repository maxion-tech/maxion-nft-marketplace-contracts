// SPDX-License-Identifier: MIT
// Specifies the license type of your contract.
pragma solidity =0.8.7;

// Importing relevant contracts and interfaces from the OpenZeppelin library.
import "@openzeppelin/contracts/security/Pausable.sol"; // Provides functionality to pause the contract.
import "@openzeppelin/contracts/access/AccessControl.sol"; // Provides role-based access control.
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol"; // Makes the contract ERC1155 compatible.
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol"; // Interface for ERC1155 NFTs.
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol"; // Safe methods to interact with ERC20 tokens.

/// @custom:security-contact dev@maxion.tech
contract MaxionNFTMarketplaceV2 is Pausable, AccessControl, ERC1155Holder {
    using SafeERC20 for IERC20; // Using SafeERC20 library for safer ERC20 token operations.

    // Defining role constants to manage permissions in the contract.
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant PARAMETER_SETTER_ROLE =
        keccak256("PARAMETER_SETTER_ROLE");
    bytes32 public constant TRADE_HANDLER_ROLE =
        keccak256("TRADE_HANDLER_ROLE");

    uint256 public constant FEE_DENOMINATOR = 10 ** 10; // A large number for fee calculations to avoid decimals.

    IERC20 public currencyContract; // ERC20 token to be used as a currency for buying NFTs.

    // Various fee parameters.
    uint256 public feePercentage; // Dynamic percentage-based fee.
    uint256 public fixedFee; // Fixed fee in tokens.
    uint256 public minimumTradePrice; // Minimum allowable price for a trade.

    IERC1155 public nft; // ERC1155 NFT contract.

    // Beneficiaries of fees.
    address public tradingFeeWallet;
    address public platformTreasuryWallet;

    // Struct to define trade data.
    struct TradeData {
        address seller;
        address buyer;
        uint256 tokenId;
        uint256 amount;
        uint256 price;
    }

    // Events to log various changes and actions.
    event FeeUpdated(uint256 newPercentageFee, uint256 newFixedFee);
    event MinimumTradePriceUpdated(uint256 newMinimumTradePrice);
    event Sold(
        address indexed seller,
        address indexed buyer,
        uint256 tokenId,
        uint256 amount,
        uint256 price,
        uint256 netAmount, // is old priceAfterFee
        uint256 percentageFeeAmount,
        uint256 fixedFeeAmount,
        bool isBuyLimit
    );

    constructor(
        address nftAddress,
        address currencyAddress,
        address platformTreasuryWalletAddress,
        address tradingFeeWalletAddress,
        uint256 initialFeePercentage,
        uint256 initialFixedFee,
        uint256 initialMinimumTradePrice,
        address admin
    ) {
        // Initial setup checks.
        require(currencyAddress != address(0), "Invalid currency address");
        require(
            platformTreasuryWalletAddress != address(0),
            "Invalid treasury address"
        );
        require(tradingFeeWalletAddress != address(0), "Invalid trading fee wallet address");
        require(
            admin != address(0) && admin != msg.sender,
            "Invalid admin address"
        );
        // check minimum trade price is more than fixed fee
        require(
            initialMinimumTradePrice > initialFixedFee,
            "Minimum trade price must be more than fixed fee"
        );

        // Initializing contract variables.
        nft = IERC1155(nftAddress);
        currencyContract = IERC20(currencyAddress);
        platformTreasuryWallet = platformTreasuryWalletAddress;
        tradingFeeWallet = tradingFeeWalletAddress;
        feePercentage = initialFeePercentage;
        fixedFee = initialFixedFee;
        minimumTradePrice = initialMinimumTradePrice;

        _grantRole(DEFAULT_ADMIN_ROLE, admin); // Granting the admin role.
    }

    // A modifier to ensure that the trade is valid.
    modifier tradable(TradeData memory tradeData) {
        // Various checks to validate the trade.
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
        require(
            tradeData.price >= minimumTradePrice,
            "Total price must be >= minimum trade price"
        );

        uint256 totalPrice = tradeData.price * tradeData.amount;
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

    // Function to calculate trade details and the associated fees.
    function calculateTradeDetails(
        uint256 price,
        uint256 amount
    )
        public
        view
        returns (
            uint256 totalPrice,
            uint256 percentageFee,
            uint256 totalFee,
            uint256 netAmount
        )
    {
        require(price > 0, "Price must more than zero");
        require(amount > 0, "Amount must more than zero");
        totalPrice = price * amount;
        percentageFee = (totalPrice * feePercentage) / FEE_DENOMINATOR;
        totalFee = percentageFee + fixedFee;

        // Ensure that the totalFee isn't greater than totalPrice.
        require(totalFee <= totalPrice, "Fee exceeds total price");

        netAmount = totalPrice - totalFee;
        return (totalPrice, percentageFee, totalFee, netAmount);
    }

    // Function to execute the trade.
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
        tradable(TradeData(seller, buyer, tokenId, amount, price))
    {
        // Calculating the trade details.
        (, uint256 percentageFee, , uint256 netAmount) = calculateTradeDetails(
            price,
            amount
        );

        emit Sold(
            seller,
            buyer,
            tokenId,
            amount,
            price,
            netAmount,
            percentageFee,
            fixedFee,
            isBuyLimit
        );

        // 100% - 89% - 10% - 1% = 0%
        // Transferring NFT and currency.
        nft.safeTransferFrom(seller, buyer, tokenId, amount, "0x0");
        currencyContract.safeTransferFrom(buyer, seller, netAmount); // 89
        currencyContract.safeTransferFrom(buyer, tradingFeeWallet, percentageFee); // 10
        currencyContract.safeTransferFrom(buyer, platformTreasuryWallet, fixedFee); //1
    }

    // Update fee parameters.
    function setFees(
        uint256 newFeePercentage,
        uint256 newFixedFee
    ) external onlyRole(PARAMETER_SETTER_ROLE) {
        require(
            newFixedFee < minimumTradePrice,
            "Fixed fee exceeds minimum trade price"
        );
        // if fee is 100 percent then fixed fee must be zero
        require(
            newFeePercentage < FEE_DENOMINATOR ||
                (newFeePercentage == FEE_DENOMINATOR && newFixedFee == 0),
            "Fee must not be more than 100"
        );
        feePercentage = newFeePercentage;
        fixedFee = newFixedFee;
        emit FeeUpdated(newFeePercentage, newFixedFee);
    }

    // Update minimum trade price.
    function setMinimumTradePrice(
        uint256 newMinimumTradePrice
    ) external onlyRole(PARAMETER_SETTER_ROLE) {
        minimumTradePrice = newMinimumTradePrice;
        emit MinimumTradePriceUpdated(newMinimumTradePrice);
    }

    // Pause the contract.
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    // Unpause the contract.
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    // To ensure that the contract supports the correct interfaces.
    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC1155Receiver, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
