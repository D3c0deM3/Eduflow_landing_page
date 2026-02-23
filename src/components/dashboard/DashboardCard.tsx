import {
  Users,
  FileCheck,
  Mic,
  TrendingUp,
  Calendar,
  Bell,
  Search,
  Menu,
} from 'lucide-react';

type DashboardCardProps = {
  userInitials?: string;
};

const DashboardCard = ({ userInitials = 'AD' }: DashboardCardProps) => {
  return (
    <div className="glass-card overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
            <Menu className="w-5 h-5 text-eduflow-text-secondary" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-eduflow-cyan to-eduflow-purple flex items-center justify-center">
              <span className="text-eduflow-dark font-bold text-sm">E</span>
            </div>
            <span className="font-semibold text-eduflow-text-primary">EduFlow</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
            <Search className="w-5 h-5 text-eduflow-text-secondary" />
          </button>
          <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors relative">
            <Bell className="w-5 h-5 text-eduflow-text-secondary" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-eduflow-cyan rounded-full" />
          </button>
          <div className="w-8 h-8 rounded-full bg-eduflow-cyan/20 flex items-center justify-center">
            <span className="text-xs font-medium text-eduflow-cyan">
              {userInitials}
            </span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-2 hidden md:block">
            <nav className="space-y-1">
              {[
                { icon: TrendingUp, label: 'Overview', active: true },
                { icon: Users, label: 'CRM', active: false },
                { icon: FileCheck, label: 'Exams', active: false },
                { icon: Mic, label: 'Speaking', active: false },
                { icon: Calendar, label: 'Schedule', active: false },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <button
                    key={i}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      item.active
                        ? 'bg-eduflow-cyan/20 text-eduflow-cyan'
                        : 'text-eduflow-text-secondary hover:bg-white/5 hover:text-eduflow-text-primary'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="col-span-12 md:col-span-10 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Students', value: '1,248', change: '+12%' },
                { label: 'Active Courses', value: '36', change: '+4%' },
                { label: 'Exam Completion', value: '89%', change: '+5%' },
                { label: 'Speaking Score', value: '7.8', change: '+0.3' },
              ].map((stat, i) => (
                <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-xs text-eduflow-text-secondary mb-1">{stat.label}</p>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-bold text-eduflow-text-primary">
                      {stat.value}
                    </span>
                    <span className="text-xs text-green-400 mb-1">{stat.change}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h4 className="text-sm font-medium text-eduflow-text-primary mb-4">
                  Enrollment Funnel
                </h4>
                <div className="space-y-3">
                  {[
                    { label: 'Leads', value: 450, color: 'bg-eduflow-cyan' },
                    { label: 'Contacted', value: 320, color: 'bg-eduflow-cyan/70' },
                    { label: 'Trials', value: 180, color: 'bg-eduflow-purple/70' },
                    { label: 'Enrolled', value: 124, color: 'bg-eduflow-purple' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs text-eduflow-text-secondary w-16">
                        {item.label}
                      </span>
                      <div className="flex-1 h-6 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${item.color} rounded-full`}
                          style={{ width: `${(item.value / 450) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-eduflow-text-primary w-10 text-right">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h4 className="text-sm font-medium text-eduflow-text-primary mb-4">
                  CDI Exam Performance
                </h4>
                <div className="flex items-end justify-between h-32 gap-2">
                  {[65, 78, 82, 75, 88, 92, 85, 90].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full bg-gradient-to-t from-eduflow-cyan/50 to-eduflow-cyan/20 rounded-t"
                        style={{ height: `${h}%` }}
                      />
                      <span className="text-[10px] text-eduflow-text-secondary">
                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'][i]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-eduflow-text-primary">
                  Speaking Progress (CEFR)
                </h4>
                <span className="text-xs text-eduflow-cyan">Live</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { level: 'A1', students: 45, color: 'from-gray-500/50 to-gray-500/20' },
                  { level: 'A2', students: 78, color: 'from-yellow-500/50 to-yellow-500/20' },
                  { level: 'B1', students: 156, color: 'from-blue-500/50 to-blue-500/20' },
                  { level: 'B2+', students: 203, color: 'from-eduflow-cyan/50 to-eduflow-cyan/20' },
                ].map((item, i) => (
                  <div key={i} className="bg-white/5 rounded-lg p-3 text-center">
                    <div
                      className={`w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center`}
                    >
                      <span className="text-sm font-bold">{item.level}</span>
                    </div>
                    <p className="text-lg font-semibold text-eduflow-text-primary">
                      {item.students}
                    </p>
                    <p className="text-xs text-eduflow-text-secondary">students</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;
