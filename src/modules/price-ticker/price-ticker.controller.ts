import { PuppeteerService } from '@modules/puppeteer/puppeteer.service';
import { Controller, Get, Query, Res } from '@nestjs/common';
import { Readable } from 'stream';

@Controller('price-ticker')
export class PriceTickerController {
  constructor(private readonly puppeteerService: PuppeteerService) {}

  templates: {
    [key: string]: {
      source: string;
      imageBuffer: Buffer | null;
      lastStream: Date | null;
    };
  } = {
    t01: {
      source: 'ticker_template_1.html',
      imageBuffer: null,
      lastStream: null,
    },
    t02: {
      source: 'ticker_template_2.html',
      imageBuffer: null,
      lastStream: null,
    },
    t03: {
      source: 'ticker_template_3.html',
      imageBuffer: null,
      lastStream: null,
    },
  };

  templatesList = Object.keys(this.templates);

  // expire after 30 seconds
  expireAfter = 30000;

  @Get('')
  async create(@Query('t') template, @Res() resp) {
    if (!template) {
      template = this.templatesList[0];
    }

    // check if template exist
    if (!this.templates[template]) {
      return resp.send('Template not found');
    }

    let alreadySent = false;

    // check if there's a cache
    // return it if it exist
    if (
      this.templates[template].imageBuffer &&
      this.templates[template].lastStream
    ) {
      resp.setHeader('Content-Type', 'image/jpeg');
      //create a read stream in order to stream the image
      const stream = new Readable();
      stream.push(this.templates[template].imageBuffer);
      stream.push(null);
      stream.pipe(resp);
      alreadySent = true;
    }

    const now = new Date();
    const diff = this.templates[template].lastStream
      ? now.getTime() - this.templates[template].lastStream.getTime()
      : 0;

    if (this.templates[template].lastStream && diff < this.expireAfter) {
      return;
    }
    this.templates[template].lastStream = new Date();

    // check if it's expired
    // fetch new image if it's expired
    const buffer = await this.puppeteerService.getLocalPageComponent(
      this.templates[template].source,
      'body > div > div',
    );
    this.templates[template].imageBuffer = buffer;

    if (!alreadySent) {
      resp.setHeader('Content-Type', 'image/jpeg');
      //create a read stream in order to stream the image
      const stream = new Readable();
      stream.push(buffer);
      stream.push(null);
      stream.pipe(resp);
    }

    return;
  }
}
