import { injectable } from 'inversify';
import 'reflect-metadata';
import { IParser } from './parser.interface';

@injectable()
export class JoyreactorParser implements IParser {
  public async getLink(): Promise<string> {
    return 'https://gamerwall.pro/uploads/posts/2022-09/1662340801_12-gamerwall-pro-p-grustnii-kotenok-pinterest-18.jpg';
  }
}
