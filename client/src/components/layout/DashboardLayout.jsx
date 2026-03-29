import Sidebar from './Sidebar.jsx';

const DashboardLayout = ({ role, title, description, children, actions }) => (
  <section className="container dashboard-layout">
    <Sidebar role={role} />
    <div className="dashboard-content">
      <div className="section-header">
        <div>
          <p className="eyebrow">{role === 'ADMIN' ? 'Operations' : 'Shopkeeper Dashboard'}</p>
          <h1>{title}</h1>
          <p className="section-copy">{description}</p>
        </div>
        {actions ? <div className="section-actions">{actions}</div> : null}
      </div>
      {children}
    </div>
  </section>
);

export default DashboardLayout;

