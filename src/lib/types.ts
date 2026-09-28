// Shared data types for the linked-list reversal visualiser.

// A single node value; values are strings (input is free-form comma-separated text).
export type NodeValue = string

// The kinds of step the engine emits.
//  - init:   `prev = None` / `curr = head`
//  - check:  the `while curr:` test
//  - save:   `nxt = curr.next`
//  - relink: `curr.next = prev` (the pointer flip)
//  - move:   `prev = curr` / `curr = nxt`
//  - done:   `return prev`
export type StepKind = 'init' | 'check' | 'save' | 'relink' | 'move' | 'done'

// Slot addressing used throughout: nodes occupy slots 0..n-1 in their original
// order. Slot -1 is the `None` on the left (where reversed links end) and slot
// n is the `None` on the right (where the original list ends). A pointer or a
// `next` link that is `None` therefore always has a concrete place to be drawn.
export type Slot = number

export interface Step {
  kind: StepKind
  // Snapshot of every node's `next` AS OF this step, indexed by node.
  next: Slot[]
  // Pointer positions for this step; null means the variable is not yet set.
  prev: Slot | null
  curr: Slot | null
  nxt: Slot | null
  // The node whose `next` was just rewired on this step (relink steps only);
  // drives the Relink_Effect. null on every other step.
  relinked: number | null
  // Index into the Python source lines to highlight.
  lineNumber: number
}

export interface ParseSuccess {
  ok: true
  values: NodeValue[]
}

export interface ParseFailure {
  ok: false
  error: string
}

export type ParseResult = ParseSuccess | ParseFailure
