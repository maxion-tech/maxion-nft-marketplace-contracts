import { newMockEvent } from "matchstick-as"
import { ethereum, Address, Bytes, BigInt } from "@graphprotocol/graph-ts"
import {
  Paused,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
  SetFeePercent,
  SetMinimumTradePrice,
  SetTotalFeePercent,
  Sold,
  Unpaused
} from "../generated/MaxionNFTMarketplace/MaxionNFTMarketplace"

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

export function createSetFeePercentEvent(
  newPlatformFeePercent: BigInt,
  newPartnerFeePercent: BigInt
): SetFeePercent {
  let setFeePercentEvent = changetype<SetFeePercent>(newMockEvent())

  setFeePercentEvent.parameters = new Array()

  setFeePercentEvent.parameters.push(
    new ethereum.EventParam(
      "newPlatformFeePercent",
      ethereum.Value.fromUnsignedBigInt(newPlatformFeePercent)
    )
  )
  setFeePercentEvent.parameters.push(
    new ethereum.EventParam(
      "newPartnerFeePercent",
      ethereum.Value.fromUnsignedBigInt(newPartnerFeePercent)
    )
  )

  return setFeePercentEvent
}

export function createSetMinimumTradePriceEvent(
  newMinimumTradePrice: BigInt
): SetMinimumTradePrice {
  let setMinimumTradePriceEvent = changetype<SetMinimumTradePrice>(
    newMockEvent()
  )

  setMinimumTradePriceEvent.parameters = new Array()

  setMinimumTradePriceEvent.parameters.push(
    new ethereum.EventParam(
      "newMinimumTradePrice",
      ethereum.Value.fromUnsignedBigInt(newMinimumTradePrice)
    )
  )

  return setMinimumTradePriceEvent
}

export function createSetTotalFeePercentEvent(
  newTotalFeePercent: BigInt
): SetTotalFeePercent {
  let setTotalFeePercentEvent = changetype<SetTotalFeePercent>(newMockEvent())

  setTotalFeePercentEvent.parameters = new Array()

  setTotalFeePercentEvent.parameters.push(
    new ethereum.EventParam(
      "newTotalFeePercent",
      ethereum.Value.fromUnsignedBigInt(newTotalFeePercent)
    )
  )

  return setTotalFeePercentEvent
}

export function createSoldEvent(
  seller: Address,
  buyer: Address,
  tokenId: BigInt,
  amount: BigInt,
  price: BigInt,
  priceAfterFee: BigInt,
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
      "priceAfterFee",
      ethereum.Value.fromUnsignedBigInt(priceAfterFee)
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
