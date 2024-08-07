// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import ".././library/TransferHelper.sol";

contract Exchange is Ownable {
    using ECDSA for bytes32;
    using SafeMath for uint256;

    /**
     * @dev Address of the ERC721 contract.
     */
    address public ERC721;

    /**
     * @dev Address of the admin.
     */
    address public admin;

    /**
     * @dev Flag indicating whether the contract has been initialized.
     */
    bool private initialized = false;

    /**
     * @dev Mapping to keep track of seen nonces for each address.
     */
    mapping(address => mapping(bytes32 => bool)) seenNonces;

    /**
     * @dev Mapping to whitelist addresses.
     */
    mapping(address => bool) public whitelistAddress;

    /**
     * @dev Struct to store trade information for ERC721 tokens.
     * @param tradeAddress An array of addresses: [buyer, seller, token, fee, feeAdmin, fighterAddress, coOwnerFighter].
     * @param attributes An array of uint256 values: [amount20, tokenId, feePercent, feePercentAdmin, feeFighter, feeCoOwnerFighter]
     *                   An array of uint256 values: [amount20, tokenId, feePercent feePercentAdmin, feeFighter, feeCoOwnerFighter]
     */
    struct Data {
        address[] tradeAddress;
        uint256[] attributes;
    }

    /**
     * @dev Event emitted when an NFT is bought using ETH.
     * @param addrs An array of addresses: [buyer, seller, token].
     * @param tokenId The ID of the token being bought.
     * @param amount The amount of ETH used for the purchase.
     */
    event BuyNFTETH(address[3] addrs, uint256 tokenId, uint256 amount);

    /**
     * @dev Event emitted when an NFT is put up for auction.
     * @param addrs An array of addresses: [seller, token, tokenAddress].
     * @param tokenId The ID of the token being auctioned.
     * @param amount The starting amount for the auction.
     */
    event AuctionNFT(address[3] addrs, uint256 tokenId, uint256 amount);

    /**
     * @dev Event emitted when an offer for an NFT is accepted.
     * @param addrs An array of addresses: [buyer, seller, token].
     * @param tokenId The ID of the token being bought.
     * @param amount The amount of tokens used for the offer.
     */
    event AcceptOfferNFT(address[3] addrs, uint256 tokenId, uint256 amount);

    /**
     * @dev Modifier to verify that the contract has been initialized.
     * It requires the 'initialized' flag to be true.
     * Reverts with a custom error message if the contract is not initialized.
     */
    modifier requireInitializedContract() {
        require(initialized, "Contract not initialized");
        _;
    }

    /**
     * @dev Modifier to require a non-zero address.
     * @param _address The address to check.
     */
    modifier requireCorrectAddress(address _address) {
        require(
            _address != address(0),
            "Invalid address: Address must not be zero"
        );
        _;
    }

    /**
     * @dev Modifier to require the exact value of ETH sent with the transaction.
     * @param _amountETH The exact amount of ETH required.
     */
    modifier requireExactETHValue(uint256 _amountETH) {
        require(msg.value == _amountETH, "Incorrect ETH value");
        _;
    }

    /**
     * @dev Modifier to verify the signature of the message.
     * @param _nonce The nonce value.
     * @param _tradeAddress An array of addresses: [buyer, seller, token, fee, feeAdmin, fighterAddress, coOwnerFighter].
     * @param _attributes An array of uint256 values: [amount, tokenId, feePercent, feePercentAdmin, feeFighter, feeCoOwnerFighter].
     * @param _signature The signature of the message.
     */
    modifier verifySignature(
        uint256 _nonce,
        address[] memory _tradeAddress,
        uint256[] memory _attributes,
        bytes memory _signature
    ) {
        // This recreates the message hash that was signed on the client.
        bytes32 hash = keccak256(
            abi.encodePacked(_msgSender(), _nonce, _tradeAddress, _attributes)
        );
        bytes32 messageHash = hash.toEthSignedMessageHash();

        // Verify that the message's signer is the owner of the order
        require(
            messageHash.recover(_signature) == owner(),
            "Invalid signature"
        );
        require(
            !seenNonces[_msgSender()][messageHash],
            "Signature has been used"
        );
        seenNonces[_msgSender()][messageHash] = true;
        _;
    }

    /**
     * @dev Initialize the contract with the specified ERC721 token addresses.
     * Only callable when the contract is not yet initialized.
     * @param _erc721 The address of the ERC721 token contract.
     */
    function initialize(address _erc721) external {
        require(!initialized, "Contract is already initialized");
        ERC721 = _erc721;
        admin = _msgSender();
        whitelistAddress[_msgSender()] = true;
        _transferOwnership(_msgSender());
        initialized = true;
    }

    /**
     * @dev Set the address of the ERC721 token contract.
     * Only callable by the contract owner.
     * @param _erc721 The new address of the ERC721 token contract.
     */
    function setERC721(
        address _erc721
    ) external onlyOwner requireCorrectAddress(_erc721) {
        ERC721 = _erc721;
    }

    /**
     * @dev Set the approval status for a specific address in the whitelist.
     * Only callable by the contract owner.
     * @param _address The address to set the approval status for.
     * @param _approved The approval status to set.
     */
    function setWhitelistAddress(
        address _address,
        bool _approved
    ) external onlyOwner requireCorrectAddress(_address) {
        whitelistAddress[_address] = _approved;
    }

    /**
     * @dev Set the admin address.
     * Only callable by the contract owner.
     * @param _admin The new admin address.
     */
    function setAdminAddress(
        address _admin
    ) external onlyOwner requireCorrectAddress(_admin) {
        admin = _admin;
    }

    /**
     * @dev Buy an NFT with ETH.
     * @param _tradeAddress An array of addresses: [buyer, seller, token, fee, feeAdmin, fighterAddress, coOwnerFighter]
     * @param _attributes An array of uint256 values: [amount, tokenId, feePercent, feePercentAdmin, feeFighter, feeCoOwnerFighter]
     * @param nonce Nonce value for signature verification.
     * @param signature Signature provided by the buyer.
     */
    function buyNFTETH(
        address[] memory _tradeAddress,
        uint256[] memory _attributes,
        uint256 nonce,
        bytes memory signature
    )
        external
        payable
        requireInitializedContract
        verifySignature(nonce, _tradeAddress, _attributes, signature)
        requireExactETHValue(_attributes[0])
    {
        Data memory tradeInfo = Data({
            tradeAddress: _tradeAddress,
            attributes: _attributes
        });

        _validateFeePercentages(_attributes);

        uint256 totalAmountPayment = _transferTokens(
            tradeInfo.tradeAddress,
            tradeInfo.attributes,
            true
        );

        if (totalAmountPayment > 0) {
            TransferHelper.safeTransferETH(
                tradeInfo.tradeAddress[1],
                totalAmountPayment
            );
        }

        IERC721(ERC721).safeTransferFrom(
            tradeInfo.tradeAddress[1],
            _msgSender(),
            tradeInfo.attributes[1]
        );

        emit BuyNFTETH(
            [
                _msgSender(),
                tradeInfo.tradeAddress[1],
                tradeInfo.tradeAddress[2]
            ],
            tradeInfo.attributes[1],
            tradeInfo.attributes[0]
        );
    }

    /**
     * @dev Auction an NFT.
     * @param _tradeAddress An array of addresses: [buyer, seller, token, fee, feeAdmin, fighterAddress, coOwnerFighter]
     * @param _attributes An array of uint256 values: [amount, tokenId, feePercent, feePercentAdmin, feeFighter, feeCoOwnerFighter]
     */
    function auctionNFT(
        address[] memory _tradeAddress,
        uint256[] memory _attributes
    ) external requireInitializedContract {
        Data memory tradeInfo = Data({
            tradeAddress: _tradeAddress,
            attributes: _attributes
        });

        _validateFeePercentages(_attributes);

        require(
            whitelistAddress[_msgSender()] == true,
            "Address is not in whitelist"
        );

        // check allowance of buyer
        require(
            IERC20(tradeInfo.tradeAddress[2]).allowance(
                tradeInfo.tradeAddress[0],
                address(this)
            ) >= tradeInfo.attributes[0],
            "token allowance too low"
        );

        if (tradeInfo.tradeAddress[1] == admin) {
            require(
                IERC721(ERC721).isApprovedForAll(admin, address(this)),
                "tokenId do not approve for contract"
            );
        } else {
            require(
                IERC721(ERC721).getApproved(tradeInfo.attributes[1]) ==
                    address(this),
                "tokenId do not approve for contract"
            );
        }

        uint256 totalAmountPayment = _transferTokens(
            tradeInfo.tradeAddress,
            tradeInfo.attributes,
            false
        );

        if (totalAmountPayment > 0) {
            IERC20(tradeInfo.tradeAddress[2]).transferFrom(
                tradeInfo.tradeAddress[0],
                tradeInfo.tradeAddress[1],
                totalAmountPayment
            );
        }

        IERC721(ERC721).safeTransferFrom(
            tradeInfo.tradeAddress[1],
            tradeInfo.tradeAddress[0],
            tradeInfo.attributes[1]
        );

        emit AuctionNFT(
            [
                _msgSender(),
                tradeInfo.tradeAddress[1],
                tradeInfo.tradeAddress[2]
            ],
            tradeInfo.attributes[1],
            tradeInfo.attributes[0]
        );
    }

    /**
     * @dev Accepts an offer for an NFT.
     * @param _tradeAddress The array of trade addresses containing [buyer, seller, token, fee, feeAdmin, fighterAddress, coOwnerFighter].
     * @param _attributes The array of attributes containing [amount, tokenId, feePercent, feePercentAdmin, feeFighter, feeCoOwnerFighter].
     * @param nonce The nonce for signature verification.
     * @param signature The signature to verify the message.
     */
    function acceptOfferNFT(
        address[] memory _tradeAddress,
        uint256[] memory _attributes,
        uint256 nonce,
        bytes memory signature
    )
        external
        requireInitializedContract
        verifySignature(nonce, _tradeAddress, _attributes, signature)
    {
        Data memory tradeInfo = Data({
            tradeAddress: _tradeAddress,
            attributes: _attributes
        });

        _validateFeePercentages(_attributes);

        require(
            IERC721(ERC721).getApproved(tradeInfo.attributes[1]) ==
                address(this),
            "tokenId do not approve for contract"
        );
        // check allowance of buyer
        require(
            IERC20(tradeInfo.tradeAddress[2]).allowance(
                tradeInfo.tradeAddress[0],
                address(this)
            ) >= tradeInfo.attributes[0],
            "token allowance too low"
        );
        uint256 totalAmountPayment = _transferTokens(
            tradeInfo.tradeAddress,
            tradeInfo.attributes,
            false
        );

        if (totalAmountPayment > 0) {
            IERC20(tradeInfo.tradeAddress[2]).transferFrom(
                tradeInfo.tradeAddress[0],
                _msgSender(),
                totalAmountPayment
            );
        }

        IERC721(ERC721).safeTransferFrom(
            tradeInfo.tradeAddress[1],
            tradeInfo.tradeAddress[0],
            tradeInfo.attributes[1]
        );

        emit AcceptOfferNFT(
            [
                _msgSender(),
                tradeInfo.tradeAddress[1],
                tradeInfo.tradeAddress[2]
            ],
            tradeInfo.attributes[1],
            tradeInfo.attributes[0]
        );
    }

    /**
     * @dev Function to transfer tokens as part of a trade.
     * @param _tradeAddress Array of trade addresses [buyer, seller, token, fee, feeAdmin, fighterAddress, coOwnerFighter].
     * @param _attributes Array of trade attributes [amount20, tokenId, feePercent, feePercentAdmin, feeFighter, feeCoOwnerFighter].
     * @param _isTransferETH Boolean indicating whether it's a transfer of Ether (ETH).
     * @return The total payment value.
     */
    function _transferTokens(
        address[] memory _tradeAddress,
        uint256[] memory _attributes,
        bool _isTransferETH
    ) private returns (uint256) {
        // Check and calculate transfer values for fees
        uint256[5] memory transferValues = _checkFeeProductExits(
            _tradeAddress,
            _attributes
        );

        // Transfer token or coin to the respective addresses
        for (uint256 i = 1; i < 5; i++) {
            if (transferValues[i] != 0) {
                if (!_isTransferETH) {
                    IERC20(_tradeAddress[2]).transferFrom(
                        _tradeAddress[0],
                        _tradeAddress[i + 2],
                        transferValues[i]
                    );
                } else {
                    TransferHelper.safeTransferETH(
                        _tradeAddress[i + 2],
                        transferValues[i]
                    );
                }
            }
        }

        return transferValues[0];
    }

    /**
     * @dev Check the fees for a product and calculate the transfer values.
     * @param _tradeAddress An array of addresses: [buyer, seller, token, fee, feeAdmin, fighter, coOwnerFighter]
     * @param _attributes An array of uint256 values: [amount20, tokenId, feePercent, feePercentAdmin, feeFighter, feeCoOwnerFighter]
     * @return transferValues An array of uint256 values: [totalAmount, feeOwner, feeAdmin, feeFighter, feeCoOwnerFighter]
     */
    function _checkFeeProductExits(
        address[] memory _tradeAddress,
        uint256[] memory _attributes
    ) private pure returns (uint256[5] memory transferValues) {
        uint256 totalFeeTrade;

        // Check fee for owner
        for (uint256 i = 3; i < _tradeAddress.length; i++) {
            if (_tradeAddress[i] != address(0)) {
                transferValues[i - 2] =
                    (_attributes[0] * _attributes[i - 1]) /
                    1000;
                totalFeeTrade += transferValues[i - 2];
            }
        }

        // Calculate total amount
        transferValues[0] = _attributes[0] - totalFeeTrade;
    }

    /**
     * @dev Function to validate the sum of fee percentages.
     * @param _attributes Array of trade attributes [amount20, tokenId, feePercent, feePercentAdmin, feeFighter, feeCoOwnerFighter].
     */
    function _validateFeePercentages(
        uint256[] memory _attributes
    ) private pure {
        // Calculate the total fee percentage
        uint256 totalPercentFee = _attributes[2] +
            _attributes[3] +
            _attributes[4] +
            _attributes[5];

        // Check if the total fee percentage exceeds the maximum limit of 1000
        require(
            totalPercentFee <= 1000,
            "Total fee percentages exceed the maximum limit of 1000"
        );
    }
}
