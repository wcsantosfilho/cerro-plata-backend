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

  @Column({ type: 'varchar', name: 'cpf' })
  cpf: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', name: 'phone_number' })
  phoneNumber: string;

  @Column({ type: 'varchar', name: 'emergency_phone_number' })
  emergencyPhoneNumber: string;

  @Column(() => Address, { prefix: '' })
  address: Address;

  @Column({ type: 'varchar' })
  type: string;

  @Column({ type: 'varchar' })
  category: string;

  @Column({ type: 'varchar', name: 'payment_plan' })
  paymentPlan: string;

  @Column({ type: 'varchar', name: 'blood_type' })
  bloodType: string;

  @Column({ type: 'date', name: 'birth_date' })
  birthDate: Date;

  @Column({ type: 'date', name: 'association_date' })
  associationDate: Date;

  @Column({ type: 'varchar', name: 'fepam_registration_number' })
  fepamRegistrationNumber: string;

  @Column({ type: 'date', name: 'fepam_due_date' })
  fepamDueDate: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => PaymentEntity, (payment) => payment.associate)
  payments?: PaymentEntity[];
}
