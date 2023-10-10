import {
  Paused as PausedEvent,
  RoleAdminChanged as RoleAdminChangedEvent,
  RoleGranted as RoleGrantedEvent,
  RoleRevoked as RoleRevokedEvent,
  SetFeePercent as SetFeePercentEvent,
  SetMinimumTradePrice as SetMinimumTradePriceEvent,
  SetTotalFeePercent as SetTotalFeePercentEvent,
  Sold as SoldEvent,
  Unpaused as UnpausedEvent
} from "../generated/MaxionNFTMarketplace/MaxionNFTMarketplace"
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
} from "../generated/schema"

export function handlePaused(event: PausedEvent): void {
  let entity = new Paused(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.account = event.params.account

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRoleAdminChanged(event: RoleAdminChangedEvent): void {
  let entity = new RoleAdminChanged(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.role = event.params.role
  entity.previousAdminRole = event.params.previousAdminRole
  entity.newAdminRole = event.params.newAdminRole

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRoleGranted(event: RoleGrantedEvent): void {
  let entity = new RoleGranted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.role = event.params.role
  entity.account = event.params.account
  entity.sender = event.params.sender

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRoleRevoked(event: RoleRevokedEvent): void {
  let entity = new RoleRevoked(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.role = event.params.role
  entity.account = event.params.account
  entity.sender = event.params.sender

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleSetFeePercent(event: SetFeePercentEvent): void {
  let entity = new SetFeePercent(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.newPlatformFeePercent = event.params.newPlatformFeePercent
  entity.newPartnerFeePercent = event.params.newPartnerFeePercent

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleSetMinimumTradePrice(
  event: SetMinimumTradePriceEvent
): void {
  let entity = new SetMinimumTradePrice(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.newMinimumTradePrice = event.params.newMinimumTradePrice

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleSetTotalFeePercent(event: SetTotalFeePercentEvent): void {
  let entity = new SetTotalFeePercent(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.newTotalFeePercent = event.params.newTotalFeePercent

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleSold(event: SoldEvent): void {
  let entity = new Sold(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.seller = event.params.seller
  entity.buyer = event.params.buyer
  entity.tokenId = event.params.tokenId
  entity.amount = event.params.amount
  entity.price = event.params.price
  entity.priceAfterFee = event.params.priceAfterFee
  entity.isBuyLimit = event.params.isBuyLimit

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleUnpaused(event: UnpausedEvent): void {
  let entity = new Unpaused(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.account = event.params.account

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
