// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract LoyaltyPoint is ERC20 {
    /* solhint-disable */
    error InvalidSignature();
    error InvalidPeriod();
    error InvalidNonce();
    error InvalidAddressZero();
    /* solhint-enable */
    event PointMinted(address to, uint256 amount, uint256 nonce);
    event PointRedeemed(address from, uint256 amount, uint256 nonce);
    event PointBurned(address from, uint256 amount, uint256 nonce);
    event NonceUsed(uint256 nonce);
    event LoyaltyExecutorUpdated(address loyaltyExecutor);
    event ValidPeriodUpdated(uint256 _enforcementDate, uint256 _expirationDate);

    address public loyaltyExecutor;
    uint256 public enforcementDate;
    uint256 public expirationDate;
    mapping(uint256 => bool) usedNonces;

    constructor(
        string memory name,
        string memory symbol,
        address _loyaltyExecutor,
        uint256 _enforcementDate,
        uint256 _expirationDate
    ) ERC20(name, symbol) {
        loyaltyExecutor = _loyaltyExecutor;
        _updateValidPeriod(_enforcementDate, _expirationDate);
    }

    function mintTo(
        address to,
        uint256 amount,
        uint256 nonce,
        bytes memory signature
    ) external onlyValidPeriod {
        validateAndUpdateNonce(nonce);
        bytes32 message = keccak256(
            abi.encode(
                "mintTo",
                block.chainid,
                address(this),
                to,
                amount,
                nonce
            )
        );
        verifySignature(message, signature);
        _mint(to, amount);
        emit PointMinted(to, amount, nonce);
    }

    function redeem(
        address from,
        uint256 amount,
        uint256 nonce,
        bytes memory signature
    ) external onlyValidPeriod {
        validateAndUpdateNonce(nonce);
        bytes32 message = keccak256(
            abi.encode(
                "redeem",
                block.chainid,
                address(this),
                from,
                amount,
                nonce
            )
        );
        verifySignature(message, signature);
        _burn(from, amount);
        emit PointRedeemed(from, amount, nonce);
    }

    function burnFrom(
        address from,
        uint256 amount,
        uint256 nonce,
        bytes memory signature
    ) external {
        validateAndUpdateNonce(nonce);
        bytes32 message = keccak256(
            abi.encode(
                "burnFrom",
                block.chainid,
                address(this),
                from,
                amount,
                nonce
            )
        );
        verifySignature(message, signature);
        _burn(from, amount);
        emit PointBurned(from, amount, nonce);
    }

    function updateValidPeriod(
        uint256 _enforcementDate,
        uint256 _expirationDate,
        uint256 nonce,
        bytes memory signature
    ) external virtual {
        validateAndUpdateNonce(nonce);
        bytes32 message = keccak256(
            abi.encode(
                "updateValidPeriod",
                block.chainid,
                address(this),
                _enforcementDate,
                _expirationDate,
                nonce
            )
        );
        verifySignature(message, signature);
        _updateValidPeriod(_enforcementDate, _expirationDate);
    }

    function updateLoyaltyExecutor(
        address _loyaltyExecutor,
        uint256 nonce,
        bytes memory signature
    ) external virtual {
        validateAndUpdateNonce(nonce);
        bytes32 message = keccak256(
            abi.encode(
                "updateLoyaltyExecutor",
                block.chainid,
                address(this),
                _loyaltyExecutor,
                nonce
            )
        );
        verifySignature(message, signature);
        _updateLoyaltyExecutor(_loyaltyExecutor);
    }

    function isValidPeriod() internal view returns (bool) {
        return
            block.timestamp >= enforcementDate &&
            block.timestamp <= expirationDate;
    }

    function verifySignature(
        bytes32 message,
        bytes memory signature
    ) internal view {
        bytes32 signedHash = ECDSA.toEthSignedMessageHash(message);
        if (loyaltyExecutor != ECDSA.recover(signedHash, signature)) {
            revert InvalidSignature();
        }
    }

    function _updateLoyaltyExecutor(address _loyaltyExecutor) internal {
        if (loyaltyExecutor == address(0)) revert InvalidAddressZero();
        loyaltyExecutor = _loyaltyExecutor;
        emit LoyaltyExecutorUpdated(_loyaltyExecutor);
    }

    function _updateValidPeriod(
        uint256 _enforcementDate,
        uint256 _expirationDate
    ) internal {
        enforcementDate = _enforcementDate;
        expirationDate = _expirationDate;
        emit ValidPeriodUpdated(_enforcementDate, _expirationDate);
    }

    function validateAndUpdateNonce(uint256 nonce) internal {
        if (!usedNonces[nonce]) {
            revert InvalidNonce();
        }
        usedNonces[nonce] = true;
        emit NonceUsed(nonce);
    }

    modifier onlyValidPeriod() {
        if (!isValidPeriod()) {
            revert InvalidPeriod();
        }
        _;
    }

    function decimals() public view virtual override returns (uint8) {
        return 1;
    }
}
