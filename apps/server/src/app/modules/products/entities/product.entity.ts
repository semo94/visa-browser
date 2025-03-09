import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('products')
export class Product {
  @ApiProperty({ description: 'Unique identifier for the product' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Country name' })
  @Column()
  @Index()
  country: string;

  @ApiProperty({ description: 'Visa type name' })
  @Column({ name: 'visa_type' })
  @Index()
  visaType: string;

  @ApiProperty({ description: 'Price of the visa in USD' })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @Index()
  price: number;

  @ApiProperty({ description: 'Length of stay in days' })
  @Column({ name: 'length_of_stay' })
  @Index()
  lengthOfStay: number;

  @ApiProperty({ description: 'Type of entry (e.g., Single, Multiple)' })
  @Column({ name: 'entry_type' })
  @Index()
  entryType: string;

  @ApiProperty({ description: 'Filing fee in USD' })
  @Column({ name: 'filing_fee', type: 'decimal', precision: 10, scale: 2 })
  filingFee: number;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}