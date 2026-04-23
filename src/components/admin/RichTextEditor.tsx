'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect, useCallback, useState } from 'react'
import { cn } from '@/lib/utils'
import {
  Bold, Italic, UnderlineIcon, Strikethrough,
  List, ListOrdered, AlignLeft, AlignCenter, AlignRight,
  Heading2, Heading3, Quote, Undo, Redo, Link as LinkIcon, Minus,
  X, Check,
} from 'lucide-react'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  className?: string
}

// ── Toolbar button ───────────────────────────────────────────────
function ToolBtn({
  onClick, active = false, disabled = false, title, children,
}: {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onMouseDown={e => { e.preventDefault(); onClick() }}
      disabled={disabled}
      title={title}
      className={cn(
        'p-1.5 rounded-lg transition-all text-sm',
        active
          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
          : 'text-gray-400 hover:text-white hover:bg-white/8 border border-transparent',
        disabled && 'opacity-30 cursor-not-allowed',
      )}
    >
      {children}
    </button>
  )
}

// ── Separator ───────────────────────────────────────────────────
function Sep() {
  return <div className="w-px h-5 bg-gray-800 mx-0.5 shrink-0" />
}

// ── Main component ───────────────────────────────────────────────
export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write a detailed product description…',
  className,
}: RichTextEditorProps) {
  const [linkModalOpen, setLinkModalOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      TextStyle,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-amber-400 underline underline-offset-2' },
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-sm max-w-none focus:outline-none min-h-[160px] text-gray-200 leading-relaxed',
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML())
    },
  })

  // Sync external value changes (e.g. when loading product data)
  useEffect(() => {
    if (!editor) return
    const current = editor.getHTML()
    if (value !== current) {
      // Prevent cursor jump on every keystroke — only update when value truly differs
      if (value === '' || value === '<p></p>') {
        editor.commands.clearContent(true)
      } else {
        editor.commands.setContent(value)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const setLink = useCallback(() => {
    if (!editor) return
    const prev = editor.getAttributes('link').href as string | undefined
    setLinkUrl(prev ?? 'https://')
    setLinkModalOpen(true)
  }, [editor])

  const handleLinkSubmit = () => {
    if (!editor) return
    if (linkUrl === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl, target: '_blank' }).run()
    }
    setLinkModalOpen(false)
    setLinkUrl('')
  }

  if (!editor) return null

  return (
    <div className={cn('flex flex-col rounded-2xl border border-gray-800 bg-[#0a0a0a] overflow-hidden focus-within:border-amber-500/40 transition-colors', className)}>
      {/* ── Toolbar ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-gray-800 bg-[#0d0d0d]">

        {/* History */}
        <ToolBtn title="Undo (Ctrl+Z)" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
          <Undo className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn title="Redo (Ctrl+Y)" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
          <Redo className="w-3.5 h-3.5" />
        </ToolBtn>

        <Sep />

        {/* Headings */}
        <ToolBtn
          title="Heading 2"
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn
          title="Heading 3"
          active={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 className="w-3.5 h-3.5" />
        </ToolBtn>

        <Sep />

        {/* Marks */}
        <ToolBtn title="Bold (Ctrl+B)" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn title="Italic (Ctrl+I)" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn title="Underline (Ctrl+U)" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn title="Strikethrough" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <Strikethrough className="w-3.5 h-3.5" />
        </ToolBtn>

        <Sep />

        {/* Lists */}
        <ToolBtn title="Bullet List" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn title="Numbered List" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn title="Blockquote" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn title="Divider" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <Minus className="w-3.5 h-3.5" />
        </ToolBtn>

        <Sep />

        {/* Alignment */}
        <ToolBtn title="Align Left" active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()}>
          <AlignLeft className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn title="Align Center" active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()}>
          <AlignCenter className="w-3.5 h-3.5" />
        </ToolBtn>
        <ToolBtn title="Align Right" active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()}>
          <AlignRight className="w-3.5 h-3.5" />
        </ToolBtn>

        <Sep />

        {/* Link */}
        <ToolBtn title="Insert Link" active={editor.isActive('link')} onClick={setLink}>
          <LinkIcon className="w-3.5 h-3.5" />
        </ToolBtn>

        {/* Character / word count */}
        <span className="ml-auto text-[10px] text-gray-600 font-mono whitespace-nowrap">
          {editor.storage.characterCount?.characters?.() ?? editor.getText().length} chars
        </span>
      </div>

      {/* ── Editor content ───────────────────────────────────────── */}
      <div className="px-5 py-4 flex-1 max-h-96 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>

      {/* ── Prose + placeholder styles ───────────────────────────── */}
      <style>{`
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #4b5563;
          pointer-events: none;
          height: 0;
        }
        .ProseMirror h2 { font-size: 1.25rem; font-weight: 800; color: #fff; margin: 1rem 0 0.5rem; }
        .ProseMirror h3 { font-size: 1.05rem; font-weight: 700; color: #e5e7eb; margin: 0.75rem 0 0.375rem; }
        .ProseMirror ul  { list-style: disc;    padding-left: 1.5rem; color: #d1d5db; }
        .ProseMirror ol  { list-style: decimal; padding-left: 1.5rem; color: #d1d5db; }
        .ProseMirror li  { margin: 0.2rem 0; }
        .ProseMirror blockquote {
          border-left: 3px solid #f59e0b; padding-left: 1rem;
          color: #9ca3af; font-style: italic; margin: 0.75rem 0;
        }
        .ProseMirror hr { border: none; border-top: 1px solid #1f2937; margin: 1rem 0; }
        .ProseMirror strong { color: #fff; }
        .ProseMirror em { color: #d1d5db; }
        .ProseMirror code {
          background: #1f2937; padding: 0.1rem 0.4rem;
          border-radius: 4px; font-size: 0.85em; color: #f59e0b;
        }
        .ProseMirror pre {
          background: #111827; padding: 1rem; border-radius: 0.75rem;
          overflow-x: auto; margin: 0.75rem 0;
        }
        .ProseMirror pre code { background: transparent; color: #e5e7eb; }
      `}</style>

      {/* ── Link Modal Dialog ────────────────────────────────────── */}
      {linkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#111] border border-gray-700 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-amber-400" /> Add Link
              </h3>
              <button
                onClick={() => {
                  setLinkModalOpen(false)
                  setLinkUrl('')
                }}
                className="p-1 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">URL</label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={e => setLinkUrl(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleLinkSubmit()
                    if (e.key === 'Escape') {
                      setLinkModalOpen(false)
                      setLinkUrl('')
                    }
                  }}
                  placeholder="https://example.com"
                  autoFocus
                  className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-amber-500/50 transition-all text-sm"
                />
                <p className="text-xs text-gray-500 mt-1.5">Opens in a new tab when clicked</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setLinkModalOpen(false)
                    setLinkUrl('')
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-700 rounded-xl text-gray-300 hover:bg-white/5 hover:text-white transition-all font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleLinkSubmit}
                  className="flex-1 px-4 py-2.5 bg-amber-500 text-black rounded-xl hover:bg-amber-400 transition-all font-bold text-sm flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" /> Add Link
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  // Remove link
                  if (!editor) return
                  editor.chain().focus().extendMarkRange('link').unsetLink().run()
                  setLinkModalOpen(false)
                  setLinkUrl('')
                }}
                className="w-full px-4 py-2 text-xs text-gray-400 hover:text-red-400 border border-gray-800 rounded-lg transition-all hover:border-red-500/30"
              >
                Remove Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
