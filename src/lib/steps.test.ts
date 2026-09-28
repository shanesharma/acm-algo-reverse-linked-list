import fc from 'fast-check'
import { generateSteps, initialLinks } from './steps'
import { LINE } from './code'

describe('generateSteps', () => {
  it('reverses every link: node i ends up pointing at i - 1', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 30 }), (n) => {
        const steps = generateSteps(n)
        const last = steps[steps.length - 1]
        expect(last.kind).toBe('done')
        expect(last.next).toEqual(Array.from({ length: n }, (_, i) => i - 1))
        // prev is the new head (the old tail); curr has run off the end.
        expect(last.prev).toBe(n - 1)
        expect(last.curr).toBe(n)
      }),
    )
  })

  it('never mutates the initial snapshot', () => {
    const steps = generateSteps(4)
    expect(steps[0].next).toEqual(initialLinks(4))
  })

  it('flips exactly one link per relink step, pointing curr at prev', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 30 }), (n) => {
        const steps = generateSteps(n)
        steps.forEach((step, i) => {
          if (step.kind !== 'relink') return
          const before = steps[i - 1].next
          const changed = step.next.flatMap((t, j) => (t !== before[j] ? [j] : []))
          expect(changed).toEqual([step.curr])
          expect(step.next[step.curr!]).toBe(step.prev)
          expect(step.lineNumber).toBe(LINE.relink)
        })
      }),
    )
  })

  it('emits 5 steps per node plus init, final check and done', () => {
    expect(generateSteps(1)).toHaveLength(2 + 5 + 2)
    expect(generateSteps(5)).toHaveLength(2 + 25 + 2)
  })
})
