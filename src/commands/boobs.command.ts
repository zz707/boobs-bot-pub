import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import { Markup, Telegraf } from 'telegraf';
import { IParser } from '@app/parsers/parser.interface';
import { TYPES } from '@app/types';
import { ICommand } from './command.interface';
import { BotBuilder } from '@app/botBuilder';
import { IBotContext } from '@app/context/context.interface';
import { IRatingController } from '@app/features/rating/controller.interface';

@injectable()
export class BoobsCommand implements ICommand {
  private bot: Telegraf<IBotContext>;
  private localQueue: IBotContext[] = [];

  constructor(
    @inject(TYPES.BotBuilder) private readonly botBuilder: BotBuilder,
    @inject(TYPES.JoyreactorParser) private readonly joyreactorParser: IParser,
    @inject(TYPES.ILikesController)
    private readonly ratingController: IRatingController
  ) {
    this.bot = botBuilder.get();
    this.createLocalQueueTimer();
  }

  private addToLocalQueue(botContext: IBotContext) {
    this.localQueue.push(botContext);
  }

  private createLocalQueueTimer(): void {
    setInterval(() => {
      if (this.localQueue.length > 0) {
        const botContext = this.localQueue.pop();

        if (botContext) {
          this.sendPhoto(botContext);
        }
      }
    }, 3000);
  }

  private async sendPhoto(botContext: IBotContext) {
    try {
      const photoUrl = await this.joyreactorParser.getLink();
      const newRatingId = await this.ratingController.addRating(photoUrl);

      botContext.replyWithPhoto(
        photoUrl,
        this.buildLikeMarkupMessage(newRatingId[0], 0, 0)
      );
      console.log('send photo with ID = ', newRatingId);
    } catch (e) {
      if (e instanceof Error) {
        console.log(e.message);
        this.addToLocalQueue(botContext);
        return;
      }
    }
  }

  private buildLikeMarkupMessage(
    ratingId: number,
    likeCount: number,
    dislikeCount: number
  ) {
    const localLikeCounter = likeCount > 0 ? likeCount : '';
    const localDislikeCounter = dislikeCount > 0 ? dislikeCount : '';
    return Markup.inlineKeyboard([
      Markup.button.callback(
        '👍 ' + localLikeCounter,
        'boobs_like#' + ratingId
      ),
      Markup.button.callback(
        '👎 ' + localDislikeCounter,
        'boobs_dislike#' + ratingId
      ),
    ]);
  }

  handle(): void {
    this.bot.command('boobs', (ctx) => {
      this.addToLocalQueue(ctx);
    });

    this.bot.command('boobs_top3', async (ctx) => {
      type TMedias = {
        type: 'photo';
        media: string;
        caption: string;
      };
      const medias: TMedias[] = [];
      const ratings = await this.ratingController.getTop(3);

      if (ratings.length === 0) return;
      ratings.forEach((rating) => {
        medias.push({
          media: rating.url,
          caption: '👍 ' + rating.likes.toString(),
          type: 'photo',
        });
      });

      ctx.replyWithMediaGroup(medias);
    });

    this.bot.action(/boobs_like#+/, async (ctx) => {
      const args = ctx.match.input.split('#');
      const ratingId = Number(args[1]);
      if (ratingId === undefined || ratingId < 0) return;
      const rating = await this.ratingController.getRatingById(ratingId);
      
      if (!rating) return;

      const newLikesCount = rating.likes + 1;
      await this.ratingController.setLikesById(ratingId, newLikesCount);

      ctx.editMessageReplyMarkup(
        this.buildLikeMarkupMessage(ratingId, newLikesCount, rating.dislikes)
          .reply_markup
      );
    });

    this.bot.action(/boobs_dislike#+/, async (ctx) => {
      const args = ctx.match.input.split('#');
      const ratingId = Number(args[1]);
      if (ratingId === undefined || ratingId < 0) return;
      const rating = await this.ratingController.getRatingById(ratingId);
      
      if (!rating) return;

      const newDislikesCount = rating.dislikes + 1;
      await this.ratingController.setDislikesById(ratingId, newDislikesCount);

      ctx.editMessageReplyMarkup(
        this.buildLikeMarkupMessage(ratingId, rating.likes, newDislikesCount)
          .reply_markup
      );
    });
  }
}
