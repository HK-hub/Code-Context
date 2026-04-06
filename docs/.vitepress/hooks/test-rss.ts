import { generateRSS } from './rss-generator'
import { resolve } from 'path'
import { writeFileSync } from 'fs'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

async function testRSS() {
  const rssConfig = {
    title: '码出意境',
    description: '技术博客与开源文档站',
    baseUrl: 'http://localhost:5173',
    author: 'HK-hub',
    language: 'zh-CN'
  }
  
  const docsDir = resolve(__dirname, '..')
  console.log('[TEST] Docs dir:', docsDir)
  
  try {
    const feed = await generateRSS(docsDir, rssConfig)
    console.log('[TEST] Feed generated successfully')
    console.log('[TEST] Feed items:', feed.items.length)
    
    const outputDir = resolve(__dirname, '../.vitepress/dist')
    console.log('[TEST] Output dir:', outputDir)
    
    writeFileSync(resolve(outputDir, 'rss.xml'), feed.rss2())
    console.log('[TEST] RSS 2.0 written')
    
    writeFileSync(resolve(outputDir, 'atom.xml'), feed.atom1())
    console.log('[TEST] Atom 1.0 written')
    
    writeFileSync(resolve(outputDir, 'feed.json'), feed.json1())
    console.log('[TEST] JSON Feed written')
    
    console.log('[TEST] All feeds written successfully')
  } catch (error) {
    console.error('[TEST] Error:', error)
  }
}

testRSS()