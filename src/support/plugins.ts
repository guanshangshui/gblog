import path from 'node:path'
import getReadingTime from 'reading-time'
import { toString } from 'mdast-util-to-string'
import { visit } from 'unist-util-visit'

const ImageExtensions = new Set([
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.webp',
    '.avif',
    '.svg',
])

export function remarkReadingTime() {
    // eslint-disable-next-line ts/ban-ts-comment
    // @ts-expect-error
    return function (tree, { data }) {
        const textOnPage = toString(tree)
        const readingTime = getReadingTime(textOnPage)

        data.astro.frontmatter.minutesRead = readingTime.text
    }
}

function parseSize(value: string) {
    const normalized = value.replace(/\s+/g, '').toLowerCase()
    if (!/^\d+(x\d+)?$/.test(normalized)) {
        return null
    }

    const [width, height] = normalized.split('x')
    return {
        width: Number.parseInt(width, 10),
        height: height ? Number.parseInt(height, 10) : null,
    }
}

function escapeAttr(value: string) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
}

function resolveObsidianImageTarget(target: string) {
    const parts = target
        .split('|')
        .map(part => part.trim())
        .filter(Boolean)

    if (parts.length === 0) {
        return null
    }

    const filename = parts.shift()
    if (!filename) {
        return null
    }

    const ext = path.extname(filename).toLowerCase()
    if (!ImageExtensions.has(ext)) {
        return null
    }

    let alt = ''
    let size = null

    for (const part of parts) {
        const maybeSize = parseSize(part)
        if (maybeSize && !size) {
            size = maybeSize
            continue
        }

        if (!alt) {
            alt = part
        }
    }

    let url = filename.replace(/\\/g, '/')
    if (/^data:/.test(url)) {
        return { url, alt, size }
    }

    const isExternal = /^(https?:)?\/\//.test(url)
    if (!isExternal) {
        // Already explicit relative or absolute URLs should be respected.
        const isExplicitPath = /^(\.?\.\/|\/)/.test(url)
        const basename = path.posix.basename(url)
        const looksLikeVaultPath = url.includes('src/content/posts') || url.includes('content/posts') || url.includes('gblog/')
        const looksLikeAttachmentDir = url.includes('_附件_/') || url.includes('/附件/')

        if (!isExplicitPath && (looksLikeVaultPath || looksLikeAttachmentDir)) {
            url = `./_附件_/${basename}`
        } else if (!isExplicitPath && !url.includes('/')) {
            // Default Obsidian behavior: attachments live under the per-post _附件_ folder.
            url = `./_附件_/${url}`
        }
    }

    return { url, alt, size }
}

export function remarkObsidianImages() {
    return function (tree) {
        const appendText = (nodes: any[], value: string) => {
            if (!value) {
                return
            }

            const last = nodes[nodes.length - 1]
            if (last?.type === 'text') {
                last.value += value
                return
            }

            nodes.push({ type: 'text', value })
        }

        const appendImage = (nodes: any[], target: string) => {
            const image = resolveObsidianImageTarget(target.trim())
            if (!image) {
                appendText(nodes, `![[${target}]]`)
                return
            }

            if (image.size) {
                const attrs = [
                    `src="${escapeAttr(image.url)}"`,
                    `alt="${escapeAttr(image.alt || '')}"`,
                ]
                if (image.size.width) {
                    attrs.push(`width="${image.size.width}"`)
                }
                if (image.size.height) {
                    attrs.push(`height="${image.size.height}"`)
                }

                nodes.push({ type: 'html', value: `<img ${attrs.join(' ')} />` })
                return
            }

            nodes.push({
                type: 'image',
                url: image.url,
                alt: image.alt || '',
            })
        }

        const transformInline = (children: any[]) => {
            const nodes: any[] = []
            let collecting = false
            let collected = ''

            const processOutsideText = (value: string) => {
                let text = value
                while (text.length > 0) {
                    const start = text.indexOf('![[')
                    if (start === -1) {
                        appendText(nodes, text)
                        return
                    }

                    appendText(nodes, text.slice(0, start))
                    text = text.slice(start + 3)

                    const end = text.indexOf(']]')
                    if (end !== -1) {
                        appendImage(nodes, text.slice(0, end))
                        text = text.slice(end + 2)
                        continue
                    }

                    collecting = true
                    collected = text
                    return
                }
            }

            const processInsideText = (value: string) => {
                const end = value.indexOf(']]')
                if (end === -1) {
                    collected += value
                    return
                }

                collected += value.slice(0, end)
                appendImage(nodes, collected)
                collecting = false
                collected = ''
                processOutsideText(value.slice(end + 2))
            }

            for (const child of children) {
                if (!collecting) {
                    if (child.type === 'text') {
                        processOutsideText(child.value)
                    } else {
                        nodes.push(child)
                    }
                    continue
                }

                if (child.type === 'text') {
                    processInsideText(child.value)
                    continue
                }

                collected += toString(child)
            }

            if (collecting) {
                appendText(nodes, `![[${collected}`)
            }

            return nodes
        }

        visit(tree, ['paragraph', 'heading'], (node: any) => {
            if (!Array.isArray(node.children) || node.children.length === 0) {
                return
            }
            node.children = transformInline(node.children)
        })
    }
}
