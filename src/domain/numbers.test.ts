import { describe, expect, it } from 'vitest'
import { decimalSeparatorFor, parseAmount, parseDecimal, parsePercent, parseRate, roundCents, toInputString } from './numbers'

describe('parseDecimal', () => {
  it.each([
    ['1.234,56', ',', 1234.56],
    ['1,234.56', ',', 1234.56],
    ['1.234.567', ',', 1234567],
    ['1,234,567', '.', 1234567],
    ['12,5', '.', 12.5],
    ['12.5', ',', 12.5],
    ['€ 300 000', ',', 300000],
    ['300\u00a0000,00 €', ',', 300000],
    ['$1,250.75', '.', 1250.75],
    ["1'234.50", '.', 1234.5],
    ['-80000', ',', -80000],
    ['0,500', '.', 0.5],
    ['.5', ',', 0.5],
    ['1.10', ',', 1.1],
  ] as const)('parses %s (hint %s)', (input, hint, expected) => {
    expect(parseDecimal(input, hint)).toBe(expected)
  })

  it('uses the locale hint only for ambiguous thousands-like input', () => {
    expect(parseDecimal('1.234', ',')).toBe(1234)
    expect(parseDecimal('1.234', '.')).toBe(1.234)
    expect(parseDecimal('1,234', ',')).toBe(1.234)
    expect(parseDecimal('1,234', '.')).toBe(1234)
  })

  it.each(['', '   ', 'abc', '12abc', '1,2,3', '1.23.4', '1.234,5,6', '--5', '1,234.567,8', '€'])(
    'rejects %j instead of returning zero',
    (input) => {
      expect(parseDecimal(input, ',')).toBeNull()
    },
  )
})

describe('validated inputs', () => {
  it('amounts: required, invalid, negative are errors; zero optional', () => {
    expect(parseAmount('', ',')).toEqual({ error: 'required' })
    expect(parseAmount('dieci', ',')).toEqual({ error: 'invalid' })
    expect(parseAmount('-5', ',')).toEqual({ error: 'negative' })
    expect(parseAmount('0', ',', { allowZero: false })).toEqual({ error: 'zero' })
    expect(parseAmount('1.234,567', ',')).toEqual({ value: 1234.57 })
  })

  it('percent must be in (0, 100]', () => {
    expect(parsePercent('50', ',')).toEqual({ value: 50 })
    expect(parsePercent('33,33%', ',')).toEqual({ value: 33.33 })
    expect(parsePercent('0', ',')).toEqual({ error: 'range' })
    expect(parsePercent('120', ',')).toEqual({ error: 'range' })
    expect(parsePercent('x', ',')).toEqual({ error: 'invalid' })
  })

  it('exchange rate must be positive and finite', () => {
    expect(parseRate('1,10', ',')).toEqual({ value: 1.1 })
    expect(parseRate('0', ',')).toEqual({ error: 'range' })
    expect(parseRate('-1', ',')).toEqual({ error: 'range' })
    expect(parseRate('', ',')).toEqual({ error: 'required' })
  })
})

describe('roundCents', () => {
  it('rounds half away from zero without float artefacts', () => {
    expect(roundCents(1.005)).toBe(1.01)
    expect(roundCents(-1.005)).toBe(-1.01)
    expect(roundCents(110 / 1.1)).toBe(100)
    expect(roundCents(0.1 + 0.2)).toBe(0.3)
  })
})

describe('decimalSeparatorFor', () => {
  it('matches the locales the app ships', () => {
    expect(decimalSeparatorFor('it-IT')).toBe(',')
    expect(decimalSeparatorFor('es-ES')).toBe(',')
    expect(decimalSeparatorFor('en-US')).toBe('.')
  })
})

describe('toInputString', () => {
  it('can keep the precision of percentages and exchange rates', () => {
    expect(toInputString(33.3333, 'it-IT', 4)).toBe('33,3333')
    expect(toInputString(1.083456, 'en-US', 6)).toBe('1.083456')
    expect(toInputString(1234.5, 'it-IT')).toBe('1234,5')
  })
})

