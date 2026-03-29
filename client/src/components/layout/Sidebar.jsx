import { NavLink } from 'react-router-dom';
import { ADMIN_NAV, SHOPKEEPER_NAV } from '../../utils/constants.js';

const Sidebar = ({ role }) => {
  const items = role === 'ADMIN' ? ADMIN_NAV : SHOPKEEPER_NAV;

  return (
    <aside className="dashboard-sidebar">
      <p className="eyebrow">{role === 'ADMIN' ? 'Admin Control' : 'Seller Studio'}</p>
      <div className="sidebar-links">
        {items.map((item) => (
          <NavLink key={item.path} to={item.path}>
            {item.label}
          </NavLink>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;

