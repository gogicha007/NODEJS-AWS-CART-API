import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm'
import { CartItem } from './cart-items.entity'
import { CartStatus } from './cart-status.enum'

@Entity({ name: 'cart', schema: "public" })
export class Cart {
    @PrimaryGeneratedColumn('uuid')
    id!: string

    @Column()
    userId!: string

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt!: Date

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updatedAt!: Date

    @Column({
        type: 'enum',
        enum: CartStatus,
        enumName: 'cart_status'
    })
    status!: CartStatus
    
    @OneToMany(() => CartItem, (cartItem) => cartItem.cart)
    items!: CartItem[]
}