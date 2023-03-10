require('module-alias/register');

import { Telegraf } from 'telegraf';
import 'reflect-metadata';
import { Container, inject, injectable } from 'inversify';
import { BotBuilder } from './botBuilder';
import { ICommand, BoobsCommand, StartCommand } from '@app/commands';
import { IConfigService, ConfigService, DatabaseService } from '@app/services';
import { TYPES } from '@app/types';
import { IParser, JoyreactorParser } from '@app/parsers';
import { IBotContext } from './context/context.interface';
import { IDatabaseService } from '@app/services';
import { IRatingController, RatingController } from '@app/features';

@injectable()
class App {
  bot: Telegraf<IBotContext>;
  commands: ICommand[] = [];

  constructor(
    @inject(TYPES.BotBuilder) private readonly botBuilder: BotBuilder,
    @inject(TYPES.StartCommand) private readonly startCommand: StartCommand,
    @inject(TYPES.BoobsCommand) private readonly boobsCommand: BoobsCommand
  ) {
    this.bot = botBuilder.get();
    this.commands.push(startCommand);
    this.commands.push(boobsCommand);
  }

  init() {
    for (const command of this.commands) {
      command.handle();
    }
    this.bot.launch();
  }
}

const appContainer = new Container();
appContainer.bind<App>(TYPES.App).to(App).inSingletonScope();
appContainer
  .bind<BotBuilder>(TYPES.BotBuilder)
  .to(BotBuilder)
  .inSingletonScope();
appContainer
  .bind<StartCommand>(TYPES.StartCommand)
  .to(StartCommand)
  .inSingletonScope();
appContainer
  .bind<BoobsCommand>(TYPES.BoobsCommand)
  .to(BoobsCommand)
  .inSingletonScope();
appContainer
  .bind<IConfigService>(TYPES.IConfigService)
  .to(ConfigService)
  .inSingletonScope();
appContainer
  .bind<IDatabaseService>(TYPES.IDatabaseService)
  .to(DatabaseService)
  .inSingletonScope();
appContainer
  .bind<IRatingController>(TYPES.ILikesController)
  .to(RatingController)
  .inSingletonScope();
appContainer
  .bind<IParser>(TYPES.JoyreactorParser)
  .to(JoyreactorParser)
  .inSingletonScope();
const app = appContainer.get<App>(TYPES.App);
app.init();
