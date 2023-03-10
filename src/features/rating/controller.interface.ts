import { Rating } from './model';

export interface IRatingController {
  addRating(url: string): Promise<number[]>;
  getRatingById(id: number): Promise<Rating>;
  getTop(count: number): Promise<Rating[]>;
  setLikesById(id: number, likesCount: number): Promise<void>;
  setDislikesById(id: number, dislikesCount: number): Promise<void>;
}
