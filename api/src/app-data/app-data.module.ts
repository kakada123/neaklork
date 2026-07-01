import { Module } from '@nestjs/common';
import { AppDataController } from './app-data.controller';
import { AppDataService } from './app-data.service';
import { OrdersModule } from '../orders/orders.module';
import { ShopsModule } from '../shops/shops.module';

@Module({
  imports: [OrdersModule, ShopsModule],
  controllers: [AppDataController],
  providers: [AppDataService],
})
export class AppDataModule {}
