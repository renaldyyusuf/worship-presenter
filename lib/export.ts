import type { ServicePlan, ServiceItem, ServiceItemType } from '@/types'

// ─────────────────────────────────────────────
// Export service plan as printable HTML string
// ─────────────────────────────────────────────
export function exportServicePlanHtml(plan: ServicePlan): string {
  const date = new Date(plan.serviceDate + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  const totalMinutes = plan.items.reduce((sum, item) => sum + (item.durationMin ?? 0), 0)
  const totalTime    = totalMinutes > 0
    ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`
    : null

  const rows = plan.items.map((item, i) => `
    <tr>
      <td class="num">${i + 1}</td>
      <td class="type ${item.type}">${TYPE_LABELS[item.type] ?? item.type}</td>
      <td class="title">
        <strong>${escapeHtml(item.title)}</strong>
        ${item.subtitle ? `<span class="sub">${escapeHtml(item.subtitle)}</span>` : ''}
        ${item.notes    ? `<span class="notes">${escapeHtml(item.notes)}</span>`   : ''}
      </td>
      <td class="dur">${item.durationMin ? `${item.durationMin}m` : ''}</td>
    </tr>
  `).join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${escapeHtml(plan.title)} — Service Order</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 14px;
    color: #111;
    background: #fff;
    padding: 40px;
    max-width: 800px;
    margin: 0 auto;
  }
  header { margin-bottom: 32px; border-bottom: 2px solid #111; padding-bottom: 16px; }
  h1 { font-size: 24px; font-weight: 700; margin-bottom: 4px; }
  .meta { color: #555; font-size: 13px; display: flex; gap: 16px; }
  table { width: 100%; border-collapse: collapse; }
  th {
    text-align: left; font-size: 11px; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.06em;
    color: #777; padding: 8px 12px; border-bottom: 1px solid #ddd;
  }
  td { padding: 10px 12px; border-bottom: 1px solid #f0f0f0; vertical-align: top; }
  td.num { color: #aaa; font-size: 12px; width: 32px; }
  td.type {
    font-size: 11px; font-weight: 600; text-transform: uppercase;
    letter-spacing: 0.05em; white-space: nowrap; width: 90px;
  }
  td.type.song         { color: #4f46e5; }
  td.type.bible        { color: #0284c7; }
  td.type.video        { color: #7c3aed; }
  td.type.image        { color: #db2777; }
  td.type.announcement { color: #d97706; }
  td.type.blank        { color: #9ca3af; }
  td.dur { color: #aaa; font-size: 12px; white-space: nowrap; text-align: right; width: 48px; }
  td.title strong { display: block; font-weight: 600; }
  span.sub   { display: block; font-size: 12px; color: #666; margin-top: 1px; }
  span.notes { display: block; font-size: 12px; color: #999; font-style: italic; margin-top: 2px; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: #fafafa; }
  footer { margin-top: 32px; border-top: 1px solid #eee; padding-top: 12px; font-size: 12px; color: #aaa; display: flex; justify-content: space-between; }
  @media print {
    body { padding: 0; }
    tr:hover td { background: transparent; }
  }
</style>
</head>
<body>
<header>
  <h1>${escapeHtml(plan.title)}</h1>
  <div class="meta">
    <span>${escapeHtml(date)}</span>
    ${totalTime ? `<span>Total: ${totalTime}</span>` : ''}
    <span>${plan.items.length} items</span>
  </div>
</header>
<table>
  <thead>
    <tr>
      <th>#</th>
      <th>Type</th>
      <th>Item</th>
      <th style="text-align:right">Time</th>
    </tr>
  </thead>
  <tbody>${rows}</tbody>
</table>
<footer>
  <span>WorshipPresenter</span>
  <span>Printed ${new Date().toLocaleDateString()}</span>
</footer>
</body>
</html>`
}

// ─────────────────────────────────────────────
// Export service plan as plain text
// ─────────────────────────────────────────────
export function exportServicePlanText(plan: ServicePlan): string {
  const date = new Date(plan.serviceDate + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  const lines = [
    plan.title,
    date,
    '─'.repeat(40),
    '',
    ...plan.items.map((item, i) => {
      const num   = String(i + 1).padStart(2, ' ')
      const type  = (TYPE_LABELS[item.type] ?? item.type).padEnd(12)
      const title = item.title
      const dur   = item.durationMin ? ` [${item.durationMin}m]` : ''
      let line    = `${num}. ${type}  ${title}${dur}`
      if (item.notes) line += `\n       Note: ${item.notes}`
      return line
    }),
    '',
    '─'.repeat(40),
    `Total items: ${plan.items.length}`,
  ]

  if (plan.notes) {
    lines.push('', `Notes: ${plan.notes}`)
  }

  return lines.join('\n')
}

// ─────────────────────────────────────────────
// Trigger browser download
// ─────────────────────────────────────────────
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function printHtml(html: string) {
  const win = window.open('', '_blank', 'width=900,height=700')
  if (!win) return
  win.document.write(html)
  win.document.close()
  win.focus()
  setTimeout(() => { win.print() }, 500)
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const TYPE_LABELS: Record<ServiceItemType, string> = {
  song: 'Song', bible: 'Bible', video: 'Video',
  image: 'Image', announcement: 'Announcement', blank: 'Blank',
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
