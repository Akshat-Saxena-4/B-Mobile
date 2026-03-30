import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Button from '../../components/common/Button.jsx';
import Loader from '../../components/common/Loader.jsx';
import userService from '../../services/userService.js';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadUsers = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      }
      const response = await userService.getUsers();
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

  useEffect(() => {
    loadUsers();
  }, []);

  if (loading) {
    return <Loader label="Loading users" />;
  }

  return (
    <DashboardLayout
      role="ADMIN"
      title="Manage users and sellers"
      description="Approve shopkeepers, pause accounts, and keep marketplace access well-governed."
    >
      {message ? <div className="alert alert-success">{message}</div> : null}
      {error ? <div className="alert alert-error">{error}</div> : null}

      <div className="stack-list">
        {users.map((user) => (
          <article key={user._id} className="surface-card product-admin-row">
            <div>
              <p className="eyebrow">{user.role}</p>
              <h3>{user.firstName} {user.lastName}</h3>
              <p className="muted-text">
                {user.email}
                {user.sellerProfile?.shopName ? ` | ${user.sellerProfile.shopName}` : ''}
              </p>
            </div>

            <div className="inline-actions wrap-actions">
              {user.role === 'SHOPKEEPER' && user.sellerProfile?.status === 'PENDING' ? (
                <>
                  <Button
                    variant="ghost"
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
                    onClick={() =>
                      runUserAction(
                        user._id,
                        () =>
                          userService.updateSellerApproval(user._id, {
                            status: 'REJECTED',
                            rejectionReason: 'Quality review did not pass',
                          }),
                        'Seller rejected successfully'
                      )
                    }
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
        ))}
      </div>
    </DashboardLayout>
  );
};

export default Users;
