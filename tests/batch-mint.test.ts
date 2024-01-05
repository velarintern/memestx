import { Cl } from '@stacks/transactions';
import { describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;
const deployer = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'

describe("batchmint", () => {
  it('mints test token to holders', () => {
    const response = simnet.callPublicFn(
      'batch-mint',
      'batchmint',
      [
        Cl.address(`${deployer}.template`),
        Cl.list([
          Cl.tuple({
            user: Cl.address(wallet1),
            amt: Cl.uint(10_000)
          }),
          Cl.tuple({
            user: Cl.address(wallet2),
            amt: Cl.uint(100_000)
          }),
        ])
      ],
      deployer
    )

    expect(response.events.length).toBe(2)
    expect(response.events[0].event).toEqual('ft_mint_event')
    expect(response.events[0].data).toStrictEqual({
      amount: '10000',
      asset_identifier: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.template::memecoin',
      recipient: wallet1,
    })

    const balance1 = simnet.callReadOnlyFn('template', 'get-balance', [Cl.address(wallet1)], wallet1)
    const balance2 = simnet.callReadOnlyFn('template', 'get-balance', [Cl.address(wallet2)], wallet1)

    expect(balance1.result).toBeOk(Cl.uint(10_000))
    expect(balance2.result).toBeOk(Cl.uint(100_000))
  })
})

describe("template", () => {
  it('has no circulating supply', () => {
    const response = simnet.callReadOnlyFn(
      'template',
      'get-total-supply',
      [],
      deployer
    )
    expect(response.result).toBeOk(Cl.uint(0))
  })

  it('has max-supply set', () => {
    const response = simnet.callReadOnlyFn(
      'template',
      'get-max-supply',
      [],
      deployer
    )
    expect(response.result).toBeOk(Cl.uint(10_000_000_000))
  })
})

describe("batchmint-and-set-owner", () => {
  it('mints test token to holders', () => {
    const response = simnet.callPublicFn(
      'batch-mint',
      'batchmint-and-set-owner',
      [
        Cl.address(`${deployer}.template`),
        Cl.address(wallet1), // owner
        Cl.address(wallet1), // recipient
        Cl.list([
          Cl.tuple({
            user: Cl.address(wallet1),
            amt: Cl.uint(10_000)
          }),
        ])
      ],
      deployer
    )

    expect(response.events.length).toBe(2)
    expect(response.events[0].event).toEqual('ft_mint_event')
    expect(response.events[1].event).toEqual('ft_mint_event')
    expect(response.events[1].data).toStrictEqual({
      amount: `${10_000_000_000 - 10_000}`,
      asset_identifier: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.template::memecoin',
      recipient: wallet1,
    })

    const balance1 = simnet.callReadOnlyFn('template', 'get-balance', [Cl.address(wallet1)], wallet1)

    expect(balance1.result).toBeOk(Cl.uint(10_000_000_000))
  })

  it('works with empty holders list', () => {
    const response = simnet.callPublicFn(
      'batch-mint',
      'batchmint-and-set-owner',
      [
        Cl.address(`${deployer}.template`),
        Cl.address(wallet1), // owner
        Cl.address(wallet1), // recipient
        Cl.list([])
      ],
      deployer
    )

    expect(response.events.length).toBe(1)
    expect(response.events[0].event).toEqual('ft_mint_event')
    expect(response.events[0].data).toStrictEqual({
      amount: `${10_000_000_000}`,
      asset_identifier: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.template::memecoin',
      recipient: wallet1,
    })

    const balance1 = simnet.callReadOnlyFn('template', 'get-balance', [Cl.address(wallet1)], wallet1)
    expect(balance1.result).toBeOk(Cl.uint(10_000_000_000))

    const totalSupply = simnet.callReadOnlyFn('template', 'get-total-supply', [], wallet1)
    expect(totalSupply.result).toBeOk(Cl.uint(10_000_000_000))
  })
})
