import mongoose, { Schema, type Document } from "mongoose";

export interface ITransaction extends Document {
  date: Date; // İşlem tarihi
  amount: number; // İşlem tutarı
  description: string; // İşlem açıklaması
  category: string; // İşlem kategorisi
  type: "income" | "expense"; // İşlem türü: gelir (income) veya gider (expense)
  userId: mongoose.Types.ObjectId; // Kullanıcı kimliği (Bu işlemle ilişkili kullanıcı)
  createdAt: Date; // İşlemin oluşturulma tarihi
  image?: string; // (Opsiyonel) İşlemle ilişkilendirilmiş bir görsel
}

// Transaction şeması tanımlanıyor
const TransactionSchema: Schema = new Schema({
  date: {
    type: Date, // Tarih, Date türünde olmalı
    required: true, // Tarih zorunlu
  },
  amount: {
    type: Number, // Tutar, Number türünde olmalı
    required: true, // Tutar zorunlu
  },
  description: {
    type: String, // Açıklama, String türünde olmalı
    required: true, // Açıklama zorunlu
  },
  category: {
    type: String, // Kategori, String türünde olmalı
    required: true, // Kategori zorunlu
  },
  type: {
    type: String, // İşlem türü, String türünde olmalı
    enum: ["income", "expense"], // Bu alan sadece "income" veya "expense" olabilir
    required: true, // İşlem türü zorunlu
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId, // userId, MongoDB ObjectId türünde olmalı
    ref: "User", // "User" modeline referans eder
    required: true, // userId zorunlu
  },
  createdAt: {
    type: Date, // Oluşturulma tarihi, Date türünde olmalı
    default: Date.now, // Varsayılan olarak şu anki tarih
  },
  image: {
    type: String, // Görsel, String türünde olmalı (isteğe bağlı)
  },
});

// Transaction modelini oluşturup dışa aktarıyoruz
// Bu model, "Transaction" adında MongoDB koleksiyonu için kullanılacak
export default mongoose.model<ITransaction>("Transaction", TransactionSchema);
