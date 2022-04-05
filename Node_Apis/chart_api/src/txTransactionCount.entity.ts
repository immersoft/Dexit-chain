import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('blockstransactions')
export class BlockTransactionEntity {
  @PrimaryGeneratedColumn()
  id!:number;

  @Column()
  count!: number;
  
  @Column()
  start!: number;

  @Column()
  currentblock!: number;
}