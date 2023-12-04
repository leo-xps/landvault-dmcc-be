import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import puppeteer from 'puppeteer';

function conLog(...args) {
  if (process.env.NODE_ENV === 'production') {
    return;
  }
  console.log(...args);
}

@Injectable()
export class PuppeteerService {
  async getBrowser() {
    // Create a browser instance
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-gpu'],
    });

    return browser;
  }

  async getWebPageComponent(url: string, componentId: string) {
    const browser = await this.getBrowser();
    const page = await browser.newPage(); // open new tab

    conLog('Opening new tab');

    await page.goto(url); // go to site

    conLog('Going to site: ', url);

    // To reflect CSS used for screens instead of print
    await page.emulateMediaType('screen');

    const pageRaw = await page.content();
    conLog('Page: ', pageRaw);

    await page.waitForSelector(componentId); // wait for the selector to load

    conLog('Waiting for selector: ', componentId);

    const element = await page.$(componentId); // declare a variable with an ElementHandle

    // save element screenshot
    const image = await element.screenshot({
      type: 'jpeg',
      // quality: 100,
      // omitBackground: true,
    });

    conLog('Screenshot taken');

    await browser.close(); // close browser

    // // convert buffer to base64 string
    // const base64Image = await image.toString('base64');

    // return a streamable buffer

    return image;
  }

  async getLocalPageComponent(url: string, componentId: string) {
    const browser = await this.getBrowser();
    const page = await browser.newPage(); // open new tab

    conLog('Opening new tab');

    const finalHtml = await this.getHTMLFileFromTemplates(url);

    //need to wait for the images to load
    await page.setContent(finalHtml, { waitUntil: 'networkidle0' });
    // To reflect CSS used for screens instead of print
    await page.emulateMediaType('screen');

    const pageRaw = await page.content();
    conLog('Page: ', pageRaw);

    await page.waitForSelector(componentId); // wait for the selector to load

    conLog('Waiting for selector: ', componentId);

    // wait for 5 seconds
    await page.waitForTimeout(5000);

    const element = await page.$(componentId); // declare a variable with an ElementHandle

    // save element screenshot
    const image = await element.screenshot({
      type: 'jpeg',
      // quality: 100,
      // omitBackground: true,
    });

    conLog('Screenshot taken');

    await browser.close(); // close browser

    // // convert buffer to base64 string
    // const base64Image = await image.toString('base64');

    // return a streamable buffer

    return image;
  }

  async getHTMLFileFromTemplates(fileLocation: string) {
    try {
      const fileLoc = path.join(
        __dirname,
        '..',
        '..',
        'template',
        fileLocation,
      );
      const data = fs.readFileSync(fileLoc, 'utf8');
      return data;
    } catch (err) {
      console.error(err);
      return null;
    }
  }
}
