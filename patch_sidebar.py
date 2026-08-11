import re

with open("src/App.tsx", "r") as f:
    content = f.read()

sidebar_search = """            <button 
              id="tab-settings"
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'settings' 
                  ? isAmber ? 'bg-amber-500 text-black shadow-md font-bold' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-gray-400 hover:bg-slate-800/30 hover:text-white'
              }`}
            >
              <span className="text-sm">⚙</span> Engine Configuration
            </button>
          </div>"""

sidebar_replace = """            <button 
              id="tab-settings"
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'settings' 
                  ? isAmber ? 'bg-amber-500 text-black shadow-md font-bold' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-gray-400 hover:bg-slate-800/30 hover:text-white'
              }`}
            >
              <span className="text-sm">⚙</span> Engine Configuration
            </button>
            {user && (
              <button 
                id="tab-profile"
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'profile' 
                    ? isAmber ? 'bg-amber-500 text-black shadow-md font-bold' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-gray-400 hover:bg-slate-800/30 hover:text-white'
                }`}
              >
                <UserCircle size={16} className="text-gray-400 group-hover:text-white" /> Security Profile
              </button>
            )}
          </div>"""

if sidebar_search in content:
    content = content.replace(sidebar_search, sidebar_replace)
    with open("src/App.tsx", "w") as f:
        f.write(content)
    print("Sidebar patched successfully.")
else:
    print("Sidebar search failed.")
