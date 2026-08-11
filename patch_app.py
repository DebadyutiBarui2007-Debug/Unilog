import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# Add UserCircle to imports
content = content.replace("import { Loader2, Image as ImageIcon, LogIn, LogOut, CheckCircle, AlertOctagon, Copy, Check, Sparkles, ChevronDown, ChevronRight, ShieldCheck, Database, Layers, GitCompare, Edit2, Plus, Trash2, Save, X, Type, RefreshCw, BrainCircuit, Palette, Search, Filter, BookOpen, HelpCircle, Activity } from 'lucide-react';",
                          "import { Loader2, Image as ImageIcon, LogIn, LogOut, CheckCircle, AlertOctagon, Copy, Check, Sparkles, ChevronDown, ChevronRight, ShieldCheck, Database, Layers, GitCompare, Edit2, Plus, Trash2, Save, X, Type, RefreshCw, BrainCircuit, Palette, Search, Filter, BookOpen, HelpCircle, Activity, UserCircle } from 'lucide-react';")

# Add ProfileTab import
content = content.replace("import { SystemHealthDashboard } from './components/SystemHealthDashboard';",
                          "import { SystemHealthDashboard } from './components/SystemHealthDashboard';\nimport { ProfileTab } from './components/ProfileTab';")

# Update Tab type
content = content.replace("type Tab = 'pipeline' | 'batch' | 'history' | 'settings' | 'ai-tools' | 'recursive-ml' | 'system-health';",
                          "type Tab = 'pipeline' | 'batch' | 'history' | 'settings' | 'ai-tools' | 'recursive-ml' | 'system-health' | 'profile';")

# Add Profile tab to Sidebar
sidebar_search = """              <button
                id="tab-settings"
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all ${
                  activeTab === 'settings' 
                    ? themeStyles.accentBtn
                    : `${themeStyles.textMuted} hover:${themeStyles.textMain} hover:bg-slate-800/30`
                }`}
              >
                <Database size={18} /> Settings
              </button>
            </nav>"""

sidebar_replace = """              <button
                id="tab-settings"
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all ${
                  activeTab === 'settings' 
                    ? themeStyles.accentBtn
                    : `${themeStyles.textMuted} hover:${themeStyles.textMain} hover:bg-slate-800/30`
                }`}
              >
                <Database size={18} /> Settings
              </button>
              
              {user && (
                <button
                  id="tab-profile"
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all ${
                    activeTab === 'profile' 
                      ? themeStyles.accentBtn
                      : `${themeStyles.textMuted} hover:${themeStyles.textMain} hover:bg-slate-800/30`
                  }`}
                >
                  <UserCircle size={18} /> Profile
                </button>
              )}
            </nav>"""

if sidebar_search in content:
    content = content.replace(sidebar_search, sidebar_replace)
else:
    print("Sidebar search failed")

# Add Profile Tab rendering
render_search = """        {activeTab === 'system-health' && (
          <SystemHealthDashboard 
            isAmber={isAmber} 
            isDark={!isLight} 
          />
        )}"""

render_replace = """        {activeTab === 'system-health' && (
          <SystemHealthDashboard 
            isAmber={isAmber} 
            isDark={!isLight} 
          />
        )}

        {activeTab === 'profile' && user && (
          <ProfileTab 
            user={user}
            themeStyles={themeStyles}
            isLight={isLight}
            isAmber={isAmber}
          />
        )}"""

if render_search in content:
    content = content.replace(render_search, render_replace)
else:
    print("Render search failed")

# Change top right user info
top_user_search = """          {user ? (
            <div className="flex items-center gap-3">
              <span className={`text-xs font-mono px-2.5 py-1 rounded-lg border ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-800/40 border-slate-700/50'} ${themeStyles.textMuted}`}>{user.email}</span>
              <button onClick={logout} className="text-gray-400 hover:text-red-400 p-1.5 transition-colors" title="Sign Out">
                <LogOut size={16} />
              </button>
            </div>
          ) : ("""

top_user_replace = """          {user ? (
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-2 text-xs font-mono px-2.5 py-1 rounded-lg border hover:bg-slate-500/10 transition-colors ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-800/40 border-slate-700/50'} ${themeStyles.textMuted}`}
              >
                <UserCircle size={14} />
                {user.displayName || user.email}
              </button>
            </div>
          ) : ("""

if top_user_search in content:
    content = content.replace(top_user_search, top_user_replace)
else:
    print("Top user search failed")
    
# Change login from googleProvider to a button that triggers AuthGate manually if they want to sign in later?
# The user can just click "Sign In" and we open AuthGate.
# Wait, AuthGate only shows if `!user && !authSkipped`. Let's allow triggering AuthGate manually.

login_search = """          ) : (
            <button onClick={login} className={`flex items-center gap-2 border ${themeStyles.cardBg} px-3.5 py-1.5 text-xs font-semibold rounded-lg uppercase tracking-wider hover:opacity-80 transition-all`}>
              <LogIn size={14} /> Sign In
            </button>
          )}"""

login_replace = """          ) : (
            <button onClick={() => setAuthSkipped(false)} className={`flex items-center gap-2 border ${themeStyles.cardBg} px-3.5 py-1.5 text-xs font-semibold rounded-lg uppercase tracking-wider hover:opacity-80 transition-all`}>
              <LogIn size={14} /> Sign In
            </button>
          )}"""

if login_search in content:
    content = content.replace(login_search, login_replace)
else:
    print("Login search failed")

# Fix AuthGate props. AuthGate no longer uses `login` from props, it uses `onSuccess`
authgate_search = """          <AuthGate 
            login={login} 
            onSkip={() => setAuthSkipped(true)} 
            themeStyles={themeStyles} 
            isLight={isLight} 
            isAmber={isAmber} 
          />"""

authgate_replace = """          <AuthGate 
            onSuccess={() => setAuthSkipped(true)} 
            onSkip={() => setAuthSkipped(true)} 
            themeStyles={themeStyles} 
            isLight={isLight} 
            isAmber={isAmber} 
          />"""

if authgate_search in content:
    content = content.replace(authgate_search, authgate_replace)
else:
    print("Authgate search failed")

with open("src/App.tsx", "w") as f:
    f.write(content)
print("Done patching App.tsx")
