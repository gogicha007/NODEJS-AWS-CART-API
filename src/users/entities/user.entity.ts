import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'user', schema: 'public' })
export class User {
    @PrimaryGeneratedColumn('uuid')
    id!: string

    @Column()
    name!: string

    @Column({nullable: true})
    email?: string

    @Column()
    password!: string

}