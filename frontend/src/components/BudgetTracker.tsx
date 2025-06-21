import type React from "react";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  PlusIcon,
  MinusIcon,
  LogOutIcon,
  PencilIcon,
  TrashIcon,
  SearchIcon,
} from "lucide-react";

// Türler
type Transaction = {
  _id: string;
  date: string;
  amount: number;
  description: string;
  category: string;
  type: "income" | "expense"; // gelir veya gider
  image?: string; // resim
};

type Summary = {
  income: number; // gelir
  expenses: number; // giderler
  balance: number; // bakiye
};

interface BudgetTrackerProps {
  onLogout: () => void; // çıkış yapma fonksiyonu
}

const BudgetTracker: React.FC<BudgetTrackerProps> = ({ onLogout }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]); // işlemler
  const [summary, setSummary] = useState<Summary>({
    income: 0,
    expenses: 0,
    balance: 0,
  });
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    amount: "",
    description: "",
    category: "",
    type: "expense" as "income" | "expense", // varsayılan olarak gider
  });
  const [image, setImage] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(""); // arama terimi

  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Hem işlemler hem de özet verilerini paralel olarak alıyoruz
      const [transactionsRes, summaryRes] = await Promise.all([
        axios.get(
          `http://localhost:5000/api/transactions?search=${searchTerm}`,
          { headers }
        ),
        axios.get("http://localhost:5000/api/transactions/summary", {
          headers,
        }),
      ]);

      setTransactions(transactionsRes.data);
      setSummary(summaryRes.data);
    } catch (error) {
      console.error("Datenabfrage-Fehler:", error);
      // 401 hatası alındığında, kullanıcıyı çıkış yapmaya yönlendir
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        onLogout();
      }
    }
  }, [onLogout, searchTerm]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });
      if (image) {
        formDataToSend.append("image", image);
      }

      // Düzenleme var mı? Yeni mi yoksa var olan bir işlemi mi güncelleyeceğiz?
      if (editingId) {
        await axios.put(
          `http://localhost:5000/api/transactions/${editingId}`,
          formDataToSend,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        await axios.post(
          "http://localhost:5000/api/transactions",
          formDataToSend,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      await fetchData(); // verileri tekrar yükle
      resetForm(); // formu sıfırla
    } catch (error) {
      console.error(
        "Fehler beim Hinzufügen/Bearbeiten der Transaktion:",
        error
      );
      // 401 hatası alındığında, kullanıcıyı çıkış yapmaya yönlendir
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        onLogout();
      }
    }
  };

  const handleEdit = (transaction: Transaction) => {
    // Düzenleme işlemi için formu doldur
    setFormData({
      date: new Date(transaction.date).toISOString().split("T")[0],
      amount: transaction.amount.toString(),
      description: transaction.description,
      category: transaction.category,
      type: transaction.type,
    });
    setEditingId(transaction._id); // düzenleme modunu aç
    setImage(null); // resim sıfırla
  };

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/transactions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchData(); // verileri tekrar yükle
    } catch (error) {
      console.error("Fehler beim Löschen der Transaktion:", error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        onLogout();
      }
    }
  };

  const handleImageClick = (imageName: string) => {
    // imageName sadece dosya adını içermelidir, örneğin: "1737464075637.webp"
    window.open(`http://localhost:5000/${imageName}`, "_blank");
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split("T")[0],
      amount: "",
      description: "",
      category: "",
      type: "expense", // varsayılan olarak gider
    });
    setImage(null);
    setEditingId(null);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-indigo-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Budget Tracker</h1>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-700 hover:bg-indigo-800 transition-colors"
          >
            <LogOutIcon size={20} />
            Abmelden
          </button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Özet bölümünün gösterimi */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Kontostand
            </h2>
            <p
              className={`text-2xl font-bold ${
                summary.balance >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              €{summary.balance.toFixed(2)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Einkommen
            </h2>
            <p className="text-2xl font-bold text-green-600">
              €{summary.income.toFixed(2)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Ausgaben
            </h2>
            <p className="text-2xl font-bold text-red-600">
              €{summary.expenses.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Form kısmı */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? "Transaktion Bearbeiten" : "Transaktion Hinzufügen"}
          </h2>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              className="border rounded p-2"
              required
            />
            <input
              type="number"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              placeholder="Betrag"
              className="border rounded p-2"
              required
            />
            <input
              type="text"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Beschreibung"
              className="border rounded p-2"
              required
            />
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="border rounded p-2"
              required
            >
              <option value="">Kategorie auswählen</option>
              <option value="Salary">Gehalt</option>
              <option value="Food">Essen</option>
              <option value="Transport">Transport</option>
              <option value="Entertainment">Unterhaltung</option>
              <option value="Bills">Rechnungen</option>
              <option value="Shopping">Einkaufen</option>
              <option value="Investment">Investition</option>
              <option value="Other">Sonstiges</option>
            </select>
            <div className="flex gap-4 md:col-span-2 lg:col-span-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: "income" })}
                className={`flex-1 flex items-center justify-center gap-2 p-2 rounded ${
                  formData.type === "income"
                    ? "bg-green-600 text-white"
                    : "bg-gray-200"
                }`}
              >
                <PlusIcon size={20} /> Einkommen
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: "expense" })}
                className={`flex-1 flex items-center justify-center gap-2 p-2 rounded ${
                  formData.type === "expense"
                    ? "bg-red-600 text-white"
                    : "bg-gray-200"
                }`}
              >
                <MinusIcon size={20} /> Ausgabe
              </button>
            </div>
            <input
              type="file"
              onChange={(e) =>
                setImage(e.target.files ? e.target.files[0] : null)
              }
              className="border rounded p-2 md:col-span-2 lg:col-span-4"
              key={image ? image.name : "file-input"} // Dosya seçildiğinde yeniden render yap
            />
            <button
              type="submit"
              className="bg-indigo-600 text-white p-2 rounded md:col-span-2 lg:col-span-4 hover:bg-indigo-700 transition-colors"
            >
              {editingId
                ? "Transaktion Aktualisieren"
                : "Transaktion Hinzufügen"}
            </button>
          </form>
        </div>

        {/* Arama kısmı */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center mb-4">
            <h2 className="text-xl font-semibold mr-4">Transaktionen Suchen</h2>
            <div className="relative flex-grow">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Suche nach Beschreibung oder Kategorie"
                className="w-full border rounded p-2 pl-10"
              />
              <SearchIcon
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
            </div>
          </div>
        </div>

        {/* Sonuçlar */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <h2 className="text-xl font-semibold p-6 border-b">
            Letzte Transaktionen
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Datum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Beschreibung
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Kategorie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Betrag
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Bild
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">{transaction.description}</td>
                    <td className="px-6 py-4">{transaction.category}</td>
                    <td
                      className={`px-6 py-4 font-medium ${
                        transaction.type === "income"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"}€
                      {transaction.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      {transaction.image && (
                        <button
                          onClick={() =>
                            transaction.image &&
                            handleImageClick(transaction.image)
                          }
                        >
                          <img
                            src={`http://localhost:5000/${transaction.image}`}
                            alt="Transaktionsbild"
                            className="w-16 h-16 object-cover rounded"
                          />
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <button
                        onClick={() => handleEdit(transaction)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <PencilIcon size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(transaction._id)}
                        className="text-red-600 hover:text-red-900 ml-4"
                      >
                        <TrashIcon size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetTracker;
