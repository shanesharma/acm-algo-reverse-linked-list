// App — the Visualiser root. Owns all state and confines side effects (the
// auto-play timer and the clipboard write) to hooks/handlers.
//
// Execution is modelled as a single `currentStepIndex` moving across an
// immutable `steps` list generated up front. Everything the UI shows during a
// run is a pure function of `steps[currentStepIndex]`; the controls only mutate
// the index (plus `steps`/`isPlaying`).

import { useEffect, useState } from 'react'
import './App.css'

import { parseTestCase } from './lib/parse'
import { generateSteps, initialLinks } from './lib/steps'
import { next, prev, reset } from './lib/navigation'
import { PYTHON } from './lib/code'
import type { NodeValue, ParseResult, Slot, Step } from './lib/types'

import { TestCaseInput } from './components/TestCaseInput'
import { ListView } from './components/ListView'
import { Controls } from './components/Controls'
import { CodePanel } from './components/CodePanel'

function App() {
  // rawInput drives Test_Case_Input; parseResult is recomputed on every change.
  // The visualiser starts empty; a run begins only when the user clicks
  // Run/Play.
  const [rawInput, setRawInput] = useState('')
  const [parseResult, setParseResult] = useState<ParseResult>(
    parseTestCase(''),
  )
  // steps === null is the pre-run state (Pseudocode_Mode); a step list means a
  // run has begun (Python_Mode).
  const [steps, setSteps] = useState<Step[] | null>(null)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [speedMs, setSpeedMs] = useState(700)
  const [isPlaying, setIsPlaying] = useState(false)
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>(
    'idle',
  )

  // Derived render data ------------------------------------------------------

  // Pre-run shows pseudocode; once a run begins we switch to Python.
  const mode: 'pseudocode' | 'python' = steps === null ? 'pseudocode' : 'python'
  const currentStep = steps ? steps[currentStepIndex] : null

  // The input can't change mid-run (the field is disabled), so the parsed
  // values are always the nodes being reversed.
  const values: NodeValue[] = parseResult.ok ? parseResult.values : []

  const running = currentStep !== null
  const done = currentStep !== null && currentStep.kind === 'done'
  // Before a run, preview the untouched list so the user sees their input.
  const links = currentStep ? currentStep.next : initialLinks(values.length)
  const prevSlot = currentStep ? currentStep.prev : null
  const currSlot = currentStep ? currentStep.curr : null
  const nxtSlot = currentStep ? currentStep.nxt : null
  const relinked = currentStep ? currentStep.relinked : null
  // `head` marks the original first node until the run finishes, then the new
  // head that `return prev` hands back.
  const head: Slot | null =
    values.length === 0 ? null : done ? currentStep.prev : 0

  // Inline pointer values for the Code_Panel.
  const describe = (slot: Slot | null): string => {
    if (slot === null) return '—'
    if (slot < 0 || slot >= values.length) return 'None'
    return `"${values[slot]}"`
  }

  // Control-enable flags.
  const canStepBack = steps !== null && currentStepIndex > 0
  const canStepForward = steps !== null && currentStepIndex < steps.length - 1

  const inputError = parseResult.ok ? null : parseResult.error

  // Handlers -----------------------------------------------------------------

  // Re-parse on every change. Editing the input abandons any active run so
  // the preview reflects the new values.
  const handleInputChange = (raw: string) => {
    setRawInput(raw)
    setParseResult(parseTestCase(raw))
    setSteps(null)
    setCurrentStepIndex(0)
    setIsPlaying(false)
  }

  // Run/Play: generate the step list on first run, then start auto-play.
  // The auto-advance effect below drives the ticking.
  const handleRun = () => {
    if (!parseResult.ok) return
    if (steps === null) {
      setSteps(generateSteps(parseResult.values.length))
      setCurrentStepIndex(0)
    }
    setIsPlaying(true)
  }

  // Next / Previous only move the index, clamped to the valid range.
  // Manual stepping pauses auto-play so the user stays in control.
  const handleNext = () => {
    if (steps === null) return
    setIsPlaying(false)
    setCurrentStepIndex((i) => next(i, steps.length))
  }

  const handlePrev = () => {
    if (steps === null) return
    setIsPlaying(false)
    setCurrentStepIndex((i) => prev(i))
  }

  // Speed change: the auto-advance effect depends on speedMs, so updating it
  // re-arms the timer at the new interval immediately.
  const handleSpeedChange = (ms: number) => {
    setSpeedMs(ms)
  }

  // Reset: return to the pre-run state — original list preview and
  // Pseudocode_Mode.
  const handleReset = () => {
    const r = reset()
    setSteps(r.steps)
    setCurrentStepIndex(r.currentStepIndex)
    setIsPlaying(r.isPlaying)
  }

  // Copy-to-clipboard. On success show a confirmation that auto-dismisses
  // after ~2s; on rejection or a missing API show a persistent inline error.
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(PYTHON)
      setCopyStatus('copied')
      window.setTimeout(() => setCopyStatus('idle'), 2000)
    } catch {
      setCopyStatus('error')
    }
  }

  // Auto-play effect ---------------------------------------------------------
  // Each tick schedules the next one; the effect re-runs on currentStepIndex and
  // speedMs so speed changes take effect immediately and playback stops cleanly
  // at the final step.
  useEffect(() => {
    if (!isPlaying || !steps) return
    if (currentStepIndex >= steps.length - 1) {
      setIsPlaying(false) // stop at the final step
      return
    }
    const id = window.setTimeout(
      () => setCurrentStepIndex((i) => i + 1),
      speedMs,
    )
    return () => window.clearTimeout(id)
  }, [isPlaying, steps, currentStepIndex, speedMs])

  // Render -------------------------------------------------------------------

  return (
    <div className="visualiser">
      <TestCaseInput
        value={rawInput}
        error={inputError}
        disabled={running}
        onChange={handleInputChange}
        onRun={handleRun}
      />

      <ListView
        values={values}
        next={links}
        prev={prevSlot}
        curr={currSlot}
        nxt={nxtSlot}
        head={head}
        running={running}
        relinked={relinked}
      />

      <Controls
        isPlaying={isPlaying}
        canStepBack={canStepBack}
        canStepForward={canStepForward}
        speedMs={speedMs}
        onRun={handleRun}
        onNext={handleNext}
        onPrev={handlePrev}
        onSpeedChange={handleSpeedChange}
        onReset={handleReset}
      />

      <CodePanel
        mode={mode}
        currentLine={currentStep ? currentStep.lineNumber : 0}
        prevLabel={describe(prevSlot)}
        currLabel={describe(currSlot)}
        nxtLabel={describe(nxtSlot)}
        newHeadLabel={done ? describe(currentStep.prev) : null}
        onCopy={handleCopy}
        copyStatus={copyStatus}
      />
    </div>
  )
}

export default App
