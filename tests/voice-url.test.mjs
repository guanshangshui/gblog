import { strict as assert } from 'node:assert'
import fs from 'node:fs'
import path from 'node:path'

const postsDir = path.resolve('src/content/posts')
const supportedExtensions = new Set(['.md', '.mdx'])

function collectPostFiles(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    const results = []

    for (const entry of entries) {
        const resolved = path.join(dir, entry.name)
        if (entry.isDirectory()) {
            results.push(...collectPostFiles(resolved))
        } else if (supportedExtensions.has(path.extname(entry.name))) {
            results.push(resolved)
        }
    }

    return results
}

function extractFrontmatter(content) {
    if (!content.startsWith('---')) {
        return null
    }

    const match = content.match(/^---\s*[\r\n]+([\s\S]*?)\r?\n---\s*[\r\n]/)
    return match ? match[1] : null
}

function extractVoiceUrl(frontmatter) {
    const match = frontmatter.match(/^\s*voiceUrl:\s*(.+)\s*$/m)
    if (!match) {
        return null
    }

    let value = match[1].trim()
    if (value.includes('?')) {
        value = value.split('?')[0].trim()
    }
    if (value.includes('#')) {
        value = value.split('#')[0].trim()
    }
    value = value.replace(/^['"]|['"]$/g, '')
    return value || null
}

function extractVoiceType(frontmatter) {
    const match = frontmatter.match(/^\s*voiceType:\s*(.+)\s*$/m)
    if (!match) {
        return null
    }

    let value = match[1].trim()
    if (value.includes('#')) {
        value = value.split('#')[0].trim()
    }
    value = value.replace(/^['"]|['"]$/g, '')
    return value || null
}

const invalidEntries = []
const files = fs.existsSync(postsDir) ? collectPostFiles(postsDir) : []

for (const file of files) {
    const content = fs.readFileSync(file, 'utf8')
    const frontmatter = extractFrontmatter(content)
    if (!frontmatter) {
        continue
    }

    const voiceUrl = extractVoiceUrl(frontmatter)
    const voiceType = extractVoiceType(frontmatter)
    const normalizedUrl = voiceUrl ? voiceUrl.split('?')[0].split('#')[0] : null

    if (!voiceUrl && !voiceType) {
        continue
    }

    if (!voiceUrl && voiceType) {
        invalidEntries.push({
            file,
            voiceUrl,
            voiceType,
            reason: 'voiceType set without voiceUrl',
        })
        continue
    }

    const hasExtension = normalizedUrl ? /\.[a-z0-9]+$/i.test(normalizedUrl) : false
    const isValidUrl = normalizedUrl ? normalizedUrl.startsWith('/voice/') && hasExtension : false
    if (!isValidUrl) {
        invalidEntries.push({
            file,
            voiceUrl,
            voiceType,
            reason: 'voiceUrl must start with /voice/ and include a file extension',
        })
        continue
    }

    if (voiceType) {
        const isValidType = /^audio\/[a-z0-9.+-]+$/i.test(voiceType)
        if (!isValidType) {
            invalidEntries.push({
                file,
                voiceUrl,
                voiceType,
                reason: 'voiceType must be a valid audio MIME type (e.g., audio/wav)',
            })
        }
    }
}

assert.equal(
    invalidEntries.length,
    0,
    `voiceUrl entries failed validation:\n${invalidEntries
        .map(entry => `${entry.file}: ${entry.voiceUrl ?? ''} ${entry.voiceType ?? ''} (${entry.reason})`.trim())
        .join('\n')}`,
)

console.log('voiceUrl frontmatter checks passed.')
