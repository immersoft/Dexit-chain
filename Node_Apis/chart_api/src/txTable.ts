import { Column, Entity, PrimaryGeneratedColumn,CreateDateColumn,UpdateDateColumn } from "typeorm";

@Entity('graphp')
export class TransactionTableCounter {
  @PrimaryGeneratedColumn()
  id!:number;
  
  @Column()
  totalcount!: number;


  @CreateDateColumn()
created_at:Date;
    
}
 