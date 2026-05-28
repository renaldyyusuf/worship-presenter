'use client'

import { useEffect, useState, useRef } from 'react'
import { useThemeStore } from '@/stores/stage-theme.store'
import { usePresentationStore } from '@/stores/presentation.store'
import { useSettingsStore } from '@/stores/settings.store'
import { DEFAULT_THEME } from '@/types/presentation'
import { ThemePreview } from '@/components/presentation/ThemePreview'
import { TRANSITION_OPTIONS } from '@/lib/transitions'
import type { Theme } from '@/types'
import {
  Save, Plus, Trash2, Check, AlignCenter, AlignLeft, AlignRight,
  ExternalLink, Upload, Layers, Globe, Monitor, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type Tab = 'profile' | 'theme' | 'transition' | 'output' | 'about'

export default function SettingsPage() {
  const { themes, activeThemeId, fetchThemes, createTheme, updateTheme, deleteTheme, setActiveTheme, getActiveTheme } = useThemeStore()
  const { theme: liveTheme, setTheme: setLiveTheme, transition, transitionMs, setTransition } = usePresentationStore()
  const settings = useSettingsStore()
  const [tab, setTab] = useState<Tab>('profile')

  useEffect(() => {
    fetchThemes()
    settings.fetchSettings()
  }, [])

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'profile',    label: 'Church',      icon: <Globe    className="h-4 w-4" /> },
    { id: 'theme',      label: 'Themes',      icon: <Layers   className="h-4 w-4" /> },
    { id: 'transition', label: 'Transitions', icon: <ChevronRight className="h-4 w-4" /> },
    { id: 'output',     label: 'Output',      icon: <Monitor  className="h-4 w-4" /> },
    { id: 'about',      label: 'About',       icon: null },
  ]

  return (
    <div className="flex h-full overflow-hidden">
      <div className="w-[200px] flex-shrink-0 border-r border-white/[0.06] flex flex-col bg-[#0d0d0d] p-3 gap-0.5">
        {TABS.map(({ id, label, icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={cn('w-full text-left rounded-md px-3 py-2 text-sm flex items-center gap-2.5 transition-colors',
              tab === id ? 'bg-white/[0.08] text-white' : 'text-white/45 hover:text-white/70 hover:bg-white/[0.04]')}>
            {icon && <span className="opacity-60">{icon}</span>}
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {tab === 'profile'    && <ProfileSettings />}
        {tab === 'theme'      && <ThemeSettings themes={themes} activeThemeId={activeThemeId}
            liveTheme={liveTheme}
            onActivate={(id) => { setActiveTheme(id); const t = themes.find(x => x.id === id); if (t) setLiveTheme(t) }}
            onUpdate={updateTheme} onDelete={deleteTheme}
            onCreateNew={() => createTheme({ ...DEFAULT_THEME, name: 'New Theme', isDefault: false })} />}
        {tab === 'transition' && <TransitionSettings transition={transition} transitionMs={transitionMs} setTransition={setTransition} />}
        {tab === 'output'     && <OutputSettings />}
        {tab === 'about'      && <AboutSection />}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Church profile settings
// ─────────────────────────────────────────────
function ProfileSettings() {
  const { profile, output, isSaving, updateProfile, uploadLogo } = useSettingsStore()
  const [name, setName] = useState(profile.name)
  const logoInputRef    = useRef<HTMLInputElement>(null)
  const [logoPreview, setLogoPreview] = useState(profile.logoUrl)

  const handleSave = () => updateProfile({ name, logoUrl: logoPreview })

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = await uploadLogo(file)
    if (url) setLogoPreview(url)
  }

  return (
    <div className="p-6 max-w-lg space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-white mb-1">Church Profile</h2>
        <p className="text-xs text-white/35">Used in service plans, exports, and the logo screen.</p>
      </div>

      {/* Logo upload */}
      <div>
        <label className="text-xs text-white/40 font-medium block mb-3">Church Logo</label>
        <div className="flex items-center gap-4">
          <div className="h-20 w-32 rounded-lg border border-white/[0.08] bg-black flex items-center justify-center overflow-hidden">
            {logoPreview
              ? <img src={logoPreview} alt="Logo" className="max-h-full max-w-full object-contain p-2" />
              : <Layers className="h-8 w-8 text-white/15" />}
          </div>
          <div className="space-y-2">
            <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
            <button onClick={() => logoInputRef.current?.click()}
              className="flex items-center gap-1.5 h-8 rounded-md border border-white/[0.08] px-3 text-sm text-white/50 hover:bg-white/[0.05] hover:text-white/70 transition-colors">
              <Upload className="h-3.5 w-3.5" />Upload Logo
            </button>
            {logoPreview && (
              <button onClick={() => setLogoPreview('')}
                className="text-xs text-white/25 hover:text-red-400 transition-colors block">
                Remove
              </button>
            )}
            <p className="text-[11px] text-white/20">PNG or SVG, recommended 400×150px</p>
          </div>
        </div>
      </div>

      {/* Church name */}
      <div>
        <label className="text-xs text-white/40 font-medium block mb-1.5">Church Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)}
          placeholder="First Baptist Church"
          className="w-full h-9 rounded-md bg-white/[0.05] px-3 text-sm text-white placeholder:text-white/25 border border-white/[0.07] focus:outline-none focus:border-indigo-500/50 transition-colors" />
      </div>

      <button onClick={handleSave} disabled={isSaving}
        className="flex items-center gap-1.5 h-9 rounded-md bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors">
        <Save className="h-3.5 w-3.5" />
        {isSaving ? 'Saving…' : 'Save Changes'}
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────
// Theme settings
// ─────────────────────────────────────────────
function ThemeSettings({ themes, activeThemeId, liveTheme, onActivate, onUpdate, onDelete, onCreateNew }: any) {
  const [editId, setEditId] = useState<string | null>(null)
  const editTheme = themes.find((t: Theme) => t.id === editId)

  return (
    <div className="p-6 max-w-2xl space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-white mb-1">Presentation Themes</h2>
        <p className="text-xs text-white/35">Create reusable text styles. The active theme applies to all new slides.</p>
      </div>

      <div className="space-y-2">
        {themes.map((theme: Theme) => (
          <div key={theme.id}
            onClick={() => onActivate(theme.id)}
            className={cn('flex items-center gap-4 rounded-lg border px-4 py-3 cursor-pointer transition-all',
              activeThemeId === theme.id
                ? 'border-indigo-500/40 bg-indigo-500/[0.07]'
                : 'border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.03]')}>
            {/* Mini preview */}
            <div className="h-10 w-16 rounded bg-black border border-white/[0.08] flex items-center justify-center flex-shrink-0">
              <span style={{
                fontFamily: theme.fontFamily, fontSize: 11, fontWeight: theme.fontWeight,
                color: theme.textColor,
                textShadow: theme.textShadow?.enabled
                  ? `${theme.textShadow.x}px ${theme.textShadow.y}px ${theme.textShadow.blur}px ${theme.textShadow.color}` : 'none',
              }}>Aa</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white/85">{theme.name}</p>
              <p className="text-xs text-white/30">{theme.fontFamily} · {theme.fontSize}px · {theme.textAlign}</p>
            </div>
            <div className="flex items-center gap-2">
              {activeThemeId === theme.id && (
                <span className="text-[11px] text-indigo-400 font-medium flex items-center gap-1">
                  <Check className="h-3 w-3" />Active
                </span>
              )}
              <button onClick={(e) => { e.stopPropagation(); setEditId(editId === theme.id ? null : theme.id) }}
                className="h-7 rounded px-2.5 text-xs text-white/40 hover:bg-white/[0.06] hover:text-white/70 border border-white/[0.06] transition-colors">Edit</button>
              {!theme.isDefault && (
                <button onClick={(e) => { e.stopPropagation(); onDelete(theme.id) }}
                  className="h-7 w-7 flex items-center justify-center rounded text-white/25 hover:bg-red-500/10 hover:text-red-400 transition-colors">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {editTheme && (
        <ThemeEditor theme={editTheme}
          onSave={(vals) => { onUpdate(editTheme.id, vals); setEditId(null) }}
          onCancel={() => setEditId(null)} />
      )}

      <button onClick={onCreateNew}
        className="flex items-center gap-1.5 h-8 rounded-md border border-dashed border-white/[0.12] px-4 text-sm text-white/35 hover:text-white/60 hover:border-white/25 transition-colors w-full justify-center">
        <Plus className="h-3.5 w-3.5" />New Theme
      </button>
    </div>
  )
}

function ThemeEditor({ theme, onSave, onCancel }: { theme: Theme; onSave: (v: any) => void; onCancel: () => void }) {
  const [vals, setVals] = useState({ ...theme })
  const set = (key: string, value: any) => setVals((v) => ({ ...v, [key]: value }))
  const FONTS = ['Inter','Georgia','Times New Roman','Arial','Helvetica','Trebuchet MS','Verdana','Impact']

  return (
    <div className="rounded-xl border border-white/[0.09] bg-white/[0.02] p-5 space-y-4">
      <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider">Edit: {theme.name}</h3>
      <ThemePreview theme={vals} className="w-full border border-white/[0.07]" />
      <Row label="Name"><input value={vals.name} onChange={(e) => set('name', e.target.value)} className="flex-1 h-8 rounded bg-white/[0.05] px-2.5 text-sm text-white border border-white/[0.07] focus:outline-none focus:border-indigo-500/40" /></Row>
      <Row label="Font">
        <select value={vals.fontFamily} onChange={(e) => set('fontFamily', e.target.value)} className="flex-1 h-8 rounded bg-white/[0.05] px-2.5 text-sm text-white border border-white/[0.07] focus:outline-none focus:border-indigo-500/40">
          {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
      </Row>
      <div className="grid grid-cols-2 gap-4">
        <Row label="Size (px)"><input type="number" value={vals.fontSize} onChange={(e) => set('fontSize', +e.target.value)} min={12} max={120} className="w-24 h-8 rounded bg-white/[0.05] px-2.5 text-sm text-white border border-white/[0.07] focus:outline-none focus:border-indigo-500/40" /></Row>
        <Row label="Weight">
          <select value={vals.fontWeight} onChange={(e) => set('fontWeight', +e.target.value)} className="h-8 rounded bg-white/[0.05] px-2 text-sm text-white border border-white/[0.07] focus:outline-none focus:border-indigo-500/40">
            {[300,400,500,600,700,800,900].map((w) => <option key={w} value={w}>{w}</option>)}
          </select>
        </Row>
      </div>
      <Row label="Align">
        <div className="flex gap-1">
          {[['left',AlignLeft],['center',AlignCenter],['right',AlignRight]].map(([v,Icon]: any) => (
            <button key={v} onClick={() => set('textAlign', v)}
              className={cn('h-8 w-8 flex items-center justify-center rounded border transition-colors',
                vals.textAlign === v ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-400' : 'border-white/[0.06] text-white/40 hover:text-white/60')}>
              <Icon className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>
      </Row>
      <Row label="Position">
        <div className="flex gap-1">
          {['top','middle','bottom'].map((p) => (
            <button key={p} onClick={() => set('textPosition', p)}
              className={cn('h-8 rounded px-3 text-xs capitalize border transition-colors',
                vals.textPosition === p ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-400' : 'border-white/[0.06] text-white/40 hover:text-white/60')}>
              {p}
            </button>
          ))}
        </div>
      </Row>
      <Row label="Color">
        <div className="flex items-center gap-2">
          <input type="color" value={vals.textColor} onChange={(e) => set('textColor', e.target.value)}
            className="h-8 w-12 rounded border border-white/[0.07] bg-transparent cursor-pointer" />
          <input value={vals.textColor} onChange={(e) => set('textColor', e.target.value)}
            className="w-28 h-8 rounded bg-white/[0.05] px-2.5 font-mono text-xs text-white border border-white/[0.07] focus:outline-none focus:border-indigo-500/40" />
        </div>
      </Row>
      <Row label="Line Height">
        <input type="range" value={vals.lineHeight} onChange={(e) => set('lineHeight', +e.target.value)}
          min={1} max={2.5} step={0.05} className="flex-1 accent-indigo-500" />
        <span className="text-xs text-white/40 w-10 text-right">{vals.lineHeight}</span>
      </Row>
      <Row label="Shadow">
        <input type="checkbox" checked={vals.textShadow?.enabled ?? false}
          onChange={(e) => set('textShadow', { ...(vals.textShadow ?? {}), enabled: e.target.checked })} className="mr-2" />
        {vals.textShadow?.enabled && (
          <input type="color" value={vals.textShadow.color ?? '#000000'}
            onChange={(e) => set('textShadow', { ...vals.textShadow, color: e.target.value })}
            className="h-7 w-10 rounded border border-white/[0.07] bg-transparent cursor-pointer" />
        )}
      </Row>
      <div className="flex gap-2 pt-2">
        <button onClick={() => onSave(vals)}
          className="flex items-center gap-1.5 h-8 rounded-md bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-500 transition-colors">
          <Save className="h-3.5 w-3.5" />Save
        </button>
        <button onClick={onCancel}
          className="h-8 rounded-md border border-white/[0.07] px-4 text-sm text-white/40 hover:text-white/60 transition-colors">Cancel</button>
      </div>
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-xs text-white/40 w-24 flex-shrink-0">{label}</span>
      <div className="flex items-center gap-2 flex-1">{children}</div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Transition settings
// ─────────────────────────────────────────────
function TransitionSettings({ transition, transitionMs, setTransition }: any) {
  const [localMs, setLocalMs] = useState(transitionMs)

  return (
    <div className="p-6 max-w-xl space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-white mb-1">Slide Transitions</h2>
        <p className="text-xs text-white/35">Applied on the /output window in real-time.</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {TRANSITION_OPTIONS.map((opt) => (
          <button key={opt.value} onClick={() => setTransition(opt.value, localMs)}
            className={cn('rounded-lg border p-3 text-left transition-colors',
              transition === opt.value ? 'border-indigo-500/40 bg-indigo-500/[0.08]' : 'border-white/[0.07] hover:border-white/[0.14] hover:bg-white/[0.02]')}>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-sm font-medium text-white/80">{opt.label}</p>
              {transition === opt.value && (
                <span className="h-4 w-4 rounded-full bg-indigo-500 flex items-center justify-center">
                  <Check className="h-2.5 w-2.5 text-white" />
                </span>
              )}
            </div>
            <p className="text-xs text-white/35">{opt.description}</p>
          </button>
        ))}
      </div>
      {transition !== 'cut' && (
        <div>
          <label className="text-xs text-white/40 font-medium block mb-3">
            Duration — <span className="text-white/60 tabular-nums">{localMs}ms</span>
          </label>
          <input type="range" min={100} max={1000} step={50} value={localMs}
            onChange={(e) => { const v = parseInt(e.target.value); setLocalMs(v); setTransition(transition, v) }}
            className="w-full accent-indigo-500" />
          <div className="flex justify-between mt-1">
            <span className="text-[11px] text-white/20">100ms (fast)</span>
            <span className="text-[11px] text-white/20">1000ms (slow)</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// Output window settings
// ─────────────────────────────────────────────
function OutputSettings() {
  const { output, updateOutput } = useSettingsStore()

  const toggles = [
    { key: 'showProgressBar',  label: 'Show slide progress bar', desc: 'Thin bar at bottom of output screen' },
    { key: 'showSectionLabel', label: 'Show section label',      desc: 'e.g. "Chorus", "Verse 2" above lyrics' },
    { key: 'showSlideNumber',  label: 'Show slide number',       desc: 'Small indicator in corner of output' },
  ] as const

  return (
    <div className="p-6 max-w-xl space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-white mb-1">Output Window</h2>
        <p className="text-xs text-white/35">Configure what appears on the audience display.</p>
      </div>

      <div className="space-y-2">
        {toggles.map(({ key, label, desc }) => (
          <label key={key} className="flex items-center justify-between rounded-lg border border-white/[0.07] px-4 py-3 cursor-pointer hover:border-white/[0.12] transition-colors group">
            <div>
              <p className="text-sm text-white/80 font-medium">{label}</p>
              <p className="text-xs text-white/35 mt-0.5">{desc}</p>
            </div>
            <div className={cn('h-5 w-9 rounded-full relative transition-colors flex-shrink-0',
              output[key] ? 'bg-indigo-600' : 'bg-white/[0.10]')}>
              <div className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all',
                output[key] ? 'left-[18px]' : 'left-0.5')} />
              <input type="checkbox" className="sr-only" checked={output[key]} onChange={(e) => updateOutput({ [key]: e.target.checked })} />
            </div>
          </label>
        ))}
      </div>

      <div>
        <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">Open Windows</h3>
        <div className="space-y-2">
          {[
            { href: '/output',    label: 'Audience Output',  desc: 'Full-screen presentation' },
            { href: '/stage',     label: 'Stage Display',    desc: 'Confidence monitor' },
            { href: '/countdown?minutes=10&autostart=0', label: 'Pre-Service Countdown', desc: '?minutes=N&label=Text&autostart=1' },
          ].map(({ href, label, desc }) => (
            <a key={href} href={href} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-4 rounded-lg border border-white/[0.07] px-4 py-3 hover:border-white/[0.14] hover:bg-white/[0.02] transition-colors group">
              <div className="flex-1">
                <p className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">{label}</p>
                <p className="text-xs text-white/35 mt-0.5">{desc}</p>
                <p className="text-[11px] text-indigo-400/60 mt-1 font-mono">{href}</p>
              </div>
              <ExternalLink className="h-4 w-4 text-white/25 group-hover:text-white/60 transition-colors" />
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// About
// ─────────────────────────────────────────────
function AboutSection() {
  return (
    <div className="p-6 max-w-xl space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-white mb-1">WorshipPresenter</h2>
        <p className="text-xs text-white/35">Modern church presentation software</p>
      </div>
      <div className="rounded-lg border border-white/[0.06] p-4 space-y-2">
        {[['Version','0.1.0'],['Stack','Next.js 15 · Supabase · Socket.io · Zustand'],['License','MIT']].map(([k,v]) => (
          <div key={k} className="flex gap-4">
            <span className="text-xs text-white/30 w-20">{k}</span>
            <span className="text-xs text-white/60">{v}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
