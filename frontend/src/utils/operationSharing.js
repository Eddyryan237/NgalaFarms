export function getOperationShareText(operation)
{
    const date = operation.date ? new Date(operation.date).toLocaleDateString() : 'Today'
    const details = [
        `Operation: ${operation.operationType || 'Unspecified'}`,
        `Date: ${date}`,
        `Performed by: ${operation.performedBy || 'Manager'}`,
        `Plantation: ${operation.plantationId || operation.plantationName || 'Not assigned'}`,
        operation.palmBlockId ? `Palm block: ${operation.palmBlockId}` : null,
        `Details: ${operation.description || 'No details provided.'}`
    ].filter(Boolean)

    return details.join('\n')
}

export function shareOperationsOnWhatsApp(operations, heading = 'Ngala Farms operations')
{
    const operationList = operations.filter(Boolean)
    if (operationList.length === 0) return false

    const message = [
        `*${heading}*`,
        '',
        ...operationList.map((operation, index) => `${index + 1}. ${getOperationShareText(operation)}`)
    ].join('\n\n')

    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
    return true
}
