import {
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';

import { PaymentEntity } from './payment.entity';

class Address {
  @Column({ name: 'zip_code' })
  zipCode: string;

  @Column({ name: 'street_name' })
  streetName: string;

  @Column({ name: 'street_number' })
  streetNumber: string;

  @Column({ name: 'address_complement' })
  addressComplement?: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column()
  country: string;
}

@Entity({ name: 'associates' })
export class AssociateEntity {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ type: 'varchar', name: 'association_record' })
  associationRecord: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', name: 'phone_number' })
  phoneNumber: string;

  @Column(() => Address, { prefix: '' })
  address: Address;

  @Column({ type: 'varchar' })
  type: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => PaymentEntity, (payment) => payment.associate)
  payments?: PaymentEntity[];
}
