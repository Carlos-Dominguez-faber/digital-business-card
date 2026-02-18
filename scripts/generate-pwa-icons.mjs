#!/usr/bin/env node
/**
 * Generate PWA icons from SVG
 * Run with: node scripts/generate-pwa-icons.mjs
 */

import sharp from 'sharp'
import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '../public')

const sizes = [192, 512]

async function generateIcons() {
  const svgPath = join(publicDir, 'icons/app-icon.svg')
  const svgBuffer = readFileSync(svgPath)

  for (const size of sizes) {
    const outputPath = join(publicDir, `icons/icon-${size}.png`)

    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath)

    console.log(`Generated: icon-${size}.png`)
  }

  // Generate Apple Touch Icon
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(join(publicDir, 'apple-touch-icon.png'))

  console.log('Generated: apple-touch-icon.png')

  // Generate favicon.ico (32x32)
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(join(publicDir, 'favicon.png'))

  console.log('Generated: favicon.png')

  console.log('\nAll PWA icons generated successfully!')
}

generateIcons().catch(console.error)
