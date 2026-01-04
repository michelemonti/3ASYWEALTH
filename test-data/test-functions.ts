/**
 * Test script for import/export functions
 * Run with: npx tsx test-data/test-functions.ts
 */

import { parseCSV, parseJSON, assetsToCSV } from '../src/lib/importExport'
import * as fs from 'fs'
import * as path from 'path'

const testDir = path.dirname(new URL(import.meta.url).pathname)

console.log('🧪 Testing Import/Export Functions\n')
console.log('='.repeat(50))

// Test 1: CSV Import
console.log('\n📄 Test 1: CSV Import')
const csvContent = fs.readFileSync(path.join(testDir, 'test-import.csv'), 'utf-8')
console.log('Input CSV:')
console.log(csvContent)
console.log('\nParsed Assets:')
const csvAssets = parseCSV(csvContent)
console.log(JSON.stringify(csvAssets, null, 2))
console.log(`✅ Parsed ${csvAssets.length} assets from CSV`)

// Test 2: JSON Import
console.log('\n' + '='.repeat(50))
console.log('\n📄 Test 2: JSON Import')
const jsonContent = fs.readFileSync(path.join(testDir, 'test-import.json'), 'utf-8')
const jsonAssets = parseJSON(jsonContent)
console.log(`✅ Parsed ${jsonAssets.length} assets from JSON`)
jsonAssets.forEach(a => console.log(`  - ${a.name}: €${a.value.toLocaleString()}`))

// Test 3: CSV Export
console.log('\n' + '='.repeat(50))
console.log('\n📄 Test 3: CSV Export')
const exportedCSV = assetsToCSV(csvAssets)
console.log('Exported CSV:')
console.log(exportedCSV)

// Test 4: Round-trip test
console.log('\n' + '='.repeat(50))
console.log('\n📄 Test 4: Round-trip (Export → Import)')
const reimportedAssets = parseCSV(exportedCSV)
console.log(`✅ Re-imported ${reimportedAssets.length} assets`)

// Verify data integrity
const originalTotal = csvAssets.reduce((sum, a) => sum + a.value, 0)
const reimportedTotal = reimportedAssets.reduce((sum, a) => sum + a.value, 0)
console.log(`Original total: €${originalTotal.toLocaleString()}`)
console.log(`Reimported total: €${reimportedTotal.toLocaleString()}`)

if (originalTotal === reimportedTotal) {
  console.log('✅ Values match!')
} else {
  console.log('❌ Values mismatch!')
}

// Test 5: Edge cases
console.log('\n' + '='.repeat(50))
console.log('\n📄 Test 5: Edge Cases')

// Empty CSV
const emptyCSV = parseCSV('')
console.log(`Empty CSV: ${emptyCSV.length} assets (expected: 0) ${emptyCSV.length === 0 ? '✅' : '❌'}`)

// CSV with only header
const headerOnlyCSV = parseCSV('Name,Ownership,Value,Source,Notes,Category')
console.log(`Header-only CSV: ${headerOnlyCSV.length} assets (expected: 0) ${headerOnlyCSV.length === 0 ? '✅' : '❌'}`)

// CSV with special characters
const specialCSV = `Name,Ownership,Value,Source,Notes,Category
"Test ""Quoted"" Asset",100%,1000,Test,Has quotes,cash`
const specialAssets = parseCSV(specialCSV)
console.log(`Special chars CSV: ${specialAssets.length} assets (expected: 1) ${specialAssets.length === 1 ? '✅' : '❌'}`)
if (specialAssets[0]) {
  console.log(`  Name: "${specialAssets[0].name}"`)
}

console.log('\n' + '='.repeat(50))
console.log('\n✅ All tests completed!')
