import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router(); // Express router nesnesi oluştur
const JWT_SECRET = process.env.JWT_SECRET as string; // JWT için gizli anahtar (secret) ortam değişkeninden al
const TOKEN_EXPIRATION = process.env.TOKEN_EXPIRATION; // Token süresi

// Kullanıcı kaydı (register) route'u
router.post("/register", async (req, res) => {
  try {
    // Kullanıcıdan alınan veriler (isim, e-posta, şifre)
    const { name, email, password } = req.body;

    // Eğer isim, e-posta veya şifre verilmediyse, hata döndürülür
    if (!name || !email || !password) {
      return res
        .status(400) // 400 - Bad Request
        .json({ message: "Alle Felder sind erforderlich." });
    }

    // Aynı e-posta ile kayıtlı kullanıcı var mı ? yok mu ?
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "Benutzer existiert bereits." }); // Kullanıcı mevcut
    }

    // Şifreyi güvenli hale getirmek için hash'leme işlemi yap
    const salt = await bcrypt.genSalt(10); // 10 turda
    const hashedPassword = await bcrypt.hash(password, salt); // Şifre hash

    // Yeni kullanıcı nesnesi oluştur

    user = new User({
      name,
      email,
      password: hashedPassword, // Şifre hash'lenmiş olarak kaydet
    });

    // Yeni kullanıcı veritabanına kaydet
    await user.save();

    // Kullanıcı kaydedildikten sonra JWT token oluştur
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: TOKEN_EXPIRATION, // Token süresini al
    });

    // Başarıyla kaydedilen kullanıcı ve token döndüsü
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email }, // Kullanıcı bilgileri
    });
  } catch (error) {
    // Hata durumu
    console.error("Registrierungsfehler:", error); // Hata mesajı
    res.status(500).json({ message: "Serverfehler." }); // Sunucu hatası
  }
});

// Kullanıcı girişi (login) route'u
router.post("/login", async (req, res) => {
  try {
    // Kullanıcıdan alınan e-posta ve şifre
    const { email, password } = req.body;

    // E-posta veya şifre verilmediyse hata göster
    if (!email || !password) {
      return res
        .status(400) // 400 - Bad Request
        .json({ message: "E-Mail und Passwort sind erforderlich." }); // E-posta ve şifre
    }

    // E-posta ile kullanıcıyi veritabanında ara
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401) // 401 - Unauthorized
        .json({ message: "E-Mail-Adresse nicht gefunden." }); // E-posta adresi bulunamadı
    }

    // Şifre doğrulama işlemi yapılır
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401) // 401 - Unauthorized
        .json({ message: "Falsches Passwort." }); // Yanlış şifre
    }

    // Şifre doğruysa JWT token oluşturulur
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: TOKEN_EXPIRATION, // Token süresini al
    });

    // Başarıyla giriş yapan kullanıcı ve token
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email }, // Kullanıcı bilgileri
    });
  } catch (error) {
    // Hata durumu
    console.error("Fehler beim Login:", error); // Hata mesajı
    res.status(500).json({ message: "Serverfehler." });
  }
});

// Token doğrulama (validate) route'u
router.get("/validate", async (req, res) => {
  try {
    // Authorization başlığından token al
    const token = req.header("Authorization")?.replace("Bearer ", "");

    // Eğer token yoksa hata ver
    if (!token) {
      return res.status(401).json({ message: "Kein Token bereitgestellt." });
    }

    // Token doğrulama
    const decoded = jwt.verify(token, JWT_SECRET); // JWT token doğrulama işlemi
    const user = await User.findById((decoded as jwt.JwtPayload).userId); // Token'dan kullanıcı ID'si al

    // Eğer kullanıcı bulunamazsa hata ver
    if (!user) {
      return res.status(401).json({ message: "Ungültiges Token." });
    }

    // Eğer token geçerliyse, kullanıcı bilgileri
    res.json({ message: "Token ist gültig.", user });
  } catch (error) {
    // Hata durumu
    console.error("Fehler bei der Token-Validierung:", error);
    res.status(401).json({ message: "Ungültiges Token." });
  }
});

export default router; // Router dışa aktarılır
