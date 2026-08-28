const hiddenKeys = new Set(['dp', 'password', 'jwt', 'otp']);

const formatKey = (key) => key.replace(/([A-Z])/g, ' $1').replace(/^./, (char) => char.toUpperCase());

const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

const formatValue = (value) => {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  if (value instanceof Date) {
    return formatDate(value);
  }

  if (Array.isArray(value)) {
    return value.length ? `${value.length} item(s)` : '—';
  }

  if (typeof value === 'object') {
    return '—';
  }

  return String(value);
};

const DevicesTable = ({ devices }) => {
  if (!devices?.length) return null;

  return (
    <div className="border-t border-white/5 p-4 sm:p-6">
      <h4 className="text-sm font-semibold text-white mb-4">Linked Devices</h4>
      <div className="overflow-x-auto responsive-table-scroll rounded-xl border border-white/5">
        <p className="scroll-table-hint lg:hidden">Swipe to see more columns →</p>
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wide border-b border-white/5">
              <th className="px-5 py-3.5 text-center font-medium whitespace-nowrap">ID</th>
              <th className="px-5 py-3.5 text-center font-medium whitespace-nowrap">User Code</th>
              <th className="px-5 py-3.5 text-center font-medium whitespace-nowrap min-w-[140px]">Device ID</th>
              <th className="px-5 py-3.5 text-center font-medium whitespace-nowrap">Login At</th>
              <th className="px-5 py-3.5 text-center font-medium whitespace-nowrap">Logged Out</th>
              <th className="px-5 py-3.5 text-center font-medium whitespace-nowrap">Active</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-gray-200">
            {devices.map((device) => (
              <tr key={device.id ?? device.deviceId} className="hover:bg-white/[0.02]">
                <td className="px-5 py-3.5 text-center">{device.id ?? '—'}</td>
                <td className="px-5 py-3.5 text-center font-mono text-xs">{device.usercode ?? '—'}</td>
                <td className="px-5 py-3.5 text-center font-mono text-xs break-all">
                  {device.deviceId ?? device.deviceid ?? '—'}
                </td>
                <td className="px-5 py-3.5 text-center whitespace-nowrap">{formatDate(device.loginAt)}</td>
                <td className="px-5 py-3.5 text-center whitespace-nowrap">
                  {device.loggedOutAt ? formatDate(device.loggedOutAt) : '—'}
                </td>
                <td className="px-5 py-3.5 text-center">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      device.active ? 'bg-green-500/10 text-green-400' : 'bg-gray-500/10 text-gray-400'
                    }`}
                  >
                    {device.active ? 'Yes' : 'No'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const UserDetails = ({ user }) => {
  if (!user) return null;

  const devices = Array.isArray(user.devices) ? user.devices : [];
  const entries = Object.entries(user).filter(
    ([key, value]) =>
      !hiddenKeys.has(key) &&
      key !== 'devices' &&
      typeof value !== 'object' &&
      !Array.isArray(value),
  );

  return (
    <section className="bg-[#0B0B0B] border border-white/5 rounded-2xl overflow-hidden shadow-2xl max-w-full min-w-0">
      <header className="px-4 sm:px-6 py-4 border-b border-white/5 bg-gradient-to-r from-white/5 via-transparent to-transparent">
        <h3 className="text-lg font-semibold tracking-tight">User Details</h3>
      </header>

      {entries.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 border-t border-white/5 divide-y md:divide-y-0 md:divide-x divide-white/5">
          {entries.map(([key, value]) => (
            <div key={key} className="px-4 sm:px-6 py-4 sm:py-5 bg-[#101010] flex flex-col gap-1 min-w-0">
              <span className="text-xs uppercase tracking-wide text-gray-400">{formatKey(key)}</span>
              <span className="text-sm text-gray-100 break-words leading-relaxed">{formatValue(value)}</span>
            </div>
          ))}
        </div>
      )}

      <DevicesTable devices={devices} />
    </section>
  );
};

export default UserDetails;
