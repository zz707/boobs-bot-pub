import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import knex, { Knex } from 'knex';
import { sqlite3 } from 'sqlite3';
import { TYPES } from '@app/types';
import { IConfigService } from '@app/services';
import { IDatabaseService } from './database.interface';

@injectable()
export class DatabaseService implements IDatabaseService {
  private knex;

  constructor (
    @inject(TYPES.IConfigService) private readonly configService: IConfigService
  ) {
    const config: Knex.Config<sqlite3> = {
      client: 'sqlite3',
      connection: {
        filename: configService.get('SQLITE_PATH'),
      },
      useNullAsDefault: true,
    };

    const knexInstance = knex(config);
    this.knex = knexInstance;
  }

  public get() {
    return this.knex;
  }
}
