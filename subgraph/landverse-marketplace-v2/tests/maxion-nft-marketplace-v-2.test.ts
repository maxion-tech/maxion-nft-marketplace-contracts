import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { BigInt, Address, Bytes } from "@graphprotocol/graph-ts"
import { FeeUpdated } from "../generated/schema"
import { FeeUpdated as FeeUpdatedEvent } from "../generated/MaxionNFTMarketplaceV2/MaxionNFTMarketplaceV2"
import { handleFeeUpdated } from "../src/maxion-nft-marketplace-v-2"
import { createFeeUpdatedEvent } from "./maxion-nft-marketplace-v-2-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let newPercentageFee = BigInt.fromI32(234)
    let newFixedFee = BigInt.fromI32(234)
    let newFeeUpdatedEvent = createFeeUpdatedEvent(
      newPercentageFee,
      newFixedFee
    )
    handleFeeUpdated(newFeeUpdatedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("FeeUpdated created and stored", () => {
    assert.entityCount("FeeUpdated", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "FeeUpdated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "newPercentageFee",
      "234"
    )
    assert.fieldEquals(
      "FeeUpdated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "newFixedFee",
      "234"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
