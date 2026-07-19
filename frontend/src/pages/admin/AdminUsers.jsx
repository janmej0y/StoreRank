import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Eye, UserX, UserCheck, Loader2, Users, UserPlus, Mail, MapPin, Calendar } from 'lucide-react';
import { fetchAdminUsers, createAdminUser, updateUserStatus } from '../../api/admin';
import { useAuth } from '../../context/AuthContext';
import PageBackground from '../../components/PageBackground';
import SortableTable from '../../components/SortableTable';
import FilterBar from '../../components/FilterBar';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import FormField from '../../components/FormField';
import Pagination from '../../components/Pagination';
import {
  validateName,
  validateEmail,
  validateAddress,
  validatePassword,
  extractApiFieldErrors,
  extractApiMessage,
} from '../../utils/validators';
import { formatDate } from '../../utils/formatDate';

const ROLE_BADGE = {
  ADMIN: 'badge bg-accent-100 text-accent-700',
  OWNER: 'badge bg-secondary-100 text-secondary-700',
  USER: 'badge bg-ink-100 text-ink-700',
};

const AVATAR_GRADIENTS = [
  'from-accent-400 to-secondary-500',
  'from-secondary-400 to-accent-500',
  'from-secondary-500 to-accent-400',
];

const filterDefs = [
  { name: 'name', label: 'Name' },
  { name: 'email', label: 'Email' },
  { name: 'address', label: 'Address' },
  {
    name: 'role',
    label: 'Role',
    type: 'select',
    options: [
      { value: 'ADMIN', label: 'Admin' },
      { value: 'USER', label: 'Normal User' },
      { value: 'OWNER', label: 'Store Owner' },
    ],
  },
];

const initialForm = { name: '', email: '', address: '', password: '', role: 'USER' };
const PAGE_SIZE = 10;

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [statusTarget, setStatusTarget] = useState(null);
  const [statusSubmitting, setStatusSubmitting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    fetchAdminUsers({
      ...filters,
      createdFrom: dateRange.from || undefined,
      createdTo: dateRange.to || undefined,
      sortBy,
      order,
      page,
      pageSize: PAGE_SIZE,
    })
      .then(({ data }) => {
        setUsers(data.items);
        setPagination(data.pagination);
      })
      .catch((err) => toast.error(extractApiMessage(err, 'Could not load users')))
      .finally(() => setLoading(false));
  }, [filters, dateRange, sortBy, order, page]);

  useEffect(() => {
    const timeout = setTimeout(load, 250);
    return () => clearTimeout(timeout);
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [filters, dateRange, sortBy, order]);

  const handleStatusConfirm = async () => {
    if (!statusTarget) return;
    setStatusSubmitting(true);
    try {
      await updateUserStatus(statusTarget.id, !statusTarget.isActive);
      toast.success(statusTarget.isActive ? 'User deactivated' : 'User reactivated');
      setStatusTarget(null);
      load();
    } catch (err) {
      toast.error(extractApiMessage(err, 'Could not update user status'));
    } finally {
      setStatusSubmitting(false);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      width: '20%',
      render: (r) => (
        <div className="flex min-w-0 items-center gap-2.5" title={r.name}>
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-semibold text-white ${
              AVATAR_GRADIENTS[r.id % AVATAR_GRADIENTS.length]
            }`}
          >
            {r.name?.trim().charAt(0).toUpperCase() || '?'}
          </span>
          <p className="min-w-0 truncate font-medium text-ink-900">{r.name}</p>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      width: '20%',
      render: (r) => (
        <span className="flex min-w-0 items-center gap-1.5 text-ink-600" title={r.email}>
          <Mail size={14} strokeWidth={2} className="shrink-0 text-ink-400" />
          <span className="truncate">{r.email}</span>
        </span>
      ),
    },
    {
      key: 'address',
      label: 'Address',
      sortable: true,
      width: '20%',
      render: (r) => (
        <span className="flex min-w-0 items-center gap-1.5 text-ink-600" title={r.address}>
          <MapPin size={14} strokeWidth={2} className="shrink-0 text-ink-400" />
          <span className="truncate">{r.address}</span>
        </span>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      width: '12%',
      render: (r) => (
        <span className={`${ROLE_BADGE[r.role]} whitespace-nowrap`}>
          {r.role === 'USER' ? 'Normal User' : r.role === 'OWNER' ? 'Store Owner' : 'Admin'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      width: '10%',
      render: (r) => (
        <span className={`${r.isActive ? 'badge-success' : 'badge-warning'} whitespace-nowrap`}>
          {r.isActive && (
            <motion.span
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              className="h-1.5 w-1.5 rounded-full bg-success-500"
            />
          )}
          {r.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Joined',
      sortable: true,
      numeric: true,
      width: '10%',
      render: (r) => (
        <span className="flex items-center gap-1.5 whitespace-nowrap text-caption text-ink-500">
          <Calendar size={13} strokeWidth={2} className="shrink-0 text-ink-400" />
          {formatDate(r.createdAt)}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      width: '8%',
      render: (r) => (
        <div className="flex items-center gap-1">
          <motion.span whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}>
            <Link
              to={`/admin/users/${r.id}`}
              className="flex h-8 w-8 items-center justify-center rounded-input text-ink-500 transition-colors hover:bg-secondary-50 hover:text-secondary-600"
              aria-label={`View ${r.name}`}
              title="View"
            >
              <Eye size={16} strokeWidth={2} />
            </Link>
          </motion.span>
          {r.id !== currentUser?.id && (
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => setStatusTarget(r)}
              className={`flex h-8 w-8 items-center justify-center rounded-input transition-colors ${
                r.isActive
                  ? 'text-danger-500 hover:bg-danger-50 hover:text-danger-700'
                  : 'text-success-500 hover:bg-success-50 hover:text-success-700'
              }`}
              aria-label={r.isActive ? `Deactivate ${r.name}` : `Reactivate ${r.name}`}
              title={r.isActive ? 'Deactivate' : 'Reactivate'}
            >
              {r.isActive ? <UserX size={16} strokeWidth={2} /> : <UserCheck size={16} strokeWidth={2} />}
            </motion.button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="relative min-h-full overflow-hidden">
      <PageBackground variant="neutral" />

      <div className="mx-auto max-w-[1650px] px-4 py-8 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-input bg-secondary-50 text-secondary-600">
            <Users size={22} strokeWidth={2} />
          </span>
          <div>
            <p className="label-micro">Admin / Users</p>
            <h1 className="mt-1 text-page-title text-ink-900">Users</h1>
            <p className="mt-1 text-body text-ink-500">Manage normal users, store owners, and admins.</p>
          </div>
        </div>
        <button type="button" className="btn-accent w-full gap-1.5 max-sm:h-12 sm:w-auto" onClick={() => setModalOpen(true)}>
          <UserPlus size={16} strokeWidth={2} />
          Add user
        </button>
      </motion.div>

      <div className="mt-6 space-y-4">
        <FilterBar
          filters={filterDefs}
          values={filters}
          onChange={(name, value) => setFilters((f) => ({ ...f, [name]: value }))}
          onReset={() => {
            setFilters({});
            setDateRange({ from: '', to: '' });
          }}
          order={order}
          onToggleOrder={() => setOrder((o) => (o === 'asc' ? 'desc' : 'asc'))}
          dateRange={{ ...dateRange, onChange: setDateRange }}
        />

        <SortableTable
          columns={columns}
          rows={users}
          sortBy={sortBy}
          order={order}
          onSort={(key, dir) => {
            setSortBy(key);
            setOrder(dir);
          }}
          loading={loading}
          getRowKey={(r) => r.id}
          emptyTitle="No users found"
          emptyDescription="Try adjusting your filters, or add a new user."
          footer={
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              onPageChange={setPage}
            />
          }
        />
      </div>

      <CreateUserModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={() => {
          setModalOpen(false);
          load();
        }}
      />

      <ConfirmDialog
        open={!!statusTarget}
        title={statusTarget?.isActive ? 'Deactivate user' : 'Reactivate user'}
        description={
          statusTarget?.isActive
            ? `${statusTarget?.name} will no longer be able to log in. Their existing ratings and history are kept.`
            : `${statusTarget?.name} will be able to log in again.`
        }
        confirmLabel={statusTarget?.isActive ? 'Deactivate' : 'Reactivate'}
        tone={statusTarget?.isActive ? 'danger' : 'default'}
        submitting={statusSubmitting}
        onConfirm={handleStatusConfirm}
        onCancel={() => setStatusTarget(null)}
      />
      </div>
    </div>
  );
}

function CreateUserModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const reset = () => {
    setForm(initialForm);
    setErrors({});
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const validate = () => {
    const next = {
      name: validateName(form.name),
      email: validateEmail(form.email),
      address: validateAddress(form.address),
      password: validatePassword(form.password),
    };
    Object.keys(next).forEach((k) => {
      if (!next[k]) delete next[k];
    });
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await createAdminUser({
        name: form.name.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        password: form.password,
        role: form.role,
      });
      toast.success('User created successfully');
      reset();
      onCreated();
    } catch (err) {
      const fieldErrors = extractApiFieldErrors(err);
      if (fieldErrors) setErrors(fieldErrors);
      else toast.error(extractApiMessage(err, 'Could not create user'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title="Add new user">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormField label="Full name" id="new-name" error={errors.name} hint="20–60 characters">
          <input
            id="new-name"
            className={`input ${errors.name ? 'input-error' : ''}`}
            value={form.name}
            onChange={update('name')}
          />
        </FormField>

        <FormField label="Email address" id="new-email" error={errors.email}>
          <input
            id="new-email"
            type="email"
            className={`input ${errors.email ? 'input-error' : ''}`}
            value={form.email}
            onChange={update('email')}
          />
        </FormField>

        <FormField label="Address" id="new-address" error={errors.address} hint="Up to 400 characters">
          <textarea
            id="new-address"
            rows={3}
            className={`input resize-none ${errors.address ? 'input-error' : ''}`}
            value={form.address}
            onChange={update('address')}
          />
        </FormField>

        <FormField
          label="Password"
          id="new-password"
          error={errors.password}
          hint="8–16 characters, 1 uppercase letter, 1 special character"
        >
          <input
            id="new-password"
            type="password"
            className={`input ${errors.password ? 'input-error' : ''}`}
            value={form.password}
            onChange={update('password')}
          />
        </FormField>

        <FormField label="Role" id="new-role">
          <select id="new-role" className="input" value={form.role} onChange={update('role')}>
            <option value="USER">Normal User</option>
            <option value="OWNER">Store Owner</option>
            <option value="ADMIN">Administrator</option>
          </select>
        </FormField>

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <button type="button" className="btn-secondary max-sm:h-12" onClick={handleClose}>
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="btn-accent max-sm:h-12">
            {submitting && <Loader2 size={16} strokeWidth={2} className="animate-spin" />}
            {submitting ? 'Creating…' : 'Create user'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
