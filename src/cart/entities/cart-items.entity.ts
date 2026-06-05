import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Cart } from './cart.entity'

@Entity({ name: 'cart_items', schema: 'public' })
export class CartItem {
    @PrimaryColumn({ name: 'cart_id', type: 'uuid' })
    cartId!: string

    @PrimaryColumn({ name: 'product_id', type: 'uuid' })
    productId!: string;

    @Column({ type: 'integer', default: 1 })
    count!: number

    @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'cart_id' })
    cart!: Cart
}