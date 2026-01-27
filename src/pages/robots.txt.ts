// https://docs.astro.build/en/guides/integrations-guide/sitemap/#usage
import type { APIRoute } from 'astro'

const robotsTxt = `
User-agent: Googlebot
Disallow: /posts/
Disallow: /tags/
Disallow: /categories/
Disallow: /voice/
Allow: /
Crawl-delay: 10

User-agent: Yandex
Disallow: /posts/
Disallow: /tags/
Disallow: /categories/
Disallow: /voice/
Allow: /
Crawl-delay: 2

User-agent: archive.org_bot
Disallow: /posts/
Disallow: /tags/
Disallow: /categories/
Disallow: /voice/
Allow: /
Crawl-delay: 2

User-agent: *
Disallow: /posts/
Disallow: /tags/
Disallow: /categories/
Disallow: /voice/
Allow: /

Sitemap: ${new URL('sitemap-index.xml', import.meta.env.SITE).href}`.trim()

export const GET: APIRoute = () => {
    return new Response(robotsTxt, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
        },
    })
}
