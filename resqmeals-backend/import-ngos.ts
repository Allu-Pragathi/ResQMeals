import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
    const csvPath = path.resolve(__dirname, '../ngo-pipeline/ngos_dataset_500.csv');
    if (!fs.existsSync(csvPath)) {
        console.error('CSV not found at:', csvPath);
        return;
    }

    const content = fs.readFileSync(csvPath, 'utf8');
    const lines = content.split('\n');
    const headers = lines[0].split(',');

    const records = [];
    for (let i = 1; i < lines.length; i++) {
        const row = lines[i].trim();
        if (!row) continue;
        
        const parts = [];
        let inQuotes = false;
        let current = '';
        for (let char of row) {
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                parts.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        parts.push(current.trim());

        if (parts.length < 9) {
            console.warn(`Skipping incomplete row ${i}: ${row}`);
            continue;
        }

        const record = {
            name: parts[0],
            address: parts[1],
            city: parts[2],
            phone: parts[3] === 'nan' ? null : parts[3] || null,
            email: parts[4] === 'nan' ? null : parts[4] || null,
            website: parts[5] === 'nan' ? null : parts[5] || null,
            latitude: parseFloat(parts[6]) || null,
            longitude: parseFloat(parts[7]) || null,
            source: parts[8]
        };
        records.push(record);
    }

    console.log(`Importing ${records.length} NGOs...`);
    
    // Batch insert
    let count = 0;
    for (const record of records) {
        try {
            await prisma.ngo.create({ data: record });
            count++;
        } catch (e) {
            console.error(`Failed to insert ${record.name}:`, e);
        }
    }
    console.log(`Successfully imported ${count} NGOs.`);
}

main().finally(() => prisma.$disconnect());
