// Step-generation layer for the linked-list reversal visualiser.

import type { Slot, Step } from './types'
import { LINE } from './code'

// The `next` links of an untouched list of `length` nodes: every node points
// at the one to its right, and the last node points at the right-hand None
// (slot `length`).
export function initialLinks(length: number): Slot[] {
  return Array.from({ length }, (_, i) => i + 1)
}

// Generate the full, immutable step list for a list of `length` nodes.
// Emits two `init` steps, then per iteration `check`/`save`/`relink`/`move`/
// `move` while curr is a node, a final failing `check`, and terminates with
// `done` once curr has run off the end.
export function generateSteps(length: number): Step[] {
  const steps: Step[] = []
  let next = initialLinks(length)
  const NONE_LEFT = -1
  const NONE_RIGHT = length

  // `prev = None`: prev sits on the left-hand None. curr and nxt don't exist
  // yet, so only prev's tag is shown.
  let prev: Slot = NONE_LEFT
  steps.push({
    kind: 'init',
    next: [...next],
    prev,
    curr: null,
    nxt: null,
    relinked: null,
    lineNumber: LINE.initPrev,
  })

  // `curr = head`: curr takes its place on the first node.
  let curr: Slot = 0
  steps.push({
    kind: 'init',
    next: [...next],
    prev,
    curr,
    nxt: null,
    relinked: null,
    lineNumber: LINE.initCurr,
  })

  let nxt: Slot | null = null

  while (curr !== NONE_RIGHT) {
    // check: `while curr:` passes; nothing moves.
    steps.push({
      kind: 'check',
      next: [...next],
      prev,
      curr,
      nxt,
      relinked: null,
      lineNumber: LINE.while,
    })

    // save: remember the rest of the list before we cut it off.
    nxt = next[curr]
    steps.push({
      kind: 'save',
      next: [...next],
      prev,
      curr,
      nxt,
      relinked: null,
      lineNumber: LINE.saveNext,
    })

    // relink: flip curr's arrow to point back at prev. The forward link is
    // gone after this step, which is why nxt had to be saved first.
    next = relinkAt(next, curr, prev)
    steps.push({
      kind: 'relink',
      next: [...next],
      prev,
      curr,
      nxt,
      relinked: curr,
      lineNumber: LINE.relink,
    })

    // move-prev: `prev = curr`. One pointer move per line keeps the highlight
    // and the motion in sync.
    prev = curr
    steps.push({
      kind: 'move',
      next: [...next],
      prev,
      curr,
      nxt,
      relinked: null,
      lineNumber: LINE.movePrev,
    })

    // move-curr: `curr = nxt`.
    curr = nxt
    steps.push({
      kind: 'move',
      next: [...next],
      prev,
      curr,
      nxt,
      relinked: null,
      lineNumber: LINE.moveCurr,
    })
  }

  // Final `while curr:` test fails: curr is the right-hand None.
  steps.push({
    kind: 'check',
    next: [...next],
    prev,
    curr,
    nxt,
    relinked: null,
    lineNumber: LINE.while,
  })

  // done: every link is reversed and prev holds the new head.
  steps.push({
    kind: 'done',
    next: [...next],
    prev,
    curr,
    nxt,
    relinked: null,
    lineNumber: LINE.return,
  })

  return steps
}

// Pure, non-mutating relink: returns new links with node `i` pointing at
// `target` and every other link unchanged.
export function relinkAt(next: Slot[], i: number, target: Slot): Slot[] {
  const copy = [...next]
  copy[i] = target
  return copy
}
