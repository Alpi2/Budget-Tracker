import React, { useState } from "react";
import axios from "axios";

// AuthProps arayüzü, login başarılı olduğunda çalışacak olan fonksiyon
interface AuthProps {
  onLoginSuccess: () => void;
}

// FormData arayüzü, formda kullanılan alanların tiplerini belirt (isim, email, şifre)
interface FormData {
  name: string;
  email: string;
  password: string;
}

const Auth: React.FC<AuthProps> = ({ onLoginSuccess }) => {
  // Kullanıcı giriş yapacak mı, yoksa kayıt olacak mı kontrolü için durum değişkeni
  const [isLogin, setIsLogin] = useState(true);

  // Form verilerini tutacak olan durum değişkeni (isim, email, şifre)
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
  });

  // Hata mesajını tutacak olan durum değişkeni
  const [error, setError] = useState<string | null>(null);

  // Form verilerini sunucuya gönderme işlemi
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Formun varsayılan submit davranışını engeller
    setError(null); // Her yeni submit işleminde önce hatayı sıfırlıyoruz

    try {
      // Giriş yapma veya kayıt işlemini sunucuya POST isteğiyle gönderiyoruz
      const response = await axios.post(
        `http://localhost:5000/api/auth/${isLogin ? "login" : "register"}`,
        formData
      );

      // Sunucudan gelen token'ı localStorage'a kaydediyoruz ve login işlemi başarılıysa onLoginSuccess fonksiyonunu çağırıyoruz
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        onLoginSuccess();
      }
    } catch (err) {
      // Hata durumunda hatayı ekrana yazdırıyoruz
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || "Ein Fehler ist aufgetreten");
      } else {
        setError("Ein unerwarteter Fehler ist aufgetreten");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {/* Eğer kullanıcı giriş yapacaksa, giriş mesajı; kayıt olacaksa, kayıt mesajı göster */}
            {isLogin
              ? "Anmelden bei Ihrem Konto"
              : "Erstellen Sie ein neues Konto"}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            {/* Eğer kullanıcı kayıt olacaksa, isim input'u göster */}
            {!isLogin && (
              <div>
                <label htmlFor="name" className="sr-only">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
            )}
            <div>
              <label htmlFor="email" className="sr-only">
                E-Mail-Adresse
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="E-Mail-Adresse"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Passwort
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Passwort"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>
          </div>

          {/* Eğer bir hata mesajı varsa, onu ekrana yazdır */}
          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {/* Kullanıcı giriş yapacaksa "Anmelden", kayıt olacaksa "Registrieren" butonunu göster */}
              {isLogin ? "Anmelden" : "Registrieren"}
            </button>
          </div>
        </form>
        <div className="text-center">
          <button
            onClick={() => setIsLogin(!isLogin)} // Giriş/kayıt durumunu değiştir
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            {/* Eğer kullanıcı giriş yapıyorsa, "Kayıt Ol" mesajı göster; eğer kayıt oluyorsa, "Giriş Yap" mesajı göster */}
            {isLogin
              ? "Brauchen Sie ein Konto? Registrieren"
              : "Haben Sie bereits ein Konto? Anmelden"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
