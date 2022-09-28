import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity('SwapTableData')
export class SwapTable {

  @Column()
  from!: String;

  @Column()
  amount!: string;

  @Column()
  exc_rate!: number;

  @PrimaryColumn()
  transactionHash!: String;

  @Column()
  network!: String;

  @Column()
  tx_status!: String;  

}
 