/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://obsidian-wear.vercel.app',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  exclude: ['/admin/*', '/api/*', '/test-*'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/test-*'],
      },
    ],
    additionalSitemaps: [
      'https://obsidian-wear.vercel.app/sitemap.xml',
    ],
  },
  transform: async (config, path) => {
    // Custom transform for different page types
    if (path === '/') {
      return {
        loc: path,
        changefreq: 'daily',
        priority: 1.0,
        lastmod: new Date().toISOString(),
      }
    }
    
    if (path.startsWith('/product/')) {
      return {
        loc: path,
        changefreq: 'weekly',
        priority: 0.8,
        lastmod: new Date().toISOString(),
      }
    }
    
    if (path.startsWith('/made-to-order')) {
      return {
        loc: path,
        changefreq: 'weekly',
        priority: 0.9,
        lastmod: new Date().toISOString(),
      }
    }
    
    return {
      loc: path,
      changefreq: 'monthly',
      priority: 0.5,
      lastmod: new Date().toISOString(),
    }
  },
}
