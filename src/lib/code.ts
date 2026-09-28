// Canonical code sources for the Code_Panel and the step -> line mapping.

export const PSEUDOCODE = `set prev to nothing
set curr to the head node
while curr is a node:
    remember the node after curr
    point curr back at prev
    move prev up to curr
    move curr up to the remembered node
return prev as the new head`

export const PYTHON = `def reverse_list(head):
    prev = None
    curr = head
    while curr:
        nxt = curr.next
        curr.next = prev
        prev = curr
        curr = nxt
    return prev`

// Zero-based indices into PYTHON.split('\n').
export const LINE = {
  def: 0,
  initPrev: 1, // prev = None
  initCurr: 2, // curr = head
  while: 3,
  saveNext: 4, // nxt = curr.next
  relink: 5, // curr.next = prev
  movePrev: 6, // prev = curr
  moveCurr: 7, // curr = nxt
  return: 8,
} as const
