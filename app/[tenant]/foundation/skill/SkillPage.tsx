'use client'

import { useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { Download, Upload, X } from 'react-feather'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { unzipSync, strFromU8 } from 'fflate'
import { formatDate } from '@/lib/utils'

function stripFrontmatter(content: string): string {
  // Remove YAML frontmatter block (--- ... ---) at the top of the file
  return content.replace(/^---[\s\S]*?---\s*/m, '').trimStart()
}

interface Props {
  tenant: string
  initialSkill: string | null
  initialUploadedAt: string | null
}

export function SkillPage({ tenant, initialSkill, initialUploadedAt }: Props) {
  const { data: session } = useSession()
  const role = (session?.user as { role?: string })?.role
  const isEditor = role === 'editor' || role === 'platform_editor'

  const [skill, setSkill] = useState(initialSkill)
  const [uploadedAt, setUploadedAt] = useState(initialUploadedAt)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    if (!file.name.endsWith('.skill') && !file.name.endsWith('.md')) {
      setError('Please upload a .skill file')
      return
    }
    setUploading(true)
    setError('')
    try {
      const buffer = await file.arrayBuffer()
      const bytes = new Uint8Array(buffer)

      // .skill files are ZIP archives — extract the SKILL.md inside
      let content: string
      if (bytes[0] === 0x50 && bytes[1] === 0x4B) {
        const files = unzipSync(bytes)
        const mdEntry = Object.entries(files).find(([name]) => name.endsWith('.md'))
        if (!mdEntry) {
          setError('Could not find a skill file inside the archive.')
          setUploading(false)
          return
        }
        content = strFromU8(mdEntry[1])
      } else {
        content = new TextDecoder().decode(bytes)
      }

      const res = await fetch(`/${tenant}/api/skill`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: content,
      })
      if (!res.ok) throw new Error('Upload failed')
      setSkill(content)
      setUploadedAt(new Date().toISOString())
    } catch {
      setError('Failed to upload skill. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  function downloadSkill() {
    if (!skill) return
    const blob = new Blob([skill], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'design-skill.skill'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-4 md:p-8 max-w-[80rem] mx-auto">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p className="text-[1.2rem] font-semibold uppercase tracking-widest text-fics-heading mb-1">Foundation</p>
          <h1 className="text-heading-lg font-bold text-fics-text mb-2">Design Skill</h1>
          <div className="flex items-center gap-3 text-body-sm text-fics-text-muted">
            <p className="text-body text-fics-text-muted">
              A Claude Skill tailored to this design system — helping AI tools understand your tokens, components, and patterns.
            </p>
          </div>
          {uploadedAt && (
            <p className="text-[1.2rem] text-fics-text-muted mt-2">
              Uploaded {formatDate(uploadedAt)}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {skill && (
            <button
              onClick={downloadSkill}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-fics-border bg-white text-fics-text font-semibold hover:bg-fics-bg-dark transition-colors text-[1.3rem]"
            >
              <Download size={15} />
              Download Skill
            </button>
          )}
          {isEditor && (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-fics-heading text-white font-semibold hover:bg-fics-heading/90 transition-colors text-[1.3rem] disabled:opacity-50"
            >
              <Upload size={15} />
              {uploading ? 'Uploading…' : skill ? 'Replace Skill' : 'Upload Skill'}
            </button>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".skill,.md"
        className="hidden"
        onChange={handleInputChange}
      />

      {error && (
        <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-[1.3rem]">
          <span className="flex-1">{error}</span>
          <button onClick={() => setError('')}><X size={14} /></button>
        </div>
      )}

      {!skill ? (
        isEditor ? (
          <div
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className="card border-2 border-dashed border-fics-border p-16 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-fics-heading/30 hover:bg-fics-bg/50 transition-colors"
          >
            <Upload size={32} className="text-fics-text-muted" />
            <div className="text-center">
              <p className="text-[1.4rem] font-medium text-fics-text">Upload a Claude Skill file</p>
              <p className="text-[1.3rem] text-fics-text-muted mt-1">Drag and drop a .skill file here, or click to browse</p>
            </div>
          </div>
        ) : (
          <div className="card p-8 text-fics-text-muted text-[1.3rem]">
            No skill has been uploaded for this design system yet.
          </div>
        )
      ) : (
        <div className="card p-8 md:p-10 overflow-x-auto">
          <div
            className="prose max-w-none text-[1.4rem]"
            style={{
              '--tw-prose-body':            'var(--color-text)',
              '--tw-prose-headings':        'var(--color-text)',
              '--tw-prose-lead':            'var(--color-text-muted)',
              '--tw-prose-links':           'rgb(var(--color-heading))',
              '--tw-prose-bold':            'var(--color-text)',
              '--tw-prose-counters':        'var(--color-text-muted)',
              '--tw-prose-bullets':         'var(--color-text-muted)',
              '--tw-prose-hr':              'var(--color-border)',
              '--tw-prose-quotes':          'var(--color-text)',
              '--tw-prose-quote-borders':   'var(--color-border)',
              '--tw-prose-captions':        'var(--color-text-muted)',
              '--tw-prose-code':            'var(--color-text)',
              '--tw-prose-pre-code':        'var(--color-text)',
              '--tw-prose-pre-bg':          'rgb(var(--color-bg-dark))',
              '--tw-prose-th-borders':      'var(--color-border)',
              '--tw-prose-td-borders':      'var(--color-border)',
            } as React.CSSProperties}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{stripFrontmatter(skill)}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  )
}
