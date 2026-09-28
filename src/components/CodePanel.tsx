// Code_Panel — presentational component.
// Before a run it shows Pseudocode_Mode; during a run it shows Python_Mode,
// highlighting the Current_Line and rendering the live pointer values inline.
// It grows naturally as the execution caption appears and exposes the
// Copy_Control plus copy confirmation/error messaging.
//
// This component is presentational: the actual clipboard write happens in App via
// the onCopy callback. Here we only trigger it and render copyStatus.

import { PSEUDOCODE, PYTHON } from '../lib/code'

export interface CodePanelProps {
  mode: 'pseudocode' | 'python'
  currentLine: number // used only in python mode
  // Display text for each pointer: '"a"' for a node, 'None', or '—' if unset.
  prevLabel: string
  currLabel: string
  nxtLabel: string
  // Set on the final step: the value of the new head.
  newHeadLabel: string | null
  onCopy: () => void
  copyStatus: 'idle' | 'copied' | 'error'
}

export function CodePanel({
  mode,
  currentLine,
  prevLabel,
  currLabel,
  nxtLabel,
  newHeadLabel,
  onCopy,
  copyStatus,
}: CodePanelProps) {
  const isPython = mode === 'python'
  const source = isPython ? PYTHON : PSEUDOCODE
  const lines = source.split('\n')

  // Inline pointer-value caption. Once curr has run off the end we report the
  // new head instead.
  const caption =
    newHeadLabel !== null
      ? `curr is None — list reversed, new head = ${newHeadLabel}`
      : `prev = ${prevLabel}   curr = ${currLabel}   nxt = ${nxtLabel}`

  return (
    <section className="code-panel" aria-label="Algorithm code">
      <header className="code-panel__header">
        <span className="code-panel__mode">
          {isPython ? 'Python' : 'Pseudocode'}
        </span>
        <button
          type="button"
          className="code-panel__copy"
          onClick={onCopy}
        >
          Copy
        </button>
      </header>

      <pre className="code-panel__code">
        {lines.map((line, index) => {
          const isCurrent = isPython && index === currentLine
          return (
            <div
              key={index}
              className={
                isCurrent
                  ? 'code-panel__line code-panel__line--current'
                  : 'code-panel__line'
              }
              aria-current={isCurrent ? 'true' : undefined}
            >
              {line === '' ? ' ' : line}
            </div>
          )
        })}
      </pre>

      {isPython && (
        <div className="code-panel__caption">{caption}</div>
      )}

      {copyStatus === 'copied' && (
        <div className="code-panel__status code-panel__status--copied" role="status">
          Copied to clipboard
        </div>
      )}
      {copyStatus === 'error' && (
        <div className="code-panel__status code-panel__status--error" role="alert">
          Copy failed — please try again
        </div>
      )}
    </section>
  )
}

export default CodePanel
