require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Account = require("./models/Account");
const Head = require("./models/Head");

const seedData = async () => {
  await connectDB();

  try {
    const defaultAccounts = [
      { name: "Abhishek", slug: "abhishek" },
      { name: "Father", slug: "father" },
      { name: "Brother", slug: "brother" },
    ];
    for (const account of defaultAccounts) {
      await Account.updateOne(
        { slug: account.slug },
        { $setOnInsert: account },
        { upsert: true },
      );
    }
    console.log("Default accounts available");

    const headCount = await Head.countDocuments();
    if (headCount === 0) {
      const accounts = await Account.find();
      const defaultHeads = [
        { name: "Salary", type: "income" },
        { name: "Business", type: "income" },
        { name: "Freelance", type: "income" },
        { name: "Investment", type: "income" },
        { name: "Other", type: "income" },
        { name: "Food", type: "expense" },
        { name: "Travel", type: "expense" },
        { name: "Bills", type: "expense" },
        { name: "Shopping", type: "expense" },
        { name: "Rent", type: "expense" },
        { name: "Medical", type: "expense" },
        { name: "Entertainment", type: "expense" },
        { name: "Education", type: "expense" },
        { name: "Other", type: "expense" },
      ];
      await Head.insertMany(
        accounts.flatMap((account) =>
          defaultHeads.map((head) => ({ ...head, account: account._id })),
        ),
      );
      console.log("Default heads created");
    } else {
      console.log("Heads already exist, skipping");
    }

    console.log("Seed completed!");
    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
};

seedData();
