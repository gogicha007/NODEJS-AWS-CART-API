import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Cart, CartStatuses } from '../models';
import { PutCartPayload } from 'src/order/type';
import { Cart as CartRepo } from '../entities/cart.entity';
import { CartItem as CartItemsRepo } from '../entities/cart-items.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

const mockData = {
  "a": {
    id: '1234',
    user_id: "a",
    created_at: Date.now(),
    updated_at: Date.now(),
    status: CartStatuses.OPEN,
    items: [
      { product: { id: 'prod', title: 'car', description: 'descr', price: 122 }, count: 2 }
    ]
  }
}

@Injectable()
export class CartService {
  private userCarts: Record<string, Cart | null> = mockData;

  constructor(
    @InjectRepository(CartRepo)
    private readonly cartRepository: Repository<Cart>,

    @InjectRepository(CartItemsRepo)
    private readonly cartItemsRepository: Repository<CartItemsRepo>
  ) { }

  async findByUserId(userId: string): Promise<Cart | null> {
    console.log('find by user id ', userId)
    const cart = await this.cartRepository.findOne({
      where: { userId: userId }
    })
    // return this.userCarts[userId];
    if (!cart) return null

    return cart
  }

  createByUserId(user_id: string): CartRepo {
    const timestamp = Date.now();

    const userCart = {
      id: randomUUID(),
      user_id,
      // created_at: timestamp,
      // updated_at: timestamp,
      status: CartStatuses.OPEN,
      items: [],
    };

    this.userCarts[user_id] = userCart;

    return userCart;
  }

  async findOrCreateByUserId(userId: string): Promise<CartRepo | null> {
    const userCart = await this.findByUserId(userId);

    if (userCart) {
      return userCart;
    }

    return this.createByUserId(userId);
  }

  updateByUserId(userId: string, payload: PutCartPayload): Cart {
    const userCart = this.findOrCreateByUserId(userId);

    const index = userCart.items.findIndex(
      ({ product }) => product.id === payload.product.id,
    );

    if (index === -1) {
      userCart.items.push(payload);
    } else if (payload.count === 0) {
      userCart.items.splice(index, 1);
    } else {
      userCart.items[index] = payload;
    }

    return userCart;
  }

  removeByUserId(userId: string): void {
    this.userCarts[userId] = null;
  }
}
