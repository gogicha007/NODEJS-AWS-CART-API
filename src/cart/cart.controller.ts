import {
  Controller,
  Get,
  Delete,
  Put,
  Body,
  Req,
  UseGuards,
  HttpStatus,
  HttpCode,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { BasicAuthGuard } from '../auth';
import { Order, OrderService } from '../order';
import { AppRequest, getUserIdFromRequest } from '../shared';
import { calculateCartTotal } from './models-rules';
import { CartService } from './services';
import { CartItem } from './models';
import { CartStatus } from './entities/cart-status.enum';
import { CreateOrderDto, PutCartPayload } from 'src/order/type';
import { DataSource } from 'typeorm';

@Controller('api/profile/cart')
export class CartController {
  constructor(
    @Inject(CartService) private cartService: CartService,
    @Inject(OrderService) private orderService: OrderService,
    @Inject(DataSource) private readonly dataSource: DataSource
  ) { }

  // @UseGuards(JwtAuthGuard)
  @UseGuards(BasicAuthGuard)
  @Get()
  async findUserCart(@Req() req: AppRequest): Promise<CartItem[]> {
    console.log('api/profile/cart get method hit', req.user)

    const cart = await this.cartService.findOrCreateByUserId(
      getUserIdFromRequest(req) ?? '',
    );

    return cart?.items ?? [];
  }

  // @UseGuards(JwtAuthGuard)
  @UseGuards(BasicAuthGuard)
  @Put()
  async updateUserCart(
    @Req() req: AppRequest,
    @Body() body: PutCartPayload,
  ): Promise<CartItem[]> {
    // TODO: validate body payload...
    console.log('api/profile/cart put method hit', req.user)

    const cart = await this.cartService.updateByUserId(
      getUserIdFromRequest(req) ?? '',
      body,
    );

    return cart?.items ?? [];
  }

  // @UseGuards(JwtAuthGuard)
  @UseGuards(BasicAuthGuard)
  @Delete()
  @HttpCode(HttpStatus.OK)
  clearUserCart(@Req() req: AppRequest) {
    console.log('api/profile/cart delete method hit', req.user)
    this.cartService.removeByUserId(getUserIdFromRequest(req) as string);
  }

  // @UseGuards(JwtAuthGuard)
  @UseGuards(BasicAuthGuard)
  @Put('order')
  async checkout(@Req() req: AppRequest, @Body() body: CreateOrderDto) {
    console.log('api/profile/cart/order put method hit', req.user)

    const userId = getUserIdFromRequest(req) ?? '';
    const cart = this.cartService.findByUserId(userId);

    if (!(cart && cart.items.length)) {
      throw new BadRequestException('Cart is empty');
    }

    const { id: cartId, items } = cart;
    const total = calculateCartTotal(items);

    // start DB transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      const orderData = {
        userId,
        cartId,
        items: items.map(({ product, count }) => ({
          productId: product.id,
          count,
        })),
        address: body.address,
        total,

      }
      const order = await this.orderService.createWithTransaction(orderData, queryRunner.manager);

      await this.cartService.updateStatusWithTransaction(userId, cartId, CartStatus.ORDERED, queryRunner.manager)

      await queryRunner.commitTransaction()

      return { order }
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw new BadRequestException(`Checkout failed: ${error}`)
    } finally {
      await queryRunner.release()
    }
  }

  @UseGuards(BasicAuthGuard)
  @Get('order')
  getOrder(): Order[] {
    return this.orderService.getAll();
  }
}
