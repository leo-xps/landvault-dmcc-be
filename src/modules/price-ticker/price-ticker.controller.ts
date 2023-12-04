import { PuppeteerService } from '@modules/puppeteer/puppeteer.service';
import { Controller, Get, Res } from '@nestjs/common';
import { Readable } from 'stream';

@Controller('price-ticker')
export class PriceTickerController {
  constructor(private readonly puppeteerService: PuppeteerService) {}

  imageBuffer: Buffer;
  lastStream: Date;
  // expire after 10 seconds
  expireAfter = 3000;

  @Get('')
  async create(@Res() resp) {
    let alreadySent = false;
    // check if there's a cache
    // return it if it exist
    if (this.imageBuffer && this.lastStream) {
      resp.setHeader('Content-Type', 'image/jpeg');
      //create a read stream in order to stream the image
      const stream = new Readable();
      stream.push(this.imageBuffer);
      stream.push(null);
      stream.pipe(resp);
      alreadySent = true;
    }

    const now = new Date();
    const diff = this.lastStream
      ? now.getTime() - this.lastStream.getTime()
      : 0;

    if (this.lastStream && diff < this.expireAfter) {
      return;
    }

    // check if it's expired
    // fetch new image if it's expired
    const buffer = await this.puppeteerService.getLocalPageComponent(
      'ticker_template.html',
      '#crypto-widget-CoinList',
    );
    this.imageBuffer = buffer;
    this.lastStream = new Date();

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

  @Get('old')
  async createOld(@Res() resp) {
    if (this.imageBuffer && this.lastStream) {
      const now = new Date();
      const diff = now.getTime() - this.lastStream.getTime();
      if (diff < this.expireAfter) {
        resp.setHeader('Content-Type', 'image/jpeg');
        //create a read stream in order to stream the image
        const stream = new Readable();
        stream.push(this.imageBuffer);
        stream.push(null);
        return stream.pipe(resp);
      }
    }
    const buffer = await this.puppeteerService.getWebPageComponent(
      'https://www.google.com',
      'body > div.L3eUgb > div.o3j99.ikrT4e.om7nvf > form > div:nth-child(1) > div.A8SBwf > div.FPdoLc.lJ9FBc > center > input.RNmpXc',
    );
    this.imageBuffer = buffer;
    this.lastStream = new Date();

    resp.setHeader('Content-Type', 'image/jpeg');
    //create a read stream in order to stream the image
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    return stream.pipe(resp);
  }
}
