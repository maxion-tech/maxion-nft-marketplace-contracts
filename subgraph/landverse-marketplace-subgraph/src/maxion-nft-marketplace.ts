import { BigDecimal, BigInt } from "@graphprotocol/graph-ts"
import {
  Paused as PausedEvent,
  SetFeePercent as SetFeePercentEvent,
  SetMinimumTradePrice as SetMinimumTradePriceEvent,
  SetTotalFeePercent as SetTotalFeePercentEvent,
  Sold as SoldEvent,
  Unpaused as UnpausedEvent
} from "../generated/MaxionNFTMarketplace/MaxionNFTMarketplace"
import {
  Marketplace,
  Transaction,
  TransactionDayData,
  TransactionHourData,
  TransactionMonthData,
} from "../generated/schema"

export const NFT_MARKETPLACE_ID = "1"
export const DECIMALS = BigDecimal.fromString("1000000000000000000")
export const FEE_DENOMINATOR = BigDecimal.fromString("100000000")

export function handleSold(event: SoldEvent): void {
  const marketplace = loadMarketplace()
  let transaction = new Transaction(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  transaction.seller = event.params.seller
  transaction.buyer = event.params.buyer
  transaction.tokenId = event.params.tokenId
  transaction.amount = event.params.amount.toBigDecimal().div(DECIMALS)
  transaction.price = event.params.price.toBigDecimal().div(DECIMALS)
  transaction.priceAfterFee = event.params.priceAfterFee.toBigDecimal().div(DECIMALS)
  transaction.platformFeePercent = marketplace.platformFeePercent.toBigDecimal()
  transaction.partnerFeePercent = marketplace.partnerFeePercent.toBigDecimal()
  transaction.totalFee = transaction.price.minus(transaction.priceAfterFee)
  transaction.totalFeePercent = marketplace.totalFeePercent.toBigDecimal()
  transaction.platformFeeAmount = transaction.totalFee.times(marketplace.platformFeePercent.toBigDecimal()).div(BigDecimal.fromString("100.00"))
  transaction.partnerFeeAmount = transaction.totalFee.times(marketplace.partnerFeePercent.toBigDecimal()).div(BigDecimal.fromString("100.00"))

  transaction.isBuyLimit = event.params.isBuyLimit

  transaction.blockNumber = event.block.number
  transaction.blockTimestamp = event.block.timestamp
  transaction.transactionHash = event.transaction.hash

  transaction.save()

  updateTransactionHourData(event, marketplace)
  updateTransactionDayData(event, marketplace)
  updateTransactionMonthData(event, marketplace)
}

function updateTransactionHourData(event: SoldEvent, marketplace: Marketplace): void {
  let hourStartTimestamp = event.block.timestamp.div(BigInt.fromI32(3600)).times(BigInt.fromI32(3600))
  let transactionHourData = TransactionHourData.load(hourStartTimestamp.toString())

  if (transactionHourData == null) {
    transactionHourData = new TransactionHourData(hourStartTimestamp.toString())
    transactionHourData.startUnixTime = hourStartTimestamp
    transactionHourData.totalAmount = BigInt.fromI32(0)
    transactionHourData.totalPrice = BigDecimal.fromString("0")
    transactionHourData.totalPriceAfterFee = BigDecimal.fromString("0")
    transactionHourData.totalPlatformFee = BigDecimal.fromString("0")
    transactionHourData.totalPartnerFee = BigDecimal.fromString("0")
    transactionHourData.totalFee = BigDecimal.fromString("0")
    transactionHourData.totalTransaction = BigInt.fromI32(0)
  }

  transactionHourData.totalAmount = transactionHourData.totalAmount.plus(event.params.amount)
  transactionHourData.totalPrice = transactionHourData.totalPrice.plus(event.params.price.toBigDecimal().div(DECIMALS))
  transactionHourData.totalPriceAfterFee = transactionHourData.totalPriceAfterFee.plus(event.params.priceAfterFee.toBigDecimal().div(DECIMALS))
  transactionHourData.totalFee = transactionHourData.totalPrice.minus(transactionHourData.totalPriceAfterFee)
  transactionHourData.totalPlatformFee = transactionHourData.totalFee.times(marketplace.platformFeePercent.toBigDecimal()).div(BigDecimal.fromString("100.00"))
  transactionHourData.totalPartnerFee = transactionHourData.totalFee.times(marketplace.partnerFeePercent.toBigDecimal()).div(BigDecimal.fromString("100.00"))
  transactionHourData.totalTransaction = transactionHourData.totalTransaction.plus(BigInt.fromI32(1))

  transactionHourData.save()
}

function updateTransactionDayData(event: SoldEvent, marketplace: Marketplace): void {
  let dayStartTimestamp = event.block.timestamp.div(BigInt.fromI32(86400)).times(BigInt.fromI32(86400))
  let transactionDayData = TransactionDayData.load(dayStartTimestamp.toString())

  if (transactionDayData == null) {
    transactionDayData = new TransactionDayData(dayStartTimestamp.toString())
    transactionDayData.startUnixTime = dayStartTimestamp
    transactionDayData.totalAmount = BigInt.fromI32(0)
    transactionDayData.totalPrice = BigDecimal.fromString("0")
    transactionDayData.totalPriceAfterFee = BigDecimal.fromString("0")
    transactionDayData.totalPlatformFee = BigDecimal.fromString("0")
    transactionDayData.totalPartnerFee = BigDecimal.fromString("0")
    transactionDayData.totalFee = BigDecimal.fromString("0")
    transactionDayData.totalTransaction = BigInt.fromI32(0)
  }

  transactionDayData.totalAmount = transactionDayData.totalAmount.plus(event.params.amount)
  transactionDayData.totalPrice = transactionDayData.totalPrice.plus(event.params.price.toBigDecimal().div(DECIMALS))
  transactionDayData.totalPriceAfterFee = transactionDayData.totalPriceAfterFee.plus(event.params.priceAfterFee.toBigDecimal().div(DECIMALS))

  transactionDayData.totalFee = transactionDayData.totalPrice.minus(transactionDayData.totalPriceAfterFee)
  transactionDayData.totalPlatformFee = transactionDayData.totalFee.times(marketplace.platformFeePercent.toBigDecimal()).div(BigDecimal.fromString("100.00"))
  transactionDayData.totalPartnerFee = transactionDayData.totalFee.times(marketplace.partnerFeePercent.toBigDecimal()).div(BigDecimal.fromString("100.00"))
  transactionDayData.totalTransaction = transactionDayData.totalTransaction.plus(BigInt.fromI32(1))

  transactionDayData.save()
}

function updateTransactionMonthData(event: SoldEvent, marketplace: Marketplace): void {
  let monthStartTimestamp = event.block.timestamp.div(BigInt.fromI32(2592000)).times(BigInt.fromI32(2592000))
  let transactionMonthData = TransactionMonthData.load(monthStartTimestamp.toString())

  if (transactionMonthData == null) {
    transactionMonthData = new TransactionMonthData(monthStartTimestamp.toString())
    transactionMonthData.startUnixTime = monthStartTimestamp
    transactionMonthData.totalAmount = BigInt.fromI32(0)
    transactionMonthData.totalPrice = BigDecimal.fromString("0")
    transactionMonthData.totalPriceAfterFee = BigDecimal.fromString("0")
    transactionMonthData.totalPlatformFee = BigDecimal.fromString("0")
    transactionMonthData.totalPartnerFee = BigDecimal.fromString("0")
    transactionMonthData.totalFee = BigDecimal.fromString("0")
    transactionMonthData.totalTransaction = BigInt.fromI32(0)
  }

  transactionMonthData.totalAmount = transactionMonthData.totalAmount.plus(event.params.amount)
  transactionMonthData.totalPrice = transactionMonthData.totalPrice.plus(event.params.price.toBigDecimal().div(DECIMALS))
  transactionMonthData.totalPriceAfterFee = transactionMonthData.totalPriceAfterFee.plus(event.params.priceAfterFee.toBigDecimal().div(DECIMALS))
  transactionMonthData.totalFee = transactionMonthData.totalPrice.minus(transactionMonthData.totalPriceAfterFee)
  transactionMonthData.totalPlatformFee = transactionMonthData.totalFee.times(marketplace.platformFeePercent.toBigDecimal()).div(BigDecimal.fromString("100.00"))
  transactionMonthData.totalPartnerFee = transactionMonthData.totalFee.times(marketplace.partnerFeePercent.toBigDecimal()).div(BigDecimal.fromString("100.00"))
  transactionMonthData.totalTransaction = transactionMonthData.totalTransaction.plus(BigInt.fromI32(1))

  transactionMonthData.save()
}

function loadMarketplace(): Marketplace {
  let marketplace = Marketplace.load(NFT_MARKETPLACE_ID)
  if (marketplace == null) {
    marketplace = new Marketplace(NFT_MARKETPLACE_ID)
    marketplace.totalFeePercent = BigInt.fromI32(0)
    marketplace.minimumTradePrice = BigInt.fromI32(0)
    marketplace.platformFeePercent = BigInt.fromI32(0)
    marketplace.partnerFeePercent = BigInt.fromI32(0)
    marketplace.paused = false
  }
  return marketplace
}

export function handleSetMinimumTradePrice(
  event: SetMinimumTradePriceEvent
): void {
  const marketplace = loadMarketplace()
  marketplace.minimumTradePrice = event.params.newMinimumTradePrice
  marketplace.save()
}

export function handleSetTotalFeePercent(event: SetTotalFeePercentEvent): void {
  const marketplace = loadMarketplace()
  marketplace.totalFeePercent = event.params.newTotalFeePercent
  marketplace.save()
}

export function handlePaused(event: PausedEvent): void {
  const marketplace = loadMarketplace()
  marketplace.paused = true
  marketplace.save()
}

export function handleSetFeePercent(event: SetFeePercentEvent): void {
  const marketplace = loadMarketplace()
  marketplace.platformFeePercent = event.params.newPlatformFeePercent
  marketplace.partnerFeePercent = event.params.newPartnerFeePercent
  marketplace.save()
}

export function handleUnpaused(event: UnpausedEvent): void {
  const marketplace = loadMarketplace()
  marketplace.paused = false
  marketplace.save()
}
