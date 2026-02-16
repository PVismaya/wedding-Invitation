import React from 'react';
import { X, UserPlus } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const GuestLoginsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [logins, setLogins] = React.useState<Array<{name:string,phone:string,time:string}>>([]);

  React.useEffect(() => {
    if (!isOpen) return;
    try {
      const raw = localStorage.getItem('guest_logins');
      const list = raw ? JSON.parse(raw) : [];
      setLogins(list);
    } catch {
      setLogins([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white"><UserPlus className="w-5 h-5" /></div>
            <h3 className="text-lg font-black">Guest Logins</h3>
          </div>
          <button onClick={onClose} className="p-2 text-indigo-400 hover:text-indigo-900"><X className="w-5 h-5" /></button>
        </div>

        <div className="space-y-3 max-h-72 overflow-y-auto">
          {logins.length === 0 ? (
            <div className="text-center text-sm text-indigo-400">No guest logins yet.</div>
          ) : (
            logins.slice().reverse().map((g, i) => (
              <div key={i} className="p-3 rounded-xl border border-indigo-50 flex items-center justify-between">
                <div>
                  <div className="font-black text-indigo-900">{g.name || '—'}</div>
                  <div className="text-xs text-indigo-400">{g.phone}</div>
                </div>
                <div className="text-xs text-indigo-300">{new Date(g.time).toLocaleString()}</div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default GuestLoginsModal;
