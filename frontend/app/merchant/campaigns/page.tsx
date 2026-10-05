"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Plus, Tag, RefreshCcw, Edit2, Trash2, PauseCircle, PlayCircle } from "lucide-react";
import { api } from "@/lib/api";
import { Coupon, Merchant } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function MerchantCampaigns() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [discountType, setDiscountType] = useState("flat");
  const [discountValue, setDiscountValue] = useState("");
  const [minTx, setMinTx] = useState("0");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const openModal = (coupon?: Coupon) => {
    if (coupon) {
      setEditingId(coupon.id);
      setTitle(coupon.title);
      setDiscountType(coupon.discount_type);
      setDiscountValue(coupon.discount_value.toString());
      setMinTx(coupon.minimum_transaction_amount.toString());
      setMaxDiscount(coupon.maximum_discount ? coupon.maximum_discount.toString() : "");
    } else {
      setEditingId(null);
      setTitle("");
      setDiscountType("flat");
      setDiscountValue("");
      setMinTx("0");
      setMaxDiscount("");
    }
    setIsModalOpen(true);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
      if (!user.id) return;
      
      const mRes = await api.getMerchantByOwner(user.id);
      if (mRes.length > 0) {
        const m = mRes[0];
        setMerchant(m);
        
        const cRes = await api.getCoupons(`merchant_id=${m.id}`);
        setCoupons(cRes);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveCoupon = async () => {
    if (!merchant) return;
    
    // Set valid_until to 30 days from now
    const now = new Date();
    const validUntil = new Date();
    validUntil.setDate(now.getDate() + 30);

    const payload: any = {
      title: title || "Special Offer",
      discount_type: discountType,
      discount_value: parseFloat(discountValue) || 0,
      minimum_transaction_amount: parseFloat(minTx) || 0,
      maximum_discount: maxDiscount ? parseFloat(maxDiscount) : null,
    };

    try {
      if (editingId) {
        await api.updateCoupon(editingId, payload);
      } else {
        payload.merchant_id = merchant.id;
        payload.category = merchant.category;
        payload.valid_from = now.toISOString();
        payload.valid_until = validUntil.toISOString();
        payload.usage_limit = 1000;
        payload.user_usage_limit = 1;
        payload.active = true;
        await api.createCoupon(payload);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to save coupon.");
    }
  };

  const handleToggleHold = async (coupon: Coupon) => {
    try {
      await api.updateCoupon(coupon.id, { active: !coupon.active });
      loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to update coupon status.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    try {
      await api.deleteCoupon(id);
      loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to delete coupon.");
    }
  };

  return (
    <div className="animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Campaigns & Coupons</h1>
          <p className="text-slate-400">Manage your targeted offers to attract more customers.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={loadData}>
            <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
          </Button>
          <Button onClick={() => openModal()} className="flex gap-2">
            <Plus size={18} /> Create Coupon
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-slate-400">Loading coupons...</div>
      ) : coupons.length === 0 ? (
        <Card className="p-8 text-center text-slate-400 border-dashed border-2">
          <Tag size={48} className="mx-auto mb-4 opacity-50" />
          <h3 className="text-xl mb-2 text-slate-300">No Active Coupons</h3>
          <p>Create a coupon to start offering discounts to your customers.</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coupons.map((c, i) => (
            <Card key={c.id} className="p-6 border-emerald-500/30 animate-slideUp" style={{animationDelay: `${i*100}ms`}}>
              <div className="flex justify-between mb-4">
                <Badge variant={c.active ? "success" : "warning"}>{c.active ? "Active" : "Inactive"}</Badge>
                <span className="text-sm text-slate-400">Exp: {formatDate(c.valid_until).split(',')[0]}</span>
              </div>
              <h3 className="text-xl font-bold mb-2">{c.title}</h3>
              <p className="text-slate-400 mb-4 text-sm">
                {c.discount_type === 'percentage' ? `${c.discount_value}% OFF` : `Flat ${formatCurrency(c.discount_value)} OFF`}
                {c.minimum_transaction_amount > 0 && ` on orders above ${formatCurrency(c.minimum_transaction_amount)}`}
                {c.maximum_discount && ` (Up to ${formatCurrency(c.maximum_discount)})`}
              </p>
              <div className="bg-slate-900 rounded p-3 text-sm flex justify-between mb-4">
                <span className="text-slate-400">Redemptions</span>
                <span className="font-bold">{c.used_count} / {c.usage_limit}</span>
              </div>
              <div className="flex gap-2 justify-end border-t border-slate-700/50 pt-4 mt-auto">
                <Button variant="secondary" size="sm" onClick={() => handleToggleHold(c)} className="flex-1" title={c.active ? "Put on Hold" : "Activate"}>
                  {c.active ? <PauseCircle size={16} /> : <PlayCircle size={16} />}
                </Button>
                <Button variant="secondary" size="sm" onClick={() => openModal(c)} title="Edit">
                  <Edit2 size={16} />
                </Button>
                <Button variant="danger" size="sm" onClick={() => handleDelete(c.id)} title="Delete">
                  <Trash2 size={16} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Coupon" : "Create New Coupon"}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Coupon Title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2" placeholder="e.g., Weekend Special" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Discount Type</label>
              <select value={discountType} onChange={e => setDiscountType(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white">
                <option value="flat">Flat ₹</option>
                <option value="percentage">% OFF</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Discount Value</label>
              <input type="number" value={discountValue} onChange={e => setDiscountValue(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2" placeholder="e.g., 50" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Minimum Bill (₹)</label>
              <input type="number" value={minTx} onChange={e => setMinTx(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2" placeholder="e.g., 200" />
            </div>
            {discountType === 'percentage' && (
              <div>
                <label className="block text-sm font-medium mb-1">Max Discount (₹)</label>
                <input type="number" value={maxDiscount} onChange={e => setMaxDiscount(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2" placeholder="e.g., 400" />
              </div>
            )}
          </div>
          <Button className="w-full mt-4" onClick={handleSaveCoupon}>
            {editingId ? "Save Changes" : "Launch Coupon"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
