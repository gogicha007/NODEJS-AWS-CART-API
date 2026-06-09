import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Order } from '../models';
import { Order as OrderRepo } from '../entities/order.entity';
import { CreateOrderPayload, OrderStatus } from '../type';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class OrderService {
  private orders: Record<string, Order> = {};

  constructor(
    @InjectRepository(OrderRepo)
    private readonly orderRepository: Repository<OrderRepo>
  ) { }

  getAll() {
    return Object.values(this.orders);
  }

  findById(orderId: string): Order {
    return this.orders[orderId];
  }

  create(data: CreateOrderPayload) {
    console.log('orderService, data', data)
    const id = randomUUID() as string;
    const order: Order = {
      id,
      ...data,
      statusHistory: [
        {
          comment: '',
          status: OrderStatus.Open,
          timestamp: Date.now(),
        },
      ],
    };

    this.orders[id] = order;

    return order;
  }

  // TODO add  type
  update(orderId: string, data: Order) {
    const order = this.findById(orderId);

    if (!order) {
      throw new Error('Order does not exist.');
    }

    this.orders[orderId] = {
      ...data,
      id: orderId,
    };
  }
}
