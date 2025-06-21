import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import authRoutes from "./routes/auth";
import transactionRoutes from "./routes/transactions";
import { auth } from "./middleware/auth";

const app = express();

app.use(cors());

app.use(express.json());

// 'uploads' klasörünü statik dosya servisi olarak
// Bu, yüklenen dosyaların dışarıya erişilebilir olmasını sağlıyor

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Bu route'lar herkese açık, yani kullanıcıların giriş yapmadan erişebileceği route
app.use("/api/auth", authRoutes);

// Bu route'lar, JWT doğrulaması gerektiriyor ve yalnızca kimlik doğrulaması yapılmış kullanıcılar erişebilecek
app.use("/api/transactions", auth, transactionRoutes); // auth middleware'i ile korunan route

// MongoDB bağlantısını sağlayan fonksiyon
const connectDB = async () => {
  try {
    // MongoDB URI'si, ortam değişkeninden alınır, yoksa varsayılan localhost URI'si kullan
    const mongoURI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/budget-tracker";
    // Mongoose ile MongoDB'ye bağlanıyoruz
    await mongoose.connect(mongoURI);
    console.log("MongoDB connected"); // Bağlantı durumu
  } catch (err) {
    console.error("MongoDB connection error:", err); // Eğer bağlantı hatası olursa
    process.exit(1); // Hata durumunda uygulamayı sonlandır
  }
};

// MongoDB bağlantısını
connectDB();

// Uygulamanın çalışacağı port
const PORT = process.env.PORT || 5000; // Ortam değişkeninde PORT varsa onu al, yoksa 5000 kullan
// Sunucu başlatılıyor
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`); // Sunucu başarılı bir şekilde çalışmaya başladığında portu yazdır
});
