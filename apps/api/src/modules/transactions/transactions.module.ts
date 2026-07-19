import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { TransactionsRepository, TRANSACTION_REPOSITORY } from './transactions.repository';

@Module({
  controllers: [TransactionsController],
  providers: [
    TransactionsService,
    { provide: TRANSACTION_REPOSITORY, useClass: TransactionsRepository },
  ],
  exports: [TransactionsService],
})
export class TransactionsModule {}
