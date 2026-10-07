require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");

async function migrate() {
  await connectDB();
  const db = mongoose.connection.db;
  console.log("Starting Migration to v2 Format...");

  const entries = db.collection("entries");
  const accounts = db.collection("accounts");

  // 1. Add 'slug' to accounts
  const accs = await accounts.find({ slug: { $exists: false } }).toArray();
  for (let a of accs) {
    const slug =
      a.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") || String(a._id);
    await accounts.updateOne({ _id: a._id }, { $set: { slug } });
  }

  // 2. Convert Entries (Floats -> Paise, Dates -> YYYY-MM-DD Strings)
  const allEntries = await entries.find({}).toArray();
  let updated = 0;

  for (let e of allEntries) {
    let updateDoc = { $set: {}, $unset: {} };

    // Convert amount to amountPaise
    if (e.amount !== undefined && e.amountPaise === undefined) {
      updateDoc.$set.amountPaise = Math.round(e.amount * 100);
      updateDoc.$unset.amount = 1;
    }

    // Convert date object to YYYY-MM-DD string in IST
    if (e.date instanceof Date) {
      const d = new Date(
        e.date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
      );
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      updateDoc.$set.date = `${yyyy}-${mm}-${dd}`;
    }

    // Convert legacy transfers
    if (e.transferGroupId && !e.transferId) {
      updateDoc.$set.transferId = e.transferGroupId;
      updateDoc.$set.type = "transfer";
      if (e.isOutgoing === undefined) {
        updateDoc.$set.isOutgoing = e.type === "expense";
      }
      updateDoc.$unset.transferGroupId = 1;
    }

    if (e.deletedAt === undefined) updateDoc.$set.deletedAt = null;

    if (Object.keys(updateDoc.$unset).length === 0) delete updateDoc.$unset;
    if (Object.keys(updateDoc.$set).length === 0) delete updateDoc.$set;

    if (updateDoc.$set || updateDoc.$unset) {
      await entries.updateOne({ _id: e._id }, updateDoc);
      updated++;
    }
  }

  console.log(`Migration Complete! Updated ${updated} entries.`);
  process.exit(0);
}

migrate();
