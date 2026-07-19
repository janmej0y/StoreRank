import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { StoreIcon, Ban, RotateCcw, Loader2 } from 'lucide-react';
import { fetchAdminStores, createAdminStore, fetchAdminUsers, updateStoreStatus } from '../../api/admin';
import PageBackground from '../../components/PageBackground';
import SortableTable from '../../components/SortableTable';
import FilterBar from '../../components/FilterBar';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import FormField from '../../components/FormField';
import StarRating from '../../components/StarRating';
import Pagination from '../../components/Pagination';
import {
  validateName,
  validateEmail,
  validateAddress,
  extractApiFieldErrors,
  extractApiMessage,
} from '../../utils/validators';
import { formatDate } from '../../utils/formatDate';

const filterDefs = [
  { name: 'name', label: 'Name' },
  { name: 'email', label: 'Email' },
  { name: 'address', label: 'Address' },
];

const initialForm = { name: '', email: '', address: '', ownerId: '' };
const PAGE_SIZE = 10;

export default function AdminStores() {
  const [stores, setStores] = useState([]);
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
    fetchAdminStores({
      ...filters,
      createdFrom: dateRange.from || undefined,
      createdTo: dateRange.to || undefined,
      sortBy,
      order,
      page,
      pageSize: PAGE_SIZE,
    })
      .then(({ data }) => {
        setStores(data.items);
        setPagination(data.pagination);
      })
      .catch((err) => toast.error(extractApiMessage(err, 'Could not load stores')))
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
      await updateStoreStatus(statusTarget.id, !statusTarget.isActive);
      toast.success(statusTarget.isActive ? 'Store deactivated' : 'Store reactivated');
      setStatusTarget(null);
      load();
    } catch (err) {
      toast.error(extractApiMessage(err, 'Could not update store status'));
    } finally {
      setStatusSubmitting(false);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      width: '18%',
      render: (r) => (
        <Link
          to={`/admin/stores/${r.id}`}
          className="flex min-w-0 items-center gap-2 font-medium text-ink-900 transition-opacity hover:text-accent-600 active:opacity-60"
          title={r.name}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-input bg-secondary-50 text-secondary-600">
            <StoreIcon size={15} strokeWidth={2} />
          </span>
          <span className="truncate">{r.name}</span>
        </Link>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      width: '16%',
      render: (r) => (
        <span className="block truncate" title={r.email}>
          {r.email}
        </span>
      ),
    },
    {
      key: 'address',
      label: 'Address',
      sortable: true,
      width: '16%',
      render: (r) => (
        <span className="block truncate" title={r.address}>
          {r.address}
        </span>
      ),
    },
    {
      key: 'owner',
      label: 'Owner',
      width: '13%',
      render: (r) => (
        <span className="block truncate">
          {r.owner ? r.owner.name : <span className="text-ink-400">Unassigned</span>}
        </span>
      ),
    },
    {
      key: 'rating',
      label: 'Rating',
      sortable: true,
      width: '13%',
      render: (r) => (
        <div className="flex items-center gap-1.5">
          <StarRating value={r.averageRating || 0} readOnly size={14} />
          <span className="num whitespace-nowrap text-caption text-ink-500">
            {r.averageRating ?? '—'} ({r.totalRatings})
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      width: '9%',
      render: (r) => (
        <span className={`${r.isActive ? 'badge-success' : 'badge-warning'} whitespace-nowrap`}>
          {r.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      numeric: true,
      width: '9%',
      render: (r) => (
        <span className="whitespace-nowrap text-caption text-ink-500">{formatDate(r.createdAt)}</span>
      ),
    },
    {
      key: 'actions',
      label: '',
      width: '6%',
      render: (r) => (
        <button
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
          {r.isActive ? <Ban size={16} strokeWidth={2} /> : <RotateCcw size={16} strokeWidth={2} />}
        </button>
      ),
    },
  ];

  return (
    <div className="relative min-h-full overflow-hidden">
      <PageBackground variant="neutral" />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-input bg-secondary-50 text-secondary-600">
            <StoreIcon size={22} strokeWidth={2} />
          </span>
          <div>
            <p className="label-micro">Admin / Stores</p>
            <h1 className="mt-1 text-page-title text-ink-900">Stores</h1>
            <p className="mt-1 text-body text-ink-500">Manage stores registered on the platform.</p>
          </div>
        </div>
        <button type="button" className="btn-accent w-full max-sm:h-12 sm:w-auto" onClick={() => setModalOpen(true)}>
          Add store
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
          rows={stores}
          sortBy={sortBy}
          order={order}
          onSort={(key, dir) => {
            setSortBy(key);
            setOrder(dir);
          }}
          loading={loading}
          getRowKey={(r) => r.id}
          emptyTitle="No stores found"
          emptyDescription="Try adjusting your filters, or add a new store."
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

      <CreateStoreModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={() => {
          setModalOpen(false);
          load();
        }}
      />

      <ConfirmDialog
        open={!!statusTarget}
        title={statusTarget?.isActive ? 'Deactivate store' : 'Reactivate store'}
        description={
          statusTarget?.isActive
            ? `${statusTarget?.name} will be hidden from normal users and can no longer receive ratings. Existing ratings are kept.`
            : `${statusTarget?.name} will be visible to normal users again.`
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

function CreateStoreModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [owners, setOwners] = useState([]);

  useEffect(() => {
    if (!open) return;
    fetchAdminUsers({ role: 'OWNER', pageSize: 50 })
      .then(({ data }) => setOwners(data.items))
      .catch(() => setOwners([]));
  }, [open]);

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
      await createAdminStore({
        name: form.name.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        ownerId: form.ownerId ? Number(form.ownerId) : null,
      });
      toast.success('Store created successfully');
      reset();
      onCreated();
    } catch (err) {
      const fieldErrors = extractApiFieldErrors(err);
      if (fieldErrors) setErrors(fieldErrors);
      else toast.error(extractApiMessage(err, 'Could not create store'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title="Add new store">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormField label="Store name" id="store-name" error={errors.name} hint="20–60 characters">
          <input
            id="store-name"
            className={`input ${errors.name ? 'input-error' : ''}`}
            value={form.name}
            onChange={update('name')}
          />
        </FormField>

        <FormField label="Store email" id="store-email" error={errors.email}>
          <input
            id="store-email"
            type="email"
            className={`input ${errors.email ? 'input-error' : ''}`}
            value={form.email}
            onChange={update('email')}
          />
        </FormField>

        <FormField label="Address" id="store-address" error={errors.address} hint="Up to 400 characters">
          <textarea
            id="store-address"
            rows={3}
            className={`input resize-none ${errors.address ? 'input-error' : ''}`}
            value={form.address}
            onChange={update('address')}
          />
        </FormField>

        <FormField label="Store owner" id="store-owner" hint="Only users with the Store Owner role are listed">
          <select id="store-owner" className="input" value={form.ownerId} onChange={update('ownerId')}>
            <option value="">Unassigned</option>
            {owners.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name} ({o.email})
              </option>
            ))}
          </select>
        </FormField>

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <button type="button" className="btn-secondary max-sm:h-12" onClick={handleClose}>
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="btn-accent max-sm:h-12">
            {submitting && <Loader2 size={16} strokeWidth={2} className="animate-spin" />}
            {submitting ? 'Creating…' : 'Create store'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
