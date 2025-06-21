import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

// IUser arayüzü (interface), MongoDB'deki kullanıcı modelinin şeklini tanımla
// 'Document' MongoDB dokümanlarının temel özelliklerini al

export interface IUser extends Document {
  email: string; // Kullanıcının e-posta adresi
  password: string; // Kullanıcının şifresi
  name: string; // Kullanıcının adı
  comparePassword(candidatePassword: string): Promise<boolean>; // Şifre doğrulama metodu
}

// Kullanıcı şeması (UserSchema) tanımla
const UserSchema: Schema = new Schema({
  email: {
    type: String, // E-posta, bir String türünde olmalı
    required: true, // E-posta zorunludur
    unique: true, // E-posta benzersiz olmalıdır (dublicate olamaz)
  },
  password: {
    type: String, // Şifre, bir String türünde olmalı
    required: true, // Şifre zorunludur
  },
  name: {
    type: String, // Ad, bir String türünde olmalı
    required: true, // Ad zorunludur
  },
});

// Şifreyi kaydetmeden önce hashleme işlemi yap ve
// Bu işlem, her kullanıcı şifresi kaydedildiğinde şifrenin hash'ini alıp, veritabanında düz metin yerine hash'lenmiş olarak sakla

UserSchema.pre<IUser>("save", async function (next) {
  // Şifre sadece değiştirilmişse hashleme işlemi yapılır, eğer şifre daha önce değiştirilmemişse işlem yapılmaz
  if (!this.isModified("password")) return next(); // Eğer şifre değiştirilmemişse, sonraki işlemlere geç
  try {
    // Şifreyi hash'lemek için salt oluşturuluyor (salt, şifreyi karma hale getirmek için kullanılan rastgele veridir)
    const salt = await bcrypt.genSalt(10); // 10, salt'ın karmaşıklık seviyesini belirtir
    // Şifreyi hash'le ve veritabanına kaydet
    this.password = await bcrypt.hash(this.password, salt);
    next(); // Şifre hash'lendikten sonra sonraki işlem
  } catch (error) {
    next(error as Error); // Eğer hata oluşursa, hatayi sonraki işleme ilet
  }
});

// Şifre doğrulama fonksiyonu
// Kullanıcının girdiği şifre ile veritabanındaki şifreyi karşılaştır

UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  // bcrypt.compare fonksiyonu ile iki şifreyi karşılaştır
  return bcrypt.compare(candidatePassword, this.password); // Şifre eşleşirse true, eşleşmezse false döner
};

// Model export yap
// Kullanıcı modelini mongoose üzerinden dışa aktar
export default mongoose.model<IUser>("User", UserSchema);
