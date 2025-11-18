const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
  let connection;
  
  try {
    console.log('🚀 Starting database setup...\n');

    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });

    console.log('✅ Connected to MySQL server');

    const dbName = process.env.DB_NAME || 'vendify_erp';
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`✅ Database '${dbName}' created/verified`);

    await connection.query(`USE \`${dbName}\``);

    const schemaPath = path.join(__dirname, '../database/schema.sql');
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found: ${schemaPath}`);
    }

    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    let schemaWithDb = schema.replace(/USE\s+[\w`]+;?/gi, `USE \`${dbName}\`;`);
    schemaWithDb = schemaWithDb.replace(/CREATE DATABASE[^;]+;/gi, '');
    
    const withoutComments = schemaWithDb
      .split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n');
    
    const statements = withoutComments
      .split(';')
      .map(s => s.trim().replace(/\n+/g, ' '))
      .filter(s => s.length > 0 && !s.toLowerCase().startsWith('create database'));

    console.log('📝 Executing schema...');
    let schemaSuccessCount = 0;
    let schemaErrorCount = 0;
    
    for (const statement of statements) {
      if (statement) {
        try {
          await connection.query(statement);
          schemaSuccessCount++;
        } catch (err) {
          if (!err.message.includes('already exists') && 
              !err.message.includes('Duplicate') &&
              !err.message.includes('Table') && 
              !err.message.includes('already exists')) {
            console.warn(`⚠️  Warning executing statement: ${err.message.substring(0, 100)}`);
            schemaErrorCount++;
          }
        }
      }
    }

    const [tables] = await connection.query('SHOW TABLES');
    const tableCount = tables.length;
    
    if (tableCount > 0) {
      console.log(`✅ Schema executed successfully (${tableCount} tables created)\n`);
    } else {
      console.warn(`⚠️  Schema executed but no tables found. Check for errors above.\n`);
    }

    if (process.argv.includes('--seed')) {
      await connection.query(`USE \`${dbName}\``);
      
      const [tables] = await connection.query('SHOW TABLES');
      if (tables.length === 0) {
        console.warn('⚠️  No tables found. Skipping seed. Run setup again.\n');
      } else {
        console.log('🌱 Seeding database...');
        const seedPath = path.join(__dirname, '../database/seed.sql');
        if (fs.existsSync(seedPath)) {
          const seed = fs.readFileSync(seedPath, 'utf8');
          
          const withoutComments = seed
            .split('\n')
            .filter(line => !line.trim().startsWith('--'))
            .join('\n');
          
          const statements = withoutComments
            .split(';')
            .map(s => s.trim().replace(/\n+/g, ' '))
            .filter(s => {
              return s.length > 0 && 
                     !s.toLowerCase().startsWith('use ') &&
                     !s.toLowerCase().includes('const ') &&
                     !s.toLowerCase().includes('require(') &&
                     !s.toLowerCase().includes('await ');
            });

        let successCount = 0;
        let errorCount = 0;
      
        for (const statement of statements) {
          if (statement) {
            try {
              await connection.query(statement);
              successCount++;
            } catch (err) {
              if (!err.message.includes('Duplicate entry') && 
                  !err.message.includes('already exists') &&
                  !err.message.includes('Illegal mix of collations')) {
                console.warn(`⚠️  Warning seeding: ${err.message.substring(0, 100)}`);
                errorCount++;
              }
            }
          }
        }
        
          if (errorCount === 0) {
            console.log(`✅ Database seeded successfully (${successCount} statements executed)\n`);
          } else {
            console.log(`⚠️  Database seeded with ${errorCount} warnings (${successCount} statements succeeded)\n`);
          }
        }
      }
    }

    console.log('🎉 Database setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Create an admin user: npm run create-admin <email> <password> <company_uuid> <name>');
    console.log('   2. Start the server: npm run dev\n');

  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    console.error('\n💡 Make sure:');
    console.error('   - MySQL is running');
    console.error('   - Database credentials in .env are correct');
    console.error('   - You have permission to create databases\n');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDatabase();

