const hiddenKeys = new Set(['dp', 'name', 'code', 'isActive']);

const formatKey = (key) => key.replace(/([A-Z])/g, ' $1').replace(/^./, (char) => char.toUpperCase());

const formatValue = (value) => {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  if (value instanceof Date) {
    return value.toLocaleString();
  }

  return String(value);
};

const UserDetails = ({ user }) => {
  const entries = Object.entries(user || {}).filter(([key]) => !hiddenKeys.has(key));

  if (!entries.length) {
    return null;
  }

  return (
    <section className="bg-[#0B0B0B] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
      <header className="px-6 py-4 border-b border-white/5 bg-gradient-to-r from-white/5 via-transparent to-transparent">
        <h3 className="text-lg font-semibold tracking-tight">User Details</h3>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 border-t border-white/5 divide-y divide-white/5 md:divide-y-0 md:divide-x">
        {entries.map(([key, value]) => (
          <div key={key} className="px-6 py-5 bg-[#101010] flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wide text-gray-400">{formatKey(key)}</span>
            <span className="text-sm text-gray-100 break-words leading-relaxed">{formatValue(value)}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default UserDetails;
