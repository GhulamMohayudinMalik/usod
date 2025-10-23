/**
 * Enroll Admin Identity
 * 
 * This script creates an admin identity in the wallet for the backend
 * to interact with the Hyperledger Fabric blockchain.
 */

import { Wallets } from 'fabric-network';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    try {
        console.log('🔐 Starting admin enrollment...\n');

        // Paths
        const walletPath = path.join(__dirname, '../../../blockchain/wallets');
        const credPath = path.join(
            __dirname,
            '../../../blockchain/hyperledger/network/crypto-config/peerOrganizations/org1.usod.com/users/Admin@org1.usod.com/msp'
        );

        // Check if crypto materials exist
        if (!fs.existsSync(credPath)) {
            throw new Error(`Crypto materials not found at: ${credPath}\nPlease start the blockchain network first.`);
        }

        // Create wallet directory if it doesn't exist
        if (!fs.existsSync(walletPath)) {
            fs.mkdirSync(walletPath, { recursive: true });
            console.log(`✅ Created wallet directory: ${walletPath}`);
        }

        // Create wallet instance
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`✅ Wallet initialized at: ${walletPath}`);

        // Check if admin already exists
        const adminIdentity = await wallet.get('admin');
        if (adminIdentity) {
            console.log('⚠️  Admin identity already exists in wallet');
            return;
        }

        // Read certificate and private key
        const certPath = path.join(credPath, 'signcerts');
        const keyPath = path.join(credPath, 'keystore');

        const certFiles = fs.readdirSync(certPath);
        const keyFiles = fs.readdirSync(keyPath);

        if (certFiles.length === 0 || keyFiles.length === 0) {
            throw new Error('Certificate or private key not found');
        }

        const certificate = fs.readFileSync(path.join(certPath, certFiles[0]), 'utf8');
        const privateKey = fs.readFileSync(path.join(keyPath, keyFiles[0]), 'utf8');

        console.log(`✅ Read certificate: ${certFiles[0]}`);
        console.log(`✅ Read private key: ${keyFiles[0]}`);

        // Create identity object
        const identity = {
            credentials: {
                certificate: certificate,
                privateKey: privateKey,
            },
            mspId: 'USODOrgMSP',
            type: 'X.509',
        };

        // Import identity to wallet
        await wallet.put('admin', identity);

        console.log('\n🎉 Successfully enrolled admin user and imported to wallet');
        console.log('   Identity: admin');
        console.log('   MSP ID: USODOrgMSP');
        console.log(`   Wallet: ${walletPath}`);

    } catch (error) {
        console.error(`\n❌ Failed to enroll admin: ${error.message}`);
        console.error(error.stack);
        process.exit(1);
    }
}

main();

