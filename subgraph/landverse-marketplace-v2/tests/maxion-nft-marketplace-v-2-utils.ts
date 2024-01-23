import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address, Bytes } from "@graphprotocol/graph-ts"
import {
  FeeUpdated,
  MinimumTradePriceUpdated,
  Paused,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
  Sold,
  Unpaused
} from "../generated/MaxionNFTMarketplaceV2/MaxionNFTMarketplaceV2"

export function createFeeUpdatedEvent(
  newPercentageFee: BigInt,
  newFixedFee: BigInt
): FeeUpdated {
  let feeUpdatedEvent = changetype<FeeUpdated>(newMockEvent())

  feeUpdatedEvent.parameters = new Array()

  feeUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "newPercentageFee",
      ethereum.Value.fromUnsignedBigInt(newPercentageFee)
    )
  )
  feeUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "newFixedFee",
      ethereum.Value.fromUnsignedBigInt(newFixedFee)
    )
  )

  return feeUpdatedEvent
}

export function createMinimumTradePriceUpdatedEvent(
  newMinimumTradePrice: BigInt
): MinimumTradePriceUpdated {
  let minimumTradePriceUpdatedEvent = changetype<MinimumTradePriceUpdated>(
    newMockEvent()
  )

  minimumTradePriceUpdatedEvent.parameters = new Array()

  minimumTradePriceUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "newMinimumTradePrice",
      ethereum.Value.fromUnsignedBigInt(newMinimumTradePrice)
    )
  )

  return minimumTradePriceUpdatedEvent
}

export function createPausedEvent(account: Address): Paused {
  let pausedEvent = changetype<Paused>(newMockEvent())

  pausedEvent.parameters = new Array()

  pausedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )

  return pausedEvent
}

export function createRoleAdminChangedEvent(
  role: Bytes,
  previousAdminRole: Bytes,
  newAdminRole: Bytes
): RoleAdminChanged {
  let roleAdminChangedEvent = changetype<RoleAdminChanged>(newMockEvent())

  roleAdminChangedEvent.parameters = new Array()

  roleAdminChangedEvent.parameters.push(
    new ethereum.EventParam("role", ethereum.Value.fromFixedBytes(role))
  )
  roleAdminChangedEvent.parameters.push(
    new ethereum.EventParam(
      "previousAdminRole",
      ethereum.Value.fromFixedBytes(previousAdminRole)
    )
  )
  roleAdminChangedEvent.parameters.push(
    new ethereum.EventParam(
      "newAdminRole",
      ethereum.Value.fromFixedBytes(newAdminRole)
    )
  )

  return roleAdminChangedEvent
}

export function createRoleGrantedEvent(
  role: Bytes,
  account: Address,
  sender: Address
): RoleGranted {
  let roleGrantedEvent = changetype<RoleGranted>(newMockEvent())

  roleGrantedEvent.parameters = new Array()

  roleGrantedEvent.parameters.push(
    new ethereum.EventParam("role", ethereum.Value.fromFixedBytes(role))
  )
  roleGrantedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )
  roleGrantedEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )

  return roleGrantedEvent
}

export function createRoleRevokedEvent(
  role: Bytes,
  account: Address,
  sender: Address
): RoleRevoked {
  let roleRevokedEvent = changetype<RoleRevoked>(newMockEvent())

  roleRevokedEvent.parameters = new Array()

  roleRevokedEvent.parameters.push(
    new ethereum.EventParam("role", ethereum.Value.fromFixedBytes(role))
  )
  roleRevokedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )
  roleRevokedEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )

  return roleRevokedEvent
}

export function createSoldEvent(
  seller: Address,
  buyer: Address,
  nftTo: Address,
  tokenId: BigInt,
  amount: BigInt,
  price: BigInt,
  netAmount: BigInt,
  percentageFeeAmount: BigInt,
  fixedFeeAmount: BigInt,
  isBuyLimit: boolean
): Sold {
  let soldEvent = changetype<Sold>(newMockEvent())

  soldEvent.parameters = new Array()

  soldEvent.parameters.push(
    new ethereum.EventParam("seller", ethereum.Value.fromAddress(seller))
  )
  soldEvent.parameters.push(
    new ethereum.EventParam("buyer", ethereum.Value.fromAddress(buyer))
  )
  soldEvent.parameters.push(
    new ethereum.EventParam("nftTo", ethereum.Value.fromAddress(nftTo))
  )
  soldEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )
  soldEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )
  soldEvent.parameters.push(
    new ethereum.EventParam("price", ethereum.Value.fromUnsignedBigInt(price))
  )
  soldEvent.parameters.push(
    new ethereum.EventParam(
      "netAmount",
      ethereum.Value.fromUnsignedBigInt(netAmount)
    )
  )
  soldEvent.parameters.push(
    new ethereum.EventParam(
      "percentageFeeAmount",
      ethereum.Value.fromUnsignedBigInt(percentageFeeAmount)
    )
  )
  soldEvent.parameters.push(
    new ethereum.EventParam(
      "fixedFeeAmount",
      ethereum.Value.fromUnsignedBigInt(fixedFeeAmount)
    )
  )
  soldEvent.parameters.push(
    new ethereum.EventParam(
      "isBuyLimit",
      ethereum.Value.fromBoolean(isBuyLimit)
    )
  )

  return soldEvent
}

export function createUnpausedEvent(account: Address): Unpaused {
  let unpausedEvent = changetype<Unpaused>(newMockEvent())

  unpausedEvent.parameters = new Array()

  unpausedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )

  return unpausedEvent
}
