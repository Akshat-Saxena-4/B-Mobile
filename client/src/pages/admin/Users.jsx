import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import Loader from '../../components/common/Loader.jsx';
import Modal from '../../components/common/Modal.jsx';
import userService from '../../services/userService.js';
import { downloadCsv } from '../../utils/exportCsv.js';
import { formatDate } from '../../utils/formatDate.js';

const ROLE_OPTIONS = [
  { value: '', label: 'All roles' },
  { value: 'CUSTOMER', label: 'Customers' },
  { value: 'SHOPKEEPER', label: 'Shopkeepers' },
  { value: 'ADMIN', label: 'Admins' },
];

const ACCOUNT_OPTIONS = [
  { value: '', label: 'All accounts' },
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
];

const SELLER_STATUS_OPTIONS = [
  { value: '', label: 'All seller reviews' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
];

const getRoleTone = (role) => {
  switch (role) {
    case 'ADMIN':
      return 'status-tag--info';
    case 'SHOPKEEPER':
      return 'status-tag--warning';
    case 'CUSTOMER':
      return 'status-tag--success';
    default:
      return 'status-tag--default';
  }
};

const getSellerTone = (status) => {
  switch (status) {
    case 'APPROVED':
      return 'status-tag--success';
    case 'REJECTED':
      return 'status-tag--danger';
    case 'PENDING':
      return 'status-tag--warning';
    default:
      return 'status-tag--default';
  }
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    isActive: '',
    sellerStatus: '',
  });
  const [rejectingUser, setRejectingUser] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('Quality review did not pass');
  const deferredSearch = useDeferredValue(filters.search);

  const loadUsers = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      const response = await userService.getUsers({
        search: deferredSearch,
        role: filters.role,
        isActive: filters.isActive,
        sellerStatus: filters.sellerStatus,
      });
      setUsers(response);
      setError('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to fetch users');
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadUsers();
  }, [deferredSearch, filters.isActive, filters.role, filters.sellerStatus]);

  const metrics = useMemo(
    () => ({
      total: users.length,
      customers: users.filter((user) => user.role === 'CUSTOMER').length,
      sellers: users.filter((user) => user.role === 'SHOPKEEPER').length,
      pendingSellers: users.filter((user) => user.sellerProfile?.status === 'PENDING').length,
      inactive: users.filter((user) => !user.isActive).length,
    }),
    [users]
  );

  const runUserAction = async (userId, action, successMessage) => {
    try {
      setBusyId(userId);
      await action();
      await loadUsers(false);
      setMessage(successMessage);
      setError('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to update this user');
    } finally {
      setBusyId('');
    }
  };

  const handleDeleteUser = async (user) => {
    const confirmed = window.confirm(
      `Delete ${user.firstName} ${user.lastName}? This will remove their account${
        user.role === 'SHOPKEEPER' ? ' and archive all of their products' : ''
      }.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setBusyId(user._id);
      const response = await userService.deleteUser(user._id);
      await loadUsers(false);
      setMessage(response.message || 'User deleted successfully');
      setError('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to delete this user');
    } finally {
      setBusyId('');
    }
  };

  const exportUsers = () => {
    downloadCsv({
      filename: 'marketplace-users.csv',
      columns: [
        { label: 'Name', value: (user) => `${user.firstName} ${user.lastName}`.trim() },
        { label: 'Email', key: 'email' },
        { label: 'Phone', value: (user) => user.phone || '' },
        { label: 'Role', key: 'role' },
        { label: 'Active', value: (user) => (user.isActive ? 'Yes' : 'No') },
        { label: 'Seller Status', value: (user) => user.sellerProfile?.status || '' },
        { label: 'Shop', value: (user) => user.sellerProfile?.shopName || '' },
        { label: 'Joined', value: (user) => formatDate(user.createdAt) },
      ],
      rows: users,
    });
  };

  if (loading) {
    return <Loader label="Loading users" />;
  }

  return (
    <DashboardLayout
      role="ADMIN"
      title="Manage users and sellers"
      description="Approve shopkeepers, search faster, export filtered records, and keep account governance tight."
      actions={
        <Button variant="ghost" onClick={exportUsers} disabled={!users.length}>
          Export CSV
        </Button>
      }
    >
      <section className="surface-card console-hero console-hero--admin">
        <div>
          <p className="eyebrow">Account governance</p>
          <h3>Filter the queue and resolve access decisions without losing context.</h3>
          <p className="section-copy">
            Seller review state, account status, and customer records stay searchable in the same workspace.
          </p>
        </div>
        <div className="console-hero__stats">
          <div className="console-stat">
            <span>Total loaded</span>
            <strong>{metrics.total}</strong>
          </div>
          <div className="console-stat">
            <span>Customers</span>
            <strong>{metrics.customers}</strong>
          </div>
          <div className="console-stat">
            <span>Sellers</span>
            <strong>{metrics.sellers}</strong>
          </div>
          <div className="console-stat">
            <span>Pending approvals</span>
            <strong>{metrics.pendingSellers}</strong>
          </div>
        </div>
      </section>

      {message ? <div className="alert alert-success">{message}</div> : null}
      {error ? <div className="alert alert-error">{error}</div> : null}

      <section className="surface-card control-shell">
        <div className="control-grid">
          <Input
            label="Search users"
            placeholder="Name or email"
            value={filters.search}
            onChange={(event) =>
              setFilters((current) => ({ ...current, search: event.target.value }))
            }
          />
          <Input
            label="Role"
            as="select"
            options={ROLE_OPTIONS}
            value={filters.role}
            onChange={(event) => setFilters((current) => ({ ...current, role: event.target.value }))}
          />
          <Input
            label="Account status"
            as="select"
            options={ACCOUNT_OPTIONS}
            value={filters.isActive}
            onChange={(event) =>
              setFilters((current) => ({ ...current, isActive: event.target.value }))
            }
          />
          <Input
            label="Seller review"
            as="select"
            options={SELLER_STATUS_OPTIONS}
            value={filters.sellerStatus}
            onChange={(event) =>
              setFilters((current) => ({ ...current, sellerStatus: event.target.value }))
            }
          />
        </div>
      </section>

      <div className="stack-list">
        {users.length ? (
          users.map((user) => (
            <article key={user._id} className="surface-card entity-card entity-card--user">
              <div className="entity-card__body">
                <div className="entity-card__header">
                  <div>
                    <div className="inline-actions">
                      <span className={`status-tag ${getRoleTone(user.role)}`}>{user.role}</span>
                      <span className={`status-tag ${user.isActive ? 'status-tag--success' : 'status-tag--muted'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {user.role === 'SHOPKEEPER' ? (
                        <span className={`status-tag ${getSellerTone(user.sellerProfile?.status)}`}>
                          Seller {user.sellerProfile?.status || 'PENDING'}
                        </span>
                      ) : null}
                    </div>
                    <h3>
                      {user.firstName} {user.lastName}
                    </h3>
                  </div>
                  <div className="entity-card__summary">
                    <strong>{user.stats?.totalOrders || 0} orders</strong>
                    <span className="muted-text">Joined {formatDate(user.createdAt)}</span>
                  </div>
                </div>

                <div className="info-list">
                  <div className="info-item">
                    <span>Contact</span>
                    <strong>{user.email}{user.phone ? ` | ${user.phone}` : ''}</strong>
                  </div>
                  {user.role === 'SHOPKEEPER' ? (
                    <>
                      <div className="info-item">
                        <span>Shop</span>
                        <strong>{user.sellerProfile?.shopName || 'Not set'}</strong>
                      </div>
                      <div className="info-item">
                        <span>Review note</span>
                        <strong>{user.sellerProfile?.rejectionReason || 'No review note yet'}</strong>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>

              <div className="entity-card__aside">
                {user.role === 'SHOPKEEPER' && user.sellerProfile?.status === 'PENDING' ? (
                  <>
                    <Button
                      variant="secondary"
                      disabled={busyId === user._id}
                      onClick={() =>
                        runUserAction(
                          user._id,
                          () => userService.updateSellerApproval(user._id, { status: 'APPROVED' }),
                          'Seller approved successfully'
                        )
                      }
                    >
                      Approve
                    </Button>
                    <Button
                      variant="ghost"
                      disabled={busyId === user._id}
                      onClick={() => {
                        setRejectingUser(user);
                        setRejectionReason(user.sellerProfile?.rejectionReason || 'Quality review did not pass');
                      }}
                    >
                      Reject
                    </Button>
                  </>
                ) : null}

                <Button
                  variant="ghost"
                  disabled={busyId === user._id}
                  onClick={() =>
                    runUserAction(
                      user._id,
                      () => userService.toggleUserStatus(user._id, !user.isActive),
                      `User ${user.isActive ? 'deactivated' : 'activated'} successfully`
                    )
                  }
                >
                  {user.isActive ? 'Deactivate' : 'Activate'}
                </Button>

                {user.role !== 'ADMIN' ? (
                  <Button
                    variant="danger"
                    disabled={busyId === user._id}
                    onClick={() => handleDeleteUser(user)}
                  >
                    Delete
                  </Button>
                ) : null}
              </div>
            </article>
          ))
        ) : (
          <div className="empty-state empty-state--card">
            No users match the current filters.
          </div>
        )}
      </div>

      <Modal
        isOpen={Boolean(rejectingUser)}
        title={rejectingUser ? `Reject ${rejectingUser.firstName} ${rejectingUser.lastName}` : 'Reject seller'}
        onClose={() => setRejectingUser(null)}
      >
        <form
          className="stack-list"
          onSubmit={async (event) => {
            event.preventDefault();
            await runUserAction(
              rejectingUser._id,
              () =>
                userService.updateSellerApproval(rejectingUser._id, {
                  status: 'REJECTED',
                  rejectionReason,
                }),
              'Seller rejected successfully'
            );
            setRejectingUser(null);
          }}
        >
          <Input
            label="Reason"
            as="textarea"
            rows="4"
            value={rejectionReason}
            onChange={(event) => setRejectionReason(event.target.value)}
          />
          <div className="inline-actions">
            <Button type="submit">Confirm Rejection</Button>
            <Button type="button" variant="ghost" onClick={() => setRejectingUser(null)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default Users;
