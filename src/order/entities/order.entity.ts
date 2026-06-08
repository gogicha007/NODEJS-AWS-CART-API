import { Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity({name: 'order', schema: 'public'})
export class Order {
    @PrimaryGeneratedColumn('uuid')
    id!: string
}