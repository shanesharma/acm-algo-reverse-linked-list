// List_View presentational component for the linked-list reversal visualiser.
//
// Nodes stay in their ORIGINAL left-to-right order the whole time; what changes
// is the direction of the arrows between them. That keeps the reversal readable:
// you watch each arrow flip from → to ← as curr walks the list.
//
// The track is: [None] link [node 0] link [node 1] ... [node n-1] link [None].
// The left None is where reversed links end (prev starts there); the right None
// is where the original list ends (curr finishes there).

import type { CSSProperties } from 'react'
import type { NodeValue, Slot } from '../lib/types'

export interface ListViewProps {
  values: NodeValue[]
  next: Slot[]
  prev: Slot | null
  curr: Slot | null
  nxt: Slot | null
  head: Slot | null
  running: boolean
  // Node whose `next` was just flipped; gets the Relink_Effect.
  relinked: number | null
}

// Slot footprint must match the CSS: .node width 56px + .link width 44px.
// Pointer tags slide between slots by this many pixels per slot.
const SLOT_ADVANCE = 100

type Direction = 'forward' | 'backward' | 'none'

// Direction of the link between slot k and slot k + 1, if any.
function linkBetween(next: Slot[], k: number): Direction {
  if (k >= 0 && next[k] === k + 1) return 'forward'
  if (k + 1 < next.length && next[k + 1] === k) return 'backward'
  return 'none'
}

function Arrow() {
  return (
    <svg viewBox="0 0 44 16" width="44" height="16" aria-hidden="true">
      <line x1="4" y1="8" x2="34" y2="8" stroke="currentColor" strokeWidth="2" />
      <path d="M32 3 L40 8 L32 13 Z" fill="currentColor" />
    </svg>
  )
}

export function ListView({
  values,
  next,
  prev,
  curr,
  nxt,
  head,
  running,
  relinked,
}: ListViewProps) {
  const n = values.length
  // Slots -1..n inclusive.
  const slots = Array.from({ length: n + 2 }, (_, i) => i - 1)

  // Pointer tags ride in fixed lanes below the track so two pointers on the
  // same slot (e.g. right after `prev = curr`) never overlap.
  const lanes: { name: string; slot: Slot | null }[] = [
    { name: 'prev', slot: prev },
    { name: 'curr', slot: curr },
    { name: 'nxt', slot: nxt },
  ]

  const tagStyle = (slot: Slot): CSSProperties =>
    ({ '--slot-x': `${(slot + 1) * SLOT_ADVANCE}px` }) as CSSProperties

  return (
    <div className="list-view">
      <div className="list-view__track">
        <div className="list-view__head-lane">
          {head !== null && (
            <span className="pointer-tag pointer-tag--head" style={tagStyle(head)}>
              head
            </span>
          )}
        </div>

        <div className="list-view__row">
          {slots.map((slot) => {
            const isNone = slot === -1 || slot === n
            const isCurr = running && slot === curr
            const isPrev = running && slot === prev
            const className = [
              'node',
              isNone ? 'node--none' : '',
              isCurr ? 'node--curr' : '',
              isPrev && !isCurr ? 'node--prev' : '',
              slot === relinked ? 'node--relink' : '',
            ]
              .filter(Boolean)
              .join(' ')

            // The link to the right of this slot (none after the last slot).
            const direction = slot < n ? linkBetween(next, slot) : null
            // The forward link just cut by a relink fades out in place.
            const isCut = direction === 'none' && slot === relinked
            // The backward link just created by a relink pops in.
            const isNew = direction === 'backward' && slot + 1 === relinked
            const linkClass = [
              'link',
              direction ? `link--${direction}` : '',
              isCut ? 'link--cut' : '',
              isNew ? 'link--new' : '',
            ]
              .filter(Boolean)
              .join(' ')

            return (
              <div key={slot} className="list-view__slot">
                <div className={className}>{isNone ? 'None' : values[slot]}</div>
                {direction !== null && (
                  <div className={linkClass}>
                    {(direction !== 'none' || isCut) && <Arrow />}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="list-view__lanes">
          {lanes.map(({ name, slot }) => (
            <div key={name} className="list-view__lane">
              {running && slot !== null && (
                <span
                  className={`pointer-tag pointer-tag--${name}`}
                  style={tagStyle(slot)}
                >
                  {name}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
