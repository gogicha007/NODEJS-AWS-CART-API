import { Injectable } from '@nestjs/common';
import { Cart, CartStatuses } from '../models';
import { PutCartPayload } from 'src/order/type';
import { Cart as CartRepo } from '../entities/cart.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { CartStatus } from '../entities/cart-status.enum';

@Injectable()
export class CartService {
  private userCarts: Record<string, Cart | null> = {};

  constructor(
    @InjectRepository(CartRepo)
    private readonly cartRepository: Repository<CartRepo>,
  ) { }

  findByUserId(userId: string): Cart | null {
    return this.userCarts[userId]
  }

  async createByUserId(userId: string): Promise<Cart> {
    const newCart = this.cartRepository.create({
      userId,
      status: CartStatus.OPEN
    })

    const savedCart = await this.cartRepository.save(newCart)

    console.log('Cart created successfully: ', savedCart)

    const cart = {
      ...savedCart,
      user_id: userId,
      created_at: +savedCart.createdAt,
      updated_at: +savedCart.updatedAt,
      status: CartStatuses.OPEN,
      items: []
    }
    this.userCarts[userId] = cart

    console.log('createByUserId userCarts', this.userCarts)

    return cart;
  }

  async findOrCreateByUserId(userId: string): Promise<Cart> {
    const userCart = this.findByUserId(userId);

    if (userCart) {
      return userCart;
    }

    return this.createByUserId(userId);
  }

  async updateByUserId(userId: string, payload: PutCartPayload): Promise<Cart | null> {
    const userCart = await this.findOrCreateByUserId(userId);

    const index = userCart?.items.findIndex(
      ({ product }) => product.id === payload.product.id,
    );

    if (index === -1) {
      userCart?.items.push(payload);
    } else if (payload.count === 0) {
      userCart?.items.splice(index, 1);
    } else {
      userCart.items[index] = payload;
    }

    console.log('updateByUserId service userCart', userCart)
    return userCart;
  }

  removeByUserId(userId: string): void {
    this.userCarts[userId] = null;
  }

  async updateStatusWithTransaction(userId: string, cartId: string, status: CartStatus, entityManager: EntityManager) {
    await entityManager.update(
      CartRepo,
      { id: cartId },
      { status: CartStatus[status] }
    )
    if (this.userCarts[userId]) {
      this.userCarts[userId].status = CartStatuses[status]
    }
    console.log('updateStatusWithTransaciton, userCarts', this.userCarts[userId])
  }
}
