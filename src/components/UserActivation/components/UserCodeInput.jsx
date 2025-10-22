const UserCodeInput = ({ userCode, setUserCode, onSubmit, loading }) => (
  <form onSubmit={onSubmit} className="mb-8">
    <label htmlFor="userCode" className="block text-sm font-medium text-gray-300 mb-3">
      Enter User Code
    </label>
    <div className="flex flex-col gap-4 md:flex-row">
      <div className="relative flex-1">
        <input
          id="userCode"
          type="text"
          value={userCode}
          onChange={(e) => setUserCode(e.target.value)}
          className="w-full px-5 py-3 bg-[#141414] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
          placeholder="Enter user code"
          disabled={loading}
          autoComplete="off"
          autoFocus
        />
      </div>
      <button
        type="submit"
        disabled={loading || !userCode.trim()}
        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition-transform transform hover:-translate-y-0.5"
      >
        {loading ? 'Searching...' : 'Find User'}
      </button>
    </div>
  </form>
);

export default UserCodeInput;
