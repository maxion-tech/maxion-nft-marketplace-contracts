import { BigDecimal, BigInt } from "@graphprotocol/graph-ts"
import {
  FeeUpdated as FeeUpdatedEvent,
  MinimumTradePriceUpdated as MinimumTradePriceUpdatedEvent,
  Paused as PausedEvent,
  Sold as SoldEvent,
  Unpaused as UnpausedEvent
} from "../generated/MaxionNFTMarketplaceV2/MaxionNFTMarketplaceV2"
import {
  Marketplace,
  Transaction,
  TransactionDayData,
  TransactionHourData,
  TransactionMonthData,
} from "../generated/schema"

const NFT_MARKETPLACE_ID = "1"
const DECIMALS = BigDecimal.fromString("1000000000000000000")
const FEE_DENOMINATOR = BigInt.fromString("100000000")

function loadMarketplace(): Marketplace {
  let marketplace = Marketplace.load(NFT_MARKETPLACE_ID)
  if (marketplace == null) {
    marketplace = new Marketplace(NFT_MARKETPLACE_ID)
    marketplace.feePercentage = BigInt.fromString("1000000000").div(FEE_DENOMINATOR)
    marketplace.fixedFee = BigInt.fromI32(1)
    marketplace.minimumTradePrice = BigInt.fromI32(3)
    marketplace.paused = false
    marketplace.save()
  }
  return marketplace
}

export function handleFeeUpdated(event: FeeUpdatedEvent): void {
  const marketplace = loadMarketplace()
  marketplace.feePercentage = event.params.newPercentageFee.div(FEE_DENOMINATOR)
  marketplace.fixedFee = event.params.newFixedFee
  marketplace.save()
}

export function handleMinimumTradePriceUpdated(
  event: MinimumTradePriceUpdatedEvent
): void {
  const marketplace = loadMarketplace()
  marketplace.minimumTradePrice = event.params.newMinimumTradePrice
  marketplace.save()
}

export function handlePaused(event: PausedEvent): void {
  const marketplace = loadMarketplace()
  marketplace.paused = true
  marketplace.save()
}


export function handleSold(event: SoldEvent): void {
  const marketplace = loadMarketplace()
  let transaction = new Transaction(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  transaction.seller = event.params.seller
  transaction.buyer = event.params.buyer
  transaction.nftTo = event.params.nftTo
  transaction.tokenId = event.params.tokenId
  transaction.amount = event.params.amount.toBigDecimal().div(DECIMALS)
  transaction.price = event.params.price.toBigDecimal().div(DECIMALS)
  transaction.priceAfterFee = event.params.netAmount.toBigDecimal().div(DECIMALS)
  transaction.tradingFeePercent = marketplace.feePercentage.toBigDecimal()
  transaction.tradingFeeAmount = event.params.percentageFeeAmount.toBigDecimal().div(DECIMALS)
  transaction.fixedFeeAmount = marketplace.fixedFee.toBigDecimal()
  transaction.totalFee = transaction.price.minus(transaction.priceAfterFee)

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
    transactionHourData.totalTradingFee = BigDecimal.fromString("0")
    transactionHourData.totalFixedFee = BigDecimal.fromString("0")
    transactionHourData.totalFee = BigDecimal.fromString("0")
    transactionHourData.totalTransaction = BigInt.fromI32(0)
  }

  transactionHourData.totalAmount = transactionHourData.totalAmount.plus(event.params.amount)
  transactionHourData.totalPrice = transactionHourData.totalPrice.plus(event.params.price.toBigDecimal().div(DECIMALS))
  transactionHourData.totalPriceAfterFee = transactionHourData.totalPriceAfterFee.plus(event.params.netAmount.toBigDecimal().div(DECIMALS))
  transactionHourData.totalFee = transactionHourData.totalPrice.minus(transactionHourData.totalPriceAfterFee)
  transactionHourData.totalTradingFee = transactionHourData.totalTradingFee.plus(event.params.percentageFeeAmount.toBigDecimal().div(DECIMALS))
  transactionHourData.totalFixedFee = transactionHourData.totalFixedFee.plus(marketplace.fixedFee.toBigDecimal())
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
    transactionDayData.totalTradingFee = BigDecimal.fromString("0")
    transactionDayData.totalFixedFee = BigDecimal.fromString("0")
    transactionDayData.totalFee = BigDecimal.fromString("0")
    transactionDayData.totalTransaction = BigInt.fromI32(0)
  }

  transactionDayData.totalAmount = transactionDayData.totalAmount.plus(event.params.amount)
  transactionDayData.totalPrice = transactionDayData.totalPrice.plus(event.params.price.toBigDecimal().div(DECIMALS))
  transactionDayData.totalPriceAfterFee = transactionDayData.totalPriceAfterFee.plus(event.params.netAmount.toBigDecimal().div(DECIMALS))
  transactionDayData.totalFee = transactionDayData.totalPrice.minus(transactionDayData.totalPriceAfterFee)
  transactionDayData.totalTradingFee = transactionDayData.totalTradingFee.plus(event.params.percentageFeeAmount.toBigDecimal().div(DECIMALS))
  transactionDayData.totalFixedFee = transactionDayData.totalFixedFee.plus(marketplace.fixedFee.toBigDecimal())
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
    transactionMonthData.totalTradingFee = BigDecimal.fromString("0")
    transactionMonthData.totalFixedFee = BigDecimal.fromString("0")
    transactionMonthData.totalFee = BigDecimal.fromString("0")
    transactionMonthData.totalTransaction = BigInt.fromI32(0)
  }

  transactionMonthData.totalAmount = transactionMonthData.totalAmount.plus(event.params.amount)
  transactionMonthData.totalPrice = transactionMonthData.totalPrice.plus(event.params.price.toBigDecimal().div(DECIMALS))
  transactionMonthData.totalPriceAfterFee = transactionMonthData.totalPriceAfterFee.plus(event.params.netAmount.toBigDecimal().div(DECIMALS))
  transactionMonthData.totalFee = transactionMonthData.totalPrice.minus(transactionMonthData.totalPriceAfterFee)
  transactionMonthData.totalTradingFee = transactionMonthData.totalTradingFee.plus(event.params.percentageFeeAmount.toBigDecimal().div(DECIMALS))
  transactionMonthData.totalFixedFee = transactionMonthData.totalFixedFee.plus(marketplace.fixedFee.toBigDecimal())
  transactionMonthData.totalTransaction = transactionMonthData.totalTransaction.plus(BigInt.fromI32(1))

  transactionMonthData.save()
}

export function handleUnpaused(event: UnpausedEvent): void {
  const marketplace = loadMarketplace()
  marketplace.paused = false
  marketplace.save()
}
