import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { OrderStatus } from "../type";


@Entity({ name: 'order', schema: 'public' })
export class Order {
    @PrimaryGeneratedColumn('uuid')
    id!: string

    @Column({ name: 'user_id', type: 'uuid' })
    userId!: string

    @Column({ name: 'cart_id', type: 'uuid' })
    cartId!: string

    @Column({ type: "jsonb" })
    payment!: JSON

    @Column({ type: 'jsonb' })
    delivery!: JSON

    @Column({ type: 'text' })
    comments!: string

    @Column({ type: 'enum', enum: OrderStatus, enumName: 'order_status_enum' })
    status!: OrderStatus

    @Column({ type: 'integer' })
    total!: number
}