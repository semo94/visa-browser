import { DataSource } from 'typeorm';
import { Product } from '../app/modules/products/entities/product.entity';
import { readFile } from 'fs/promises';
import { parse } from 'csv-parse/sync';
import { config } from 'dotenv';
import * as path from 'path';
import { LoggerService } from '../app/common/services/logger.service';

// Load environment variables
config();

// Create a dedicated logger for the CSV import script
const logger = new LoggerService(null, 'CSV-Import');

// Define the new DataSource instance
const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'sherpa_visa',
  entities: [Product],
  synchronize: true,
});

interface CsvRow {
  country: string;
  visaType: string;
  price: string;
  lengthOfStay: string;
  entryType: string;
  filingFee: string;
}

// Helper function to normalize record keys
function normalizeRecordKeys(record: unknown) {
  const normalizedRecord = {};

  Object.keys(record).forEach(key => {
    // Create a clean version of the key by removing any invisible characters
    const normalizedKey = key.trim().replace(/[\uFEFF\u200B]/g, '');
    normalizedRecord[normalizedKey] = record[key];
  });

  return normalizedRecord;
}

async function importCsv(filePath: string): Promise<void> {
  try {
    logger.log(`Starting import from CSV file`, { filePath });

    // Ensure the connection is initialized
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    // Get repository
    const productRepository = AppDataSource.getRepository(Product);

    // Read the CSV file
    const fileContent = await readFile(filePath, 'utf-8');

    // Parse the CSV content
    const records: CsvRow[] = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    logger.log(`Found records in CSV file`, { count: records.length });

    // Process each record
    let processedCount = 0;
    let errorCount = 0;

    for (const [index, rawRecord] of records.entries()) {
      try {
        // Normalize the record keys to handle encoding issues
        const record = normalizeRecordKeys(rawRecord);

        logger.debug(`Processing record ${index + 1}/${records.length}`, {
          country: record['country'],
          visaType: record['visaType'],
        });

        // Create product from CSV data
        const product = productRepository.create({
          country: record['country'],
          visaType: record['visaType'],
          price: parseFloat(record['price']),
          lengthOfStay: parseInt(record['lengthOfStay'], 10),
          entryType: record['entryType'],
          filingFee: parseFloat(record['filingFee']),
        });

        await productRepository.save(product);
        processedCount++;

        logger.debug(`Imported product successfully`, {
          country: product.country,
          visaType: product.visaType,
          price: product.price,
        });
      } catch (error) {
        errorCount++;
        logger.error(`Error processing record ${index + 1}`, error, {
          record: JSON.stringify(rawRecord),
        });
      }
    }

    logger.log(`Import statistics`, {
      total: records.length,
      successful: processedCount,
      failed: errorCount,
    });
  } catch (error) {
    logger.error(`Error importing CSV`, error);
    throw error;
  }
}

async function main() {
  try {
    // Get the CSV file path from arguments or environment variable
    const csvFilePath =
      process.argv[2] ||
      path.resolve(__dirname, './dummy.products.csv');

    logger.log(`Starting import process`, { csvFilePath });

    // Initialize database connection
    await AppDataSource.initialize();
    logger.log('Database connection established');

    // Run the import
    await importCsv(csvFilePath);

    logger.log('CSV import completed successfully');
  } catch (error) {
    logger.error('Import failed', error);
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      logger.log('Database connection closed');
    }
  }
}

// Run the script
main();