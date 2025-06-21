import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string; // JWT için gizli anahtar (secret) alınır
const TOKEN_EXPIRATION = process.env.TOKEN_EXPIRATION; // Token süresi ortam değişkenlerinden alınır (not: şu an kullanılmıyor)

// AuthRequest adında bir interface oluşturuluyor, bu interface 'Request' tipini genişletiyor ve
// isteğin içinde 'user' adında bir property olmasını sağlıyor.

export interface AuthRequest extends Request {
  user?: any; // İstek nesnesine 'user' property ekle (JWT'den gelen kullanıcı bilgileri burada saklanacak)
}

// 'auth' fonksiyonu, her bir isteğe gelen JWT'yi doğrulamak için kullanılacak middleware'dir.
export const auth = async (
  req: AuthRequest, // İstek (request) nesnesi, 'AuthRequest' türünde olacak
  res: Response, // Yanıt (response) nesnesi, 'Response' türünde olacak
  next: NextFunction // Bir sonraki middleware veya route handler'a geçiş yapmak için kullanılan fonksiyon
) => {
  try {
    // İstek başlığından token alınır (Authorization başlığı)
    const token = req.header("Authorization")?.replace("Bearer ", "");
    // Authorization başlığı varsa ve başlıkta "Bearer " kelimesi varsa, onun sonrasındaki token değeri alınır
    if (!token) {
      // Eğer token yoksa
      return res
        .status(401) // HTTP durum kodu: 401 (Unauthorized)
        .json({ message: "Kein Token bereitgestellt. Bitte anmelden." });
    }

    // Token geçerli ve doğruysa, jwt.verify() fonksiyonu ile doğrulama yap

    const decoded = jwt.verify(token, JWT_SECRET); // Token doğrula ve 'decoded' içinde çözülmüş bilgi al
    req.user = decoded; // Çözülmüş kullanıcı bilgilerini, istek nesnesine 'user' olarak ekle
    next(); // Geçerli token varsa, bir sonraki middleware ya da route handler'a geç
  } catch (error) {
    // Eğer token geçersizse ya da başka bir hata oluşursa
    res.status(401).json({ message: "Ungültiges oder abgelaufenes Token." });
  }
};
