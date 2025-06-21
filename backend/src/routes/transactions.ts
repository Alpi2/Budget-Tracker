import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { AuthRequest } from "../middleware/auth";
import Transaction from "../models/Transaction";

const router = express.Router();

// Multer ile dosya yükleme ayarları
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Tüm işlemleri listeleme
router.get("/", async (req: AuthRequest, res) => {
  try {
    const filters: any = { userId: req.user.userId };

    if (req.query.startDate && req.query.endDate) {
      filters.date = {
        $gte: new Date(req.query.startDate as string),
        $lte: new Date(req.query.endDate as string),
      };
    }

    if (req.query.category) {
      filters.category = req.query.category;
    }

    if (req.query.search) {
      filters.$or = [
        { description: { $regex: req.query.search, $options: "i" } },
        { category: { $regex: req.query.search, $options: "i" } },
      ];
    }

    const transactions = await Transaction.find(filters).sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Fehler beim Abrufen der Transaktionen." });
  }
});

// İşlem özeti
router.get("/summary", async (req: AuthRequest, res) => {
  try {
    const userId = req.user.userId;
    const transactions = await Transaction.find({ userId });

    const summary = transactions.reduce(
      (acc, transaction) => {
        if (transaction.type === "income") {
          acc.income += transaction.amount;
        } else {
          acc.expenses += transaction.amount;
        }
        return acc;
      },
      { income: 0, expenses: 0 }
    );

    const balance = summary.income - summary.expenses;

    res.json({
      income: summary.income,
      expenses: summary.expenses,
      balance: balance,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Fehler bei der Berechnung der Zusammenfassung." });
  }
});

// Yeni işlem ekleme
router.post("/", upload.single("image"), async (req: AuthRequest, res) => {
  try {
    const transaction = new Transaction({
      ...req.body,
      userId: req.user.userId,
      image: req.file ? req.file.path : undefined,
    });
    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Fehler beim Hinzufügen der Transaktion." });
  }
});

// İşlem güncelleme
router.put("/:id", upload.single("image"), async (req: AuthRequest, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaktion nicht gefunden." });
    }

    if (req.file && transaction.image) {
      fs.unlinkSync(transaction.image);
    }

    const updatedTransaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      {
        ...req.body,
        image: req.file ? req.file.path : transaction.image,
      },
      { new: true }
    );

    res.json(updatedTransaction);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Fehler beim Aktualisieren der Transaktion." });
  }
});

// İşlem silme
router.delete("/:id", async (req: AuthRequest, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaktion nicht gefunden." });
    }

    if (transaction.image) {
      fs.unlinkSync(transaction.image);
    }

    await Transaction.deleteOne({
      _id: req.params.id,
      userId: req.user.userId,
    });
    res.json({ message: "Transaktion gelöscht." });
  } catch (error) {
    res.status(500).json({ message: "Fehler beim Löschen der Transaktion." });
  }
});

export default router;
