import { Rating } from '@app/features/likes/like.model';

declare module 'knex/types/tables' {
  interface Tables {
    ratings: Rating;
  }
}
