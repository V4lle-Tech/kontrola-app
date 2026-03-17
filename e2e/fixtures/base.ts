import { test as base, expect, type Page } from '@playwright/test'
import * as fs from 'node:fs'
import * as path from 'node:path'

// ── Screenshot helper for AI analysis ──────────────────────────────

const SCREENSHOTS_DIR = path.resolve('e2e/screenshots')

interface ScreenshotOptions {
  /** Sub-directory within screenshots folder (e.g., 'login', 'dashboard') */
  category?: string
  /** Full page capture — default true */
  fullPage?: boolean
  /** Theme variant label */
  theme?: 'light' | 'dark'
}

async function captureScreenshot(
  page: Page,
  name: string,
  options: ScreenshotOptions = {},
) {
  const { category, fullPage = true, theme } = options
  const dir = category ? path.join(SCREENSHOTS_DIR, category) : SCREENSHOTS_DIR
  fs.mkdirSync(dir, { recursive: true })

  const suffix = theme ? `-${theme}` : ''
  const filePath = path.join(dir, `${name}${suffix}.png`)

  await page.screenshot({ path: filePath, fullPage })
  return filePath
}

async function captureDarkAndLight(page: Page, name: string, category?: string) {
  // Light mode
  await page.emulateMedia({ colorScheme: 'light' })
  await page.waitForTimeout(300) // Allow theme transition
  const light = await captureScreenshot(page, name, { category, theme: 'light' })

  // Dark mode
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.waitForTimeout(300)
  const dark = await captureScreenshot(page, name, { category, theme: 'dark' })

  return { light, dark }
}

// ── Custom test fixture ────────────────────────────────────────────

type KontrolaFixtures = {
  snap: {
    capture: (name: string, options?: ScreenshotOptions) => Promise<string>
    captureBothThemes: (name: string, category?: string) => Promise<{ light: string; dark: string }>
    captureViewports: (name: string, category?: string) => Promise<string[]>
  }
}

export const test = base.extend<KontrolaFixtures>({
  snap: async ({ page }, use) => {
    await use({
      capture: (name, options) => captureScreenshot(page, name, options),

      captureBothThemes: (name, category) => captureDarkAndLight(page, name, category),

      captureViewports: async (name, category) => {
        const viewports = [
          { width: 1280, height: 720, label: 'desktop' },
          { width: 768, height: 1024, label: 'tablet' },
          { width: 375, height: 812, label: 'mobile' },
        ]

        const paths: string[] = []
        for (const vp of viewports) {
          await page.setViewportSize({ width: vp.width, height: vp.height })
          await page.waitForTimeout(300)
          const p = await captureScreenshot(page, `${name}-${vp.label}`, { category })
          paths.push(p)
        }
        return paths
      },
    })
  },
})

export { expect }
