// Import libraries
import { ethers } from 'ethers';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Clear screen
console.clear();

// Check if PRIVATE_KEY is set
if (!process.env.PRIVATE_KEY) {
  console.error('Error: PRIVATE_KEY is not defined in the .env file');
  process.exit(1);
}

// Node RPC Testnet Onefinity
const rpcURL = 'https://testnet-rpc.onefinity.network';

// Chain ID jaringan Onefinity Testnet
const chainId = 999987;

// Provider untuk menghubungkan ke RPC
const provider = new ethers.providers.JsonRpcProvider(rpcURL);

// Kunci pribadi pengirim dari variabel lingkungan
const privateKey = process.env.PRIVATE_KEY;
const wallet = new ethers.Wallet(privateKey, provider);

// Alamat penerima dan jumlah ONE yang akan dikirim
const toAddress = '0xcE1F83280c7ba072Da878fBEe52D603cd54843Aa'; // Ganti dengan alamat penerima
const amount = ethers.utils.parseUnits('0.6', 18);  // 0.6 ONE

// Validasi alamat penerima
if (!ethers.utils.isAddress(toAddress)) {
  console.error('Error: Alamat penerima tidak valid');
  process.exit(1);
}

// Fungsi untuk mengirim ONE
async function sendONE() {
  try {
    // Mendapatkan nonce terbaru
    const nonce = await provider.getTransactionCount(wallet.address);

    // Mendapatkan harga gas terbaru
    let gasPrice;
    try {
      gasPrice = await provider.getGasPrice();
    } catch (error) {
      console.error('Gagal mendapatkan harga gas:', error);
      return;
    }

    const tx = {
      nonce: nonce,
      to: toAddress,
      value: amount,
      chainId: chainId,
      gasLimit: ethers.utils.hexlify(400000), // Gas limit standar untuk transfer ETH
      gasPrice: gasPrice, // Gunakan harga gas terbaru
    };

    console.log(`Mengirim ${ethers.utils.formatUnits(amount, 18)} ONE ke ${toAddress}`);
    const transaction = await wallet.sendTransaction(tx);
    console.log('Transaction hash:', transaction.hash);

    // Simpan Tx hash ke file Tx.txt
    fs.appendFileSync('Tx.txt', `Transaction hash: ${transaction.hash}\n`, 'utf8');
    
    // Menunggu transaksi selesai
    const receipt = await transaction.wait();
    console.log('Transaksi berhasil dengan block hash:', receipt.blockHash);
  } catch (error) {
    // Tampilkan hanya transactionHash jika ada error hash mismatch
    if (error.transactionHash) {
      console.log('Transaction hash:', error.transactionHash);
    } else {
      console.error('Terjadi kesalahan saat mengirim transaksi:', error.message);
    }

    console.log('Mencoba mengulang pengiriman dalam 5 detik...');

    // Tunggu sebelum mencoba lagi
    await new Promise((resolve) => setTimeout(resolve, 5000));
    await sendONE(); // Ulangi pengiriman
  }
}

// Fungsi utama untuk memulai pengiriman nonstop
async function main() {
  while (true) {
    await sendONE(); // Panggil fungsi pengiriman
    await new Promise((resolve) => setTimeout(resolve, 10000)); // Tunggu 10 detik sebelum pengiriman berikutnya
  }
}

// Jalankan fungsi utama
main();
