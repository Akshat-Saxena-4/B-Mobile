import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Button from '../../components/common/Button.jsx';
import userService from '../../services/userService.js';

const Users = () => {
  const [users, setUsers] = useState([]);

  const loadUsers = async () => {
    const response = await userService.getUsers();
    setUsers(response);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <DashboardLayout
      role="ADMIN"
      title="Manage users and sellers"
      description="Approve shopkeepers, pause accounts, and keep marketplace access well-governed."
    >
      <div className="stack-list">
        {users.map((user) => (
          <article key={user._id} className="surface-card product-admin-row">
            <div>
              <p className="eyebrow">{user.role}</p>
              <h3>{user.firstName} {user.lastName}</h3>
              <p className="muted-text">
                {user.email}
                {user.sellerProfile?.shopName ? ` • ${user.sellerProfile.shopName}` : ''}
              </p>
            </div>

            <div className="inline-actions wrap-actions">
              {user.role === 'SHOPKEEPER' && user.sellerProfile?.status === 'PENDING' ? (
                <>
                  <Button
                    variant="ghost"
                    onClick={async () => {
                      await userService.updateSellerApproval(user._id, { status: 'APPROVED' });
                      loadUsers();
                    }}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={async () => {
                      await userService.updateSellerApproval(user._id, {
                        status: 'REJECTED',
                        rejectionReason: 'Quality review did not pass',
                      });
                      loadUsers();
                    }}
                  >
                    Reject
                  </Button>
                </>
              ) : null}

              <Button
                variant="ghost"
                onClick={async () => {
                  await userService.toggleUserStatus(user._id, !user.isActive);
                  loadUsers();
                }}
              >
                {user.isActive ? 'Deactivate' : 'Activate'}
              </Button>
            </div>
          </article>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default Users;

