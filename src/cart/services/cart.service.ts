import { Injectable } from '@nestjs/common';
// import { randomUUID } from 'node:crypto';
import { Cart, CartStatuses } from '../models';
import { PutCartPayload } from 'src/order/type';
import { Cart as CartRepo } from '../entities/cart.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartStatus } from '../entities/cart-status.enum';
import { CartWithItemsResponseDto } from '../dto/response-cart-with-items.dto';

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
    private readonly cartRepository: Repository<CartRepo>,

  ) { }

  async findByUserId(userId: string): Promise<CartWithItemsResponseDto | null> {
    console.log('find by user id ', userId)
    const cart = await this.cartRepository.findOne({
      where: { userId: userId },
      select: { id: true, userId: true, status: true }
    })
    // return this.userCarts[userId];

    if (!cart) return null

    const cartWithItems = { ...cart, items: [] }

    return cartWithItems
  }

  async createByUserId(userId: string): Promise<CartWithItemsResponseDto> {
    // const timestamp = Date.now();

    // const userCart = {
    //   id: randomUUID(),
    //   userId,
    //   created_at: timestamp,
    //   updated_at: timestamp,
    //   status: CartStatuses.OPEN,
    //   items: [],
    // };

    // this.userCarts[user_id] = userCart;

    const newCart = this.cartRepository.create({
      userId,
      status: CartStatus.OPEN
    })


    const savedCart = await this.cartRepository.save(newCart)

    console.log('Cart created successfully: ', savedCart)

    const cart = { ...savedCart, items: [] }

    return cart;
  }

  async findOrCreateByUserId(userId: string): Promise<CartWithItemsResponseDto | null> {
    const userCart = await this.findByUserId(userId);

    if (userCart) {
      return userCart;
    }

    return this.createByUserId(userId);
  }

  checkout(userId: string) {
    console.log('checkout for userId: ', userId)
  }

  async updateByUserId(userId: string, payload: PutCartPayload): Promise<CartWithItemsResponseDto | null> {
    const userCart = await this.findOrCreateByUserId(userId);

    if (!userCart) return null

    const index = userCart?.items.findIndex(
      ({ product }) => product.id === payload.product.id,
    );

    if (!index) return userCart

    if (index === -1) {
      userCart?.items.push(payload);
    } else if (payload.count === 0) {
      userCart?.items.splice(index, 1);
    } else {
      userCart.items[index] = payload;
    }

    return userCart;
  }

  removeByUserId(userId: string): void {
    this.userCarts[userId] = null;
  }
}
