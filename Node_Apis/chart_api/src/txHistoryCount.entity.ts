import { Column, Entity, PrimaryGeneratedColumn,CreateDateColumn,UpdateDateColumn } from "typeorm";

@Entity('validatorsInfo')
export class TransactionEntity {
  @PrimaryGeneratedColumn()
  id!:number;
  
  @Column()
  Name!: String;

  @Column()
  Website!: String;

  @Column()
  Description!: String;

  @Column()
  Address!: String;


    

}
 