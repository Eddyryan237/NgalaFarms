export function exportReport(report, filename)
{
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${filename}.json`
    link.click()
    window.URL.revokeObjectURL(url)
}

export function saveReport()
{
    window.print()
}
