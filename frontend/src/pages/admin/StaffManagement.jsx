import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Toast from '../../components/common/Toast';
import Loading from '../../components/common/Loading';
import { staffApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  UserPlus,
  Trash2,
  Mail,
  Phone,
  Shield,
  Building,
  Lock,
  Search,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export default function StaffManagement() {
  const { user } = useAuth();
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: 'Operations & Billing Support',
    phone: ''
  });

  const fetchStaff = async () => {
    try {
      const res = await staffApi.getAll();
      if (res.success) {
        setStaffList(res.staff);
      }
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to load staff list.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      department: 'Operations & Billing Support',
      phone: ''
    });
    setModalOpen(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setToast({ type: 'error', message: 'Name, email, and password are required.' });
      return;
    }

    setFormLoading(true);
    try {
      const res = await staffApi.create(formData);
      if (res.success) {
        setToast({ type: 'success', message: 'New staff member added successfully!' });
        setModalOpen(false);
        fetchStaff();
      }
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to add staff member.' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleRemove = async (staffMember) => {
    if (staffMember.id === user?.id) {
      setToast({ type: 'error', message: 'You cannot remove your own active administrator account.' });
      return;
    }

    if (!window.confirm(`Are you sure you want to remove staff member "${staffMember.name}" (${staffMember.email})?`)) {
      return;
    }

    try {
      await staffApi.remove(staffMember.id);
      setToast({ type: 'success', message: `Staff member ${staffMember.name} has been removed.` });
      setStaffList(prev => prev.filter(s => s.id !== staffMember.id));
      fetchStaff();
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to remove staff member.' });
    }
  };

  const filteredStaff = staffList.filter(s => {
    const q = searchTerm.toLowerCase();
    return !searchTerm ||
      s.name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      (s.company_name && s.company_name.toLowerCase().includes(q));
  });

  const columns = [
    {
      header: 'Staff Member',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-teal-50 border border-teal-200 text-teal-700 font-bold flex items-center justify-center text-xs uppercase shadow-xs">
            {row.name.slice(0, 2)}
          </div>
          <div>
            <p className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <span>{row.name}</span>
              <span className="px-1.5 py-0.2 bg-teal-100 text-teal-800 text-[10px] rounded font-semibold uppercase">
                Staff
              </span>
            </p>
            <p className="text-[11px] text-slate-500">{row.email}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Department / Unit',
      render: (row) => (
        <div className="text-xs">
          <span className="font-semibold text-slate-800 block">{row.company_name || 'Operations Support'}</span>
          <span className="text-[11px] text-slate-500">{row.phone || 'No phone recorded'}</span>
        </div>
      )
    },
    {
      header: 'Status',
      render: (row) => <Badge status={row.status || 'active'} size="sm" />
    },
    {
      header: 'Action',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (row) => (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          icon={Trash2}
          className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
          onClick={() => handleRemove(row)}
        >
          Remove
        </Button>
      )
    }
  ];

  if (loading) return <Loading message="Loading staff directory..." />;

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Staff Team & Operations Management</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Authorize operational team members to manage subscriptions, audit billing, and monitor renewal pipelines.
          </p>
        </div>

        <Button
          type="button"
          variant="primary"
          size="sm"
          icon={UserPlus}
          onClick={handleOpenAdd}
        >
          Add New Staff
        </Button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Staff Members</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{staffList.length}</p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
            <Users className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Status</span>
            <p className="text-2xl font-black text-emerald-600 mt-1">
              {staffList.filter(s => s.status !== 'inactive').length}
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <Shield className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Role Permissions</span>
            <p className="text-xs font-semibold text-slate-700 mt-1">Operations & Support Access</p>
            <p className="text-[11px] text-slate-400">Plan deletion restricted to Admin</p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
            <Sparkles className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Search and Table */}
      <Card
        title="Staff Directory"
        subtitle={`Showing ${filteredStaff.length} of ${staffList.length} operational members`}
        actions={
          <div className="w-56">
            <Input
              placeholder="Search staff..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search}
            />
          </div>
        }
      >
        <Table
          columns={columns}
          data={filteredStaff}
          keyExtractor={(item) => item.id}
          emptyMessage="No staff members registered. Click 'Add New Staff' to authorize your first team member."
        />
      </Card>

      {/* Add Staff Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Authorize New Staff Member"
        subtitle="Create credentials and assign department for a new operations team member"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. John Doe"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            label="Work Email Address"
            type="email"
            placeholder="e.g. john.doe@brightloop.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            icon={Mail}
            required
          />

          <Input
            label="Temporary Password"
            type="password"
            placeholder="Min 6 characters"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            icon={Lock}
            required
          />

          <Input
            label="Department / Unit"
            placeholder="e.g. Tier 2 Customer Success"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            icon={Building}
          />

          <Input
            label="Phone Number"
            placeholder="+1 (555) 000-0000"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            icon={Phone}
          />

          <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg text-xs text-teal-800 space-y-1">
            <span className="font-semibold flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-teal-600" />
              Role Scope Notice
            </span>
            <p>
              Staff members can monitor analytics, review subscriptions, verify customer payments, and manage renewal invoices. Destructive actions like deleting subscription plans remain restricted to Administrator accounts.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)} disabled={formLoading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={formLoading} icon={UserPlus}>
              Create Staff Account
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
