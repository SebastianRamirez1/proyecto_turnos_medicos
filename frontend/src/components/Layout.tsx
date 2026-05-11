import { NavLink, Outlet } from 'react-router-dom';
import { Calendar, LayoutDashboard, Stethoscope, Users } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/pacientes', label: 'Pacientes', icon: Users },
  { to: '/medicos', label: 'Medicos', icon: Stethoscope },
  { to: '/turnos', label: 'Turnos', icon: Calendar },
];

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-100 lg:flex">
      <aside className="border-b border-slate-200 bg-white shadow-sm lg:fixed lg:inset-y-0 lg:w-64 lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
            <Stethoscope size={21} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold leading-tight text-slate-900">Clinica</p>
            <p className="text-xs leading-tight text-slate-500">San Martin</p>
          </div>
        </div>

        <nav className="flex gap-1 overflow-x-auto px-3 py-3 lg:block lg:space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex min-w-max items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden border-t border-slate-100 px-5 py-4 lg:absolute lg:bottom-0 lg:block lg:w-full">
          <p className="text-xs text-slate-400">Sistema de Turnos v1.0</p>
        </div>
      </aside>

      <main className="min-w-0 flex-1 lg:ml-64">
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
