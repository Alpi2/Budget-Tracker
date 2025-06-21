import type React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import BudgetTracker from "../src/components/BudgetTracker";
import Auth from "./components/Auth";

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null); // Kullanıcı giriş durumu
  const [isLoading, setIsLoading] = useState(true); // Yükleme durumu

  useEffect(() => {
    const token = localStorage.getItem("token"); // Token'ı localStorage'dan al
    if (token) {
      validateToken(token); // Token geçerliyse doğrula
    } else {
      setIsLoggedIn(false); // Token yoksa kullanıcı giriş yapmamış demektir
      setIsLoading(false); // Yükleme işlemi tamamlandı
    }
  }, []);

  const validateToken = async (token: string) => {
    try {
      // API ile token doğrulama
      await axios.get("http://localhost:5000/api/auth/validate", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsLoggedIn(true); // Token geçerli, giriş başarılı
    } catch (error) {
      console.error("Token-Validierung fehlgeschlagen:", error);
      setIsLoggedIn(false); // Token geçersizse, giriş durumu hatalı
      localStorage.removeItem("token"); // Geçersiz token'ı temizle
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token"); // Token'ı temizle
    setIsLoggedIn(false); // Kullanıcı çıkış yapmış oldu
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-2xl font-semibold text-gray-600">Laden...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {isLoggedIn ? (
        // Eğer kullanıcı giriş yapmışsa, BudgetTracker'ı göster
        <BudgetTracker onLogout={handleLogout} />
      ) : (
        // Giriş yapmamışsa, Auth bileşenini göster
        <Auth onLoginSuccess={() => setIsLoggedIn(true)} />
      )}
    </div>
  );
};

export default App;
