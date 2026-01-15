"use client";

import { useState, useEffect } from "react";
import { Hash, ImageIcon, AlignLeft, Trash2, Loader2, Plus } from "lucide-react";

type CategoryWithCount = {
  id: string;
  name: string;
  imageURL: string | null;
  description: string | null;
  _count: { posts: number };
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", imageURL: "", description: "" });

  const fetchCategories = async () => {
    const res = await fetch("/api/admin/categories");
    const data = await res.json();
    setCategories(data);
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleUpdate = async (id: string) => {
    await fetch(`/api/admin/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    fetchCategories();
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("削除しますか？")) return;
    await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    fetchCategories();
  };

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto" /></div>;

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 text-[#37352f]">
      <div className="flex justify-between items-center mb-10 border-b pb-4">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Hash className="text-gray-300" size={32} /> カテゴリ詳細管理
        </h1>
      </div>

      <div className="grid gap-6">
        {categories.map((category) => (
          <div key={category.id} className="group border border-gray-100 rounded-xl p-5 hover:bg-gray-50/50 transition-all bg-white shadow-sm">
            {editingId === category.id ? (
              <div className="space-y-4">
                <input 
                  className="w-full text-xl font-bold outline-none border-b focus:border-blue-500 pb-1"
                  value={editForm.name}
                  onChange={e => setEditForm({...editForm, name: e.target.value})}
                />
                <div className="flex items-center gap-2 bg-white border p-2 rounded">
                  <ImageIcon size={16} className="text-gray-400" />
                  <input placeholder="画像URL" className="flex-grow outline-none text-sm" value={editForm.imageURL} onChange={e => setEditForm({...editForm, imageURL: e.target.value})} />
                </div>
                <div className="flex items-start gap-2 bg-white border p-2 rounded">
                  <AlignLeft size={16} className="text-gray-400 mt-1" />
                  <textarea placeholder="説明文を入力..." className="flex-grow outline-none text-sm h-24 resize-none" value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} />
                </div>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setEditingId(null)} className="px-4 py-1.5 text-sm text-gray-500 hover:bg-gray-100 rounded">キャンセル</button>
                  <button onClick={() => handleUpdate(category.id)} className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded">保存</button>
                </div>
              </div>
            ) : (
              <div className="flex gap-6">
                <div className="w-24 h-24 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden border">
                  {category.imageURL ? <img src={category.imageURL} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="text-gray-300" /></div>}
                </div>
                <div className="flex-grow">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold cursor-pointer hover:underline" onClick={() => {
                        setEditingId(category.id);
                        setEditForm({ name: category.name, imageURL: category.imageURL || "", description: category.description || "" });
                      }}>{category.name}</h2>
                    <span className="text-xs font-bold px-2 py-0.5 bg-gray-100 rounded-full">{category._count.posts} 記事</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">{category.description || <span className="text-gray-300 italic">説明文なし</span>}</p>
                </div>
                <button onClick={() => handleDelete(category.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={18} /></button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}