import { Telegraf } from 'telegraf';
import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import { IConfigService } from '@app/services/config';
import { TYPES } from '@app/types';
import { IBotContext } from './context/context.interface';

@injectable()
export class BotBuilder {
  bot: Telegraf<IBotContext>;

  constructor(
    @inject(TYPES.IConfigService) private readonly configService: IConfigService
  ) {
    this.bot = new Telegraf<IBotContext>(this.configService.get('TOKEN'));
  }

  public get() {
    return this.bot;
  }
}
