import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import wallet from "./dev-wallet.json";

const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));
const connection = new Connection("https://api.devnet.solana.com");
const toKeypair = Keypair.generate();

(async () => {
  const balance = await connection.getBalance(keypair.publicKey);
  console.log("Your balance is: ", balance / LAMPORTS_PER_SOL);

  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: keypair.publicKey,
      toPubkey: toKeypair.publicKey,
      lamports: balance,
    })
  );

  transaction.recentBlockhash = (
    await connection.getLatestBlockhash()
  ).blockhash;
  transaction.feePayer = keypair.publicKey;

  const fee = (await connection.getFeeForMessage(transaction.compileMessage()))
    .value;

  transaction.instructions.pop();

  if (fee != null) {
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: keypair.publicKey,
        toPubkey: toKeypair.publicKey,
        lamports: balance - fee,
      })
    );
  }

  const txSignature = await sendAndConfirmTransaction(connection, transaction, [
    keypair,
  ]);
  console.log("Transaction signature: ", txSignature);
})();
