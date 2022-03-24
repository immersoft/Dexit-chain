import { Column, Entity, PrimaryGeneratedColumn,CreateDateColumn,UpdateDateColumn } from "typeorm";

@Entity('times')
export class TransactionTable {
  @PrimaryGeneratedColumn()
  id!:number;
  
  @Column()
  totalcount!: number;


  @CreateDateColumn()
created_at:Date;
    

}
 