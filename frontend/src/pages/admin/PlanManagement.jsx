import React, { useState, useEffect, useRef } from 'react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Toast from '../../components/common/Toast';
import Loading from '../../components/common/Loading';
import { plansApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Plus, Edit2, Trash2, Check, Sparkles, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

export default function PlanManagement() {
  const { isAdmin } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [toast, setToast] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    billing_cycle: 'monthly',
    featuresText: '',
    status: 'active'
  });
  const [formLoading, setFormLoading] = useState(false);

  const fetchPlans = async () => {
    try {
      const res = await plansApi.getAll();
      if (res.success) {
        setPlans(res.plans);
      }
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to fetch plans' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleOpenCreate = () => {
    setEditingPlan(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      billing_cycle: 'monthly',
      featuresText: 'Up to 10 team members\nCore subscription management\nStandard email support',
      status: 'active'
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (plan) => {
    setEditingPlan(plan);
    const featuresArr = Array.isArray(plan.features) ? plan.features : [];
    setFormData({
      name: plan.name,
      description: plan.description || '',
      price: plan.price,
      billing_cycle: plan.billing_cycle || 'monthly',
      featuresText: featuresArr.join('\n'),
      status: plan.status || 'active'
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    const features = formData.featuresText
      .split('\n')
      .map(f => f.trim())
      .filter(Boolean);

    try {
      if (editingPlan) {
        await plansApi.update(editingPlan.id, {
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          billing_cycle: formData.billing_cycle,
          features,
          status: formData.status
        });
        setToast({ type: 'success', message: 'Plan updated successfully!' });
      } else {
        await plansApi.create({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          billing_cycle: formData.billing_cycle,
          features,
          status: formData.status
        });
        setToast({ type: 'success', message: 'New subscription plan created!' });
      }
      setModalOpen(false);
      fetchPlans();
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to save plan.' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleStatus = async (plan) => {
    const newStatus = plan.status === 'active' ? 'inactive' : 'active';
    try {
      await plansApi.toggleStatus(plan.id, newStatus);
      setToast({ type: 'success', message: `Plan marked as ${newStatus}.` });
      fetchPlans();
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to update status.' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subscription plan?')) return;
    try {
      await plansApi.delete(id);
      setToast({ type: 'success', message: 'Plan deleted successfully.' });
      setPlans(prev => prev.filter(p => p.id !== id));
      fetchPlans();
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to delete plan.' });
    }
  };

  const scrollContainerRef = useRef(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const dragStartRef = useRef({ x: 0, scrollLeft: 0 });

  // Enable high-sensitivity mouse wheel horizontal scrolling
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const onWheel = (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        el.scrollLeft += e.deltaY * 2.8;
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [plans]);

  const handleMouseDown = (e) => {
    if (e.button !== 0 || e.target.closest('button') || e.target.closest('input')) return;
    setIsMouseDown(true);
    dragStartRef.current = {
      x: e.pageX,
      scrollLeft: scrollContainerRef.current ? scrollContainerRef.current.scrollLeft : 0
    };
  };

  const handleMouseMove = (e) => {
    if (!isMouseDown || !scrollContainerRef.current) return;
    e.preventDefault();
    const walk = (e.pageX - dragStartRef.current.x) * 2.5;
    scrollContainerRef.current.scrollLeft = dragStartRef.current.scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -400, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 400, behavior: 'smooth' });
    }
  };

  if (loading) return <Loading message="Loading subscription plans..." />;

  return (
    <div className="space-y-6 w-full max-w-full min-w-0">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Subscription Plan Management</h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {plans.length} {plans.length === 1 ? 'Tier' : 'Tiers'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure pricing tiers, features, billing intervals, and activation statuses. Scroll horizontally or drag with mouse.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
          {/* Scroll navigation buttons */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={scrollLeft}
              title="Scroll left"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white text-slate-700 hover:text-brand-600 hover:bg-slate-50 text-xs font-semibold shadow-xs transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Left</span>
            </button>
            <button
              type="button"
              onClick={scrollRight}
              title="Scroll right"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white text-slate-700 hover:text-brand-600 hover:bg-slate-50 text-xs font-semibold shadow-xs transition-colors"
            >
              <span>Right</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <Button
            type="button"
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={handleOpenCreate}
          >
            Add New Plan
          </Button>
        </div>
      </div>

      {/* Plan Cards Horizontal Scroll Row */}
      <div className="relative w-full max-w-full min-w-0">
        {/* Floating Side Scroll Buttons */}
        <button
          type="button"
          onClick={scrollLeft}
          title="Scroll Left"
          className="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-white shadow-xl border border-slate-200 text-slate-700 hover:text-brand-600 hover:bg-brand-50 hover:border-brand-300 items-center justify-center transition-all opacity-90 hover:opacity-100 hover:scale-105"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={scrollRight}
          title="Scroll Right"
          className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-white shadow-xl border border-slate-200 text-slate-700 hover:text-brand-600 hover:bg-brand-50 hover:border-brand-300 items-center justify-center transition-all opacity-90 hover:opacity-100 hover:scale-105"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={`w-full max-w-full overflow-x-auto overflow-y-hidden flex flex-nowrap items-stretch gap-5 pb-5 pt-1 px-1 horizontal-plans-scroll scroll-smooth select-none ${
            isMouseDown ? 'cursor-grabbing' : 'cursor-grab'
          }`}
        >
          {plans.map((plan) => {
            const features = Array.isArray(plan.features) ? plan.features : [];
            return (
              <div
                key={plan.id}
                className={`w-[290px] min-w-[290px] max-w-[310px] flex-shrink-0 bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                  plan.status === 'active'
                    ? 'border-slate-200 shadow-xs hover:border-brand-300 hover:shadow-md'
                    : 'border-slate-200 opacity-60 bg-slate-50/50'
                }`}
              >
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{plan.name}</h3>
                    <p className="text-xs text-slate-500 capitalize">{plan.billing_cycle} billing</p>
                  </div>
                  <Badge status={plan.status} size="sm" />
                </div>

                <div className="my-3">
                  <span className="text-2xl font-black text-slate-900">
                    ${parseFloat(plan.price).toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">/{plan.billing_cycle}</span>
                </div>

                <p className="text-xs text-slate-600 mb-4 line-clamp-2 min-h-[32px]">
                  {plan.description || 'No description provided.'}
                </p>

                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Included Features
                  </span>
                  {features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-700">
                      <Check className="h-3.5 w-3.5 text-brand-600 mt-0.5 flex-shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl flex items-center justify-between gap-1">
                <button
                  type="button"
                  onClick={() => handleToggleStatus(plan)}
                  className={`text-xs font-semibold hover:underline ${
                    plan.status === 'active' ? 'text-amber-600' : 'text-emerald-600'
                  }`}
                >
                  {plan.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>

                <div className="flex items-center gap-1.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    icon={Edit2}
                    onClick={() => handleOpenEdit(plan)}
                  >
                    Edit
                  </Button>
                  {isAdmin && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      icon={Trash2}
                      className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                      onClick={() => handleDelete(plan.id)}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        </div>
      </div>

      {/* Plan Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingPlan ? `Edit Plan: ${editingPlan.name}` : 'Create Subscription Plan'}
        subtitle="Specify plan details, pricing, and feature highlights"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Plan Name"
            placeholder="e.g. Scale Tier"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Price ($ USD)"
              type="number"
              step="0.01"
              placeholder="79.00"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Billing Cycle
              </label>
              <select
                value={formData.billing_cycle}
                onChange={(e) => setFormData({ ...formData, billing_cycle: e.target.value })}
                className="block w-full rounded-lg border border-slate-300 py-2.5 px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Summary of target audience and capabilities..."
              className="block w-full rounded-lg border border-slate-300 py-2 px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Features (one per line)
            </label>
            <textarea
              rows={4}
              value={formData.featuresText}
              onChange={(e) => setFormData({ ...formData, featuresText: e.target.value })}
              placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
              className="block w-full rounded-lg border border-slate-300 py-2 px-3 text-sm font-mono focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={formLoading}>
              {editingPlan ? 'Save Changes' : 'Create Plan'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
