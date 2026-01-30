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
    if (!/^(https?:)?\/\//.test(url) && !url.includes('_附件_/')) {
        url = `./_附件_/${url}`
    }

    return { url, alt, size }
}

export function remarkObsidianImages() {
    return function (tree) {
        visit(tree, 'text', (node, index, parent) => {
            if (!parent || typeof index !== 'number') {
                return
            }

            const text = node.value
            const matches = [...text.matchAll(/!\[\[([^\]]+)\]\]/g)]
            if (matches.length === 0) {
                return
            }

            const nodes = []
            let lastIndex = 0

            for (const match of matches) {
                const start = match.index ?? 0
                const end = start + match[0].length

                if (start > lastIndex) {
                    nodes.push({ type: 'text', value: text.slice(lastIndex, start) })
                }

                const target = match[1].trim()
                const image = resolveObsidianImageTarget(target)

                if (!image) {
                    nodes.push({ type: 'text', value: match[0] })
                    lastIndex = end
                    continue
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
                } else {
                    nodes.push({
                        type: 'image',
                        url: image.url,
                        alt: image.alt || '',
                    })
                }

                lastIndex = end
            }

            if (lastIndex < text.length) {
                nodes.push({ type: 'text', value: text.slice(lastIndex) })
            }

            parent.children.splice(index, 1, ...nodes)
            return [visit.SKIP, index + nodes.length]
        })
    }
}
