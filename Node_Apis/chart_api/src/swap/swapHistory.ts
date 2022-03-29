import { Column, Entity, PrimaryGeneratedColumn,CreateDateColumn,UpdateDateColumn } from "typeorm";

@Entity('swap')
export class SwapTable {
  @PrimaryGeneratedColumn()
  id!:number;
  
  @Column()
  amount!: number;

  @Column()
  reciever!: string;

  @Column()
  exc_rate!: number;

  @Column()
  txn_hash!: string;


  @CreateDateColumn()
    created_at:Date;
    

}
 