import { calcTrend, EngineSnapshot, TrendDirection } from '../lib/engine-history'

describe('calcTrend', () => {
  it('returns "new" with empty history', () => {
    expect(calcTrend('Leadership', [])).toBe('new')
  })

  it('returns "new" with only one snapshot', () => {
    const history: EngineSnapshot[] = [
      { timestamp: '2026-01-01', scores: { Leadership: 50 } }
    ]
    expect(calcTrend('Leadership', history)).toBe('new')
  })

  it('returns "up" when score increased by 5+', () => {
    const history: EngineSnapshot[] = [
      { timestamp: '2026-01-01', scores: { Leadership: 50 } },
      { timestamp: '2026-01-02', scores: { Leadership: 56 } }
    ]
    expect(calcTrend('Leadership', history)).toBe('up')
  })

  it('returns "down" when score decreased by 5+', () => {
    const history: EngineSnapshot[] = [
      { timestamp: '2026-01-01', scores: { Leadership: 60 } },
      { timestamp: '2026-01-02', scores: { Leadership: 54 } }
    ]
    expect(calcTrend('Leadership', history)).toBe('down')
  })

  it('returns "stable" for small changes', () => {
    const history: EngineSnapshot[] = [
      { timestamp: '2026-01-01', scores: { Leadership: 50 } },
      { timestamp: '2026-01-02', scores: { Leadership: 52 } }
    ]
    expect(calcTrend('Leadership', history)).toBe('stable')
  })

  it('returns "new" for unknown engine', () => {
    const history: EngineSnapshot[] = [
      { timestamp: '2026-01-01', scores: { Leadership: 50 } },
      { timestamp: '2026-01-02', scores: { Leadership: 60 } }
    ]
    expect(calcTrend('Unknown', history)).toBe('new')
  })

  it('compares to 4 entries ago when history is long', () => {
    const history: EngineSnapshot[] = [
      { timestamp: '2026-01-01', scores: { Leadership: 40 } },
      { timestamp: '2026-01-02', scores: { Leadership: 45 } },
      { timestamp: '2026-01-03', scores: { Leadership: 50 } },
      { timestamp: '2026-01-04', scores: { Leadership: 55 } },
      { timestamp: '2026-01-05', scores: { Leadership: 60 } },
      { timestamp: '2026-01-06', scores: { Leadership: 65 } }
    ]
    // With 6 entries, compareIdx = max(0, 6-5) = 1, so compares index 1 (45) to index 5 (65) = +20 = up
    expect(calcTrend('Leadership', history)).toBe('up')
  })
})
