const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight')
const markdownIt = require('markdown-it')
const markdownItAnchor = require('markdown-it-anchor')
let markdownItFootnote = require("markdown-it-footnote");
const pluginRss = require('@11ty/eleventy-plugin-rss');

module.exports = function(eleventyConfig) {
  // Plugins
  eleventyConfig.addPlugin(syntaxHighlight)
  eleventyConfig.addPlugin(pluginRss)
  
  // To enable merging of tags
  eleventyConfig.setDataDeepMerge(true)

  // Copy these static files to _site folder
  eleventyConfig.addPassthroughCopy('src/assets')
  eleventyConfig.addPassthroughCopy('src/manifest.json')

  // To create excerpts
  eleventyConfig.setFrontMatterParsingOptions({
    excerpt: true,
    excerpt_alias: 'post_excerpt',
    excerpt_separator: '<!-- excerpt -->'
  })

  // To create a filter to determine duration of post
  eleventyConfig.addFilter('readTime', (value) => {
    const content = value
    const textOnly = content.replace(/(<([^>]+)>)/gi, '')
    const readingSpeedPerMin = 450
    return Math.max(1, Math.floor(textOnly.length / readingSpeedPerMin))
  })

  // Enable us to iterate over all the tags, excluding posts and all
  eleventyConfig.addCollection('tagList', collection => {
    const tagsSet = new Set()
    collection.getAll().forEach(item => {
      if (!item.data.tags) return
      item.data.tags
        .filter(tag => !['posts', 'all'].includes(tag))
        .forEach(tag => tagsSet.add(tag))
    })
    return Array.from(tagsSet).sort()
  })

  const md = markdownIt({ html: true, linkify: true })
  md.use(markdownItAnchor, { 
    level: [1, 2], 
    permalink: markdownItAnchor.permalink.headerLink({ 
      safariReaderFix: true,
      class: 'header-anchor',
    })
  })
  md.use(markdownItFootnote);

  eleventyConfig.setLibrary('md', md)

  // asset_img shortcode
  eleventyConfig.addLiquidShortcode('asset_img', (filename, alt, classNameOverride) => {
    var className = classNameOverride || 'my-4'
    return `<img class="${className}" src="/assets/img/posts/${filename}" alt="${alt}" />`
  })

  return {
    dir: {
      input: 'src'
    }
  }
}
