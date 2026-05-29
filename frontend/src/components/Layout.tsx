import { NavLink, Outlet } from 'react-router-dom';
import { Calendar, LayoutDashboard, Stethoscope, Users } from 'lucide-react';

const navItems = [
  { to: '/',          label: 'Dashboard', icon: LayoutDashboard },
  { to: '/pacientes', label: 'Pacientes', icon: Users           },
  { to: '/medicos',   label: 'Médicos',   icon: Stethoscope     },
  { to: '/turnos',    label: 'Turnos',    icon: Calendar        },
];

export default function Layout() {
  return (
    <div className="min-h-screen bg-carbon-gray-10 lg:flex">
      <a className="skip-link" href="#main-content">Saltar al contenido</a>

      {/* ── Carbon UI Shell — Side Navigation ─────────────────── */}
      <aside
        className="
          border-b border-carbon-gray-90 bg-carbon-gray-100
          lg:fixed lg:inset-y-0 lg:w-64
          lg:border-b-0 lg:border-r lg:border-carbon-gray-90
          lg:flex lg:flex-col
        "
      >
        {/* Product name */}
        <div className="flex items-center gap-3 border-b border-carbon-gray-90 px-4 py-4">
          <div className="flex h-9 w-9 items-center justify-center bg-carbon-blue-60">
            <Stethoscope size={18} className="text-white" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight text-white">Clínica San Martín</p>
            <p className="text-xs leading-tight text-carbon-gray-50">Sistema de Turnos</p>
          </div>
        </div>

        {/* Nav items */}
        <nav
          aria-label="Navegación principal"
          className="flex gap-px overflow-x-auto py-2 lg:block lg:flex-1"
        >
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex min-w-max items-center gap-3 px-4 py-3 text-sm font-medium
                 transition-colors duration-100 lg:min-w-0
                 ${isActive
                   ? 'border-l-4 border-carbon-blue-60 bg-carbon-gray-90 pl-3 text-white'
                   : 'border-l-4 border-transparent text-carbon-gray-30 hover:bg-carbon-gray-90 hover:text-white'
                 }`
              }
            >
              <Icon size={16} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="hidden border-t border-carbon-gray-90 px-4 py-3 lg:block">
          <p className="text-xs text-carbon-gray-50">v1.0 · Clínica San Martín</p>
        </div>
      </aside>

      {/* ── Main content area ──────────────────────────────────── */}
      <main id="main-content" className="min-w-0 flex-1 lg:ml-64">
        {/* Content header bar */}
        <div className="border-b border-carbon-gray-20 bg-white px-6 py-4">
          <div className="mx-auto max-w-7xl" />
        </div>

        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
