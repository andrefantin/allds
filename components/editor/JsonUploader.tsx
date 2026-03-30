'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { cn } from '@/lib/utils'
import { validateTokenFile, convertFigmaExport, diffTokenFiles } from '@/lib/tokens'
import type { FigmaVariablesExport } from '@/lib/tokens'
import type { TokenFile } from '@/types'
import toast from 'react-hot-toast'

interface JsonUploaderProps {
  tenant: string
  currentTokens: TokenFile
  onClose: () => void
  onPublished: () => void
}

type Step = 'upload' | 'validate' | 'diff' | 'publishing' | 'done'

export function JsonUploader({ tenant, currentTokens, onClose, onPublished }: JsonUploaderProps) {
  const [step, setStep] = useState<Step>('upload')
  const [newTokens, setNewTokens] = useState<TokenFile | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [rawJson, setRawJson] = useState('')
  const [diff, setDiff] = useState<{
    added: string[]
    removed: string[]
    changed: Array<{ name: string; oldValue: string; newValue: string }>
  } | null>(null)

  const processFile = useCallback((json: string) => {
    setRawJson(json)
    let parsed: unknown
    try {
      parsed = JSON.parse(json)
    } catch (e) {
      setErrors(['Invalid JSON: ' + (e as Error).message])
      setStep('validate')
      return
    }

    const { valid, errors: validationErrors, isFigmaFormat } = validateTokenFile(parsed)
    setErrors(validationErrors)
    setStep('validate')

    if (valid) {
      const data = isFigmaFormat
        ? convertFigmaExport(parsed as FigmaVariablesExport)
        : parsed as TokenFile
      setNewTokens(data)
      const diffResult = diffTokenFiles(currentTokens, data)
      setDiff(diffResult)
      setStep('diff')
    }
  }, [currentTokens])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      processFile(e.target?.result as string)
    }
    reader.readAsText(file)
  }, [processFile])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/json': ['.json'] },
    maxFiles: 1,
  })

  async function handlePublish() {
    if (!newTokens) return
    setStep('publishing')

    try {
      const res = await fetch(`/${tenant}/api/tokens/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTokens),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Failed to publish tokens')
        setStep('diff')
        return
      }

      setStep('done')
      toast.success('Tokens published successfully!')
      setTimeout(() => {
        onPublished()
        onClose()
      }, 1500)
    } catch {
      toast.error('Network error — please try again')
      setStep('diff')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-fics-text/40 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="relative z-10 w-full max-w-[60rem] h-full bg-white shadow-modal flex flex-col animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-fics-border">
          <div>
            <h2 className="text-heading-sm font-semibold text-fics-text">Update Design Tokens</h2>
            <p className="text-body-sm text-fics-text-muted mt-0.5">Upload a JSON file exported from Figma Variables to replace the current tokens</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-fics-bg transition-colors text-fics-text-muted">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress steps */}
        <div className="flex items-center gap-0 px-6 py-3 bg-fics-bg border-b border-fics-border">
          {['Upload', 'Validate', 'Review', 'Publish'].map((label, i) => {
            const stepKeys: Step[] = ['upload', 'validate', 'diff', 'publishing']
            const currentIndex = stepKeys.indexOf(step === 'done' ? 'publishing' : step)
            const isDone = i < currentIndex
            const isActive = i === currentIndex
            return (
              <div key={label} className="flex items-center">
                <div className={cn(
                  'flex items-center gap-2 px-3 py-1 rounded-full text-[1.2rem] font-medium transition-colors',
                  isActive && 'bg-fics-heading text-white',
                  isDone && 'text-fics-heading',
                  !isActive && !isDone && 'text-fics-text-muted'
                )}>
                  <span className={cn(
                    'w-5 h-5 rounded-full flex items-center justify-center text-[1.1rem]',
                    isActive && 'bg-white/20',
                    isDone && 'bg-fics-heading/10',
                    !isActive && !isDone && 'bg-fics-bg-dark'
                  )}>
                    {isDone ? '✓' : i + 1}
                  </span>
                  {label}
                </div>
                {i < 3 && <div className="w-6 h-px bg-fics-border mx-1" />}
              </div>
            )
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 'upload' && (
            <div
              {...getRootProps()}
              className={cn(
                'border-2 border-dashed rounded-md p-12 text-center cursor-pointer transition-all',
                isDragActive
                  ? 'border-fics-heading bg-fics-heading/5'
                  : 'border-fics-border hover:border-fics-heading/50 hover:bg-fics-bg'
              )}
            >
              <input {...getInputProps()} />
              <div className="text-5xl mb-4">📄</div>
              <p className="text-body-lg font-medium text-fics-text mb-1">
                {isDragActive ? 'Drop your JSON file here' : 'Drag & drop your Figma Variables export'}
              </p>
              <p className="text-body-sm text-fics-text-muted mb-4">
                or click to select a file
              </p>
              <p className="text-[1.2rem] text-fics-text-muted mb-4">
                Upload a JSON file exported from Figma Variables. To export: open your Figma file → Resources panel → Variables → Export.
              </p>
              <span className="text-[1.2rem] text-fics-text-muted bg-fics-bg px-3 py-1 rounded-full border border-fics-border">
                .json files only
              </span>
            </div>
          )}

          {step === 'validate' && (
            <div>
              <div className={cn(
                'p-4 rounded-md border mb-4',
                errors.length === 0
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              )}>
                {errors.length === 0 ? (
                  <p className="font-medium">✓ JSON is valid</p>
                ) : (
                  <div>
                    <p className="font-medium mb-2">Found {errors.length} validation error{errors.length !== 1 ? 's' : ''}</p>
                    <ul className="space-y-1 text-[1.3rem]">
                      {errors.map((err, i) => (
                        <li key={i}>• {err}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <pre className="bg-fics-text rounded-md p-4 text-fics-bg text-[1.2rem] overflow-auto max-h-80 font-mono">
                {rawJson.slice(0, 2000)}{rawJson.length > 2000 ? '\n… (truncated)' : ''}
              </pre>

              {errors.length > 0 && (
                <button
                  onClick={() => setStep('upload')}
                  className="mt-4 px-4 py-2 rounded-lg border border-fics-border text-fics-text hover:bg-fics-bg transition-colors text-[1.3rem]"
                >
                  Try a different file
                </button>
              )}
            </div>
          )}

          {step === 'diff' && diff && newTokens && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="card p-4 text-center">
                  <div className="text-heading-md font-bold text-green-600">{diff.added.length}</div>
                  <div className="text-body-sm text-fics-text-muted">Added</div>
                </div>
                <div className="card p-4 text-center">
                  <div className="text-heading-md font-bold text-red-600">{diff.removed.length}</div>
                  <div className="text-body-sm text-fics-text-muted">Removed</div>
                </div>
                <div className="card p-4 text-center">
                  <div className="text-heading-md font-bold text-amber-600">{diff.changed.length}</div>
                  <div className="text-body-sm text-fics-text-muted">Changed</div>
                </div>
              </div>

              {/* Details */}
              {diff.added.length > 0 && (
                <div>
                  <h3 className="text-[1.3rem] font-semibold text-green-700 mb-2">Added tokens</h3>
                  <div className="space-y-1">
                    {diff.added.map((name) => (
                      <div key={name} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-50 border border-green-200">
                        <span className="text-green-600 font-mono text-[1.1rem]">+</span>
                        <span className="font-mono text-[1.3rem] text-green-800">{name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {diff.removed.length > 0 && (
                <div>
                  <h3 className="text-[1.3rem] font-semibold text-red-700 mb-2">Removed tokens</h3>
                  <div className="space-y-1">
                    {diff.removed.map((name) => (
                      <div key={name} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200">
                        <span className="text-red-600 font-mono text-[1.1rem]">−</span>
                        <span className="font-mono text-[1.3rem] text-red-800">{name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {diff.changed.length > 0 && (
                <div>
                  <h3 className="text-[1.3rem] font-semibold text-amber-700 mb-2">Changed tokens</h3>
                  <div className="space-y-2">
                    {diff.changed.map((change) => (
                      <div key={change.name} className="px-3 py-2 rounded-lg bg-amber-50 border border-amber-200">
                        <div className="font-mono text-[1.3rem] text-amber-800 mb-1">{change.name}</div>
                        <div className="flex items-center gap-2 text-[1.2rem]">
                          <span className="text-red-600 font-mono line-through">{change.oldValue}</span>
                          <span className="text-fics-text-muted">→</span>
                          <span className="text-green-600 font-mono">{change.newValue}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {diff.added.length === 0 && diff.removed.length === 0 && diff.changed.length === 0 && (
                <div className="card p-8 text-center text-fics-text-muted">
                  No differences found — the uploaded file is identical to the current tokens.
                </div>
              )}
            </div>
          )}

          {(step === 'publishing' || step === 'done') && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              {step === 'publishing' ? (
                <>
                  <div className="w-12 h-12 rounded-full border-4 border-fics-heading border-t-transparent animate-spin" />
                  <p className="text-body-lg font-medium text-fics-text">Publishing tokens…</p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-3xl">✓</div>
                  <p className="text-body-lg font-medium text-fics-text">Tokens published!</p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {(step === 'diff' || step === 'validate') && (
          <div className="px-6 py-4 border-t border-fics-border flex items-center justify-between bg-fics-bg">
            <button
              onClick={() => setStep('upload')}
              className="px-4 py-2 rounded-lg border border-fics-border text-fics-text hover:bg-fics-bg-dark transition-colors text-[1.3rem]"
            >
              Start over
            </button>
            {step === 'diff' && (
              <button
                onClick={handlePublish}
                className="px-6 py-2.5 rounded-lg bg-fics-heading text-white font-semibold hover:bg-fics-heading/90 transition-colors text-[1.3rem]"
              >
                Publish tokens
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
