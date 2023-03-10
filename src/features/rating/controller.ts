import { inject, injectable } from 'inversify';
import { IDatabaseService } from '@app/services';
import { TYPES } from '@app/types';
import { Rating } from './model';
import { IRatingController } from './controller.interface';

@injectable()
export class RatingController implements IRatingController {
  private db: any;

  constructor(
    @inject(TYPES.IDatabaseService)
    private readonly databaseService: IDatabaseService
  ) {
    this.db = databaseService.get();
  }

  getRatingById = async (id: number): Promise<Rating> => {
    const rating = await this.db.from('ratings').where({ id: id }).first();
    return rating;
  };

  addRating = async (url: string): Promise<number[]> => {
    const rating = await this.db
      .insert({
        url: url,
        likes: 0,
        dislikes: 0,
        created_at: Date.now(),
        updated_at: Date.now(),
      })
      .into('ratings');
    return rating;
  };

  setLikesById = async (id: number, likesCount: number): Promise<void> => {
    await this.db('ratings')
      .update({ likes: likesCount, updated_at: Date.now() })
      .where({ id: id });
  };

  setDislikesById = async (
    id: number,
    dislikesCount: number
  ): Promise<void> => {
    await this.db('ratings')
      .update({ dislikes: dislikesCount, updated_at: Date.now() })
      .where({ id: id });
  };

  getTop = async (count: number): Promise<Rating[]> => {
    const ratings = await this.db('ratings')
      .orderBy('likes', 'desc')
      .limit(count);
    return ratings;
  };
}
