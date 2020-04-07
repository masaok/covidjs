import puppeteer from 'puppeteer'

import { toMatchImageSnapshot } from 'jest-image-snapshot'

import { act } from 'react-dom/test-utils'


expect.extend({ toMatchImageSnapshot })


describe('jest-image-snapshot usage with an image received from puppeteer', () => {
  let browser: any

  beforeAll(async () => {
    browser = await puppeteer.launch()
    // console.log(typeof browser)
  })

  it('works', async () => {


    await act(async () => {
      const page = await browser.newPage()
      await page.goto('http://localhost:3000')
      const image = await page.screenshot()

      expect(image).toMatchImageSnapshot()

    })
  })

  afterAll(async () => {
    await browser.close()
  })
})

export { }