import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { doc, setDoc, onSnapshot, updateDoc, deleteDoc, getDoc, arrayUnion } from 'firebase/firestore';
import { 
  Wallet, Landmark, History, LogOut, ShieldAlert, Users, CarFront, Ship, Dog, Cat, 
  Copy, PlusCircle, LogIn, LayoutGrid, Volume2, VolumeX, RefreshCw, EyeOff, 
  PiggyBank, CalendarClock, Briefcase, HandCoins, TrendingUp, AlertTriangle, 
  Skull, ArrowRightLeft, XCircle, CheckCircle2, Sparkles 
} from 'lucide-react';

// --- CONFIG ---
const INITIAL_BANK_BALANCE = 50000000; 
const INITIAL_PLAYER_BALANCE = 150000; 
const GO_SALARY = 20000; 
const MAX_LOAN_LIMIT = 100000;

const IMAGES = { logo: 'https://i.ibb.co/3yjXmptX/arayuz-ekrani.png' };
const THEME = { bg: "bg-slate-950", card: "bg-slate-900", primary: "bg-teal-600", secondary: "bg-fuchsia-700", text: "text-slate-100", muted: "text-slate-400", gold: "text-amber-400", danger: "text-red-500" };
const SOUNDS = { send: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3', receive: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3', turn: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3', alarm: 'https://assets.mixkit.co/active_storage/sfx/2865/2865-preview.mp3', fail: 'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3' };

const GAME_TOKENS = [
  { id: 'cat', label: 'Kedi', icon: <Cat className="w-6 h-6" />, img: 'https://i.ibb.co/BDXR3SS/kedi.png' },
  { id: 'shoe', label: 'Ayakkabı', icon: <span className="text-2xl">👢</span>, img: 'https://i.ibb.co/C32qGbH0/ayakkabi.png' },
  { id: 'barrow', label: 'El Arabası', icon: <span className="text-2xl">🛒</span>, img: 'https://i.ibb.co/27KZmG6K/el-arabasi.png' },
  { id: 'iron', label: 'Ütü', icon: <span className="text-2xl">♨️</span>, img: 'https://i.ibb.co/B5zqZYjy/utu.png' },
  { id: 'ring', label: 'Yüzük', icon: <span className="text-2xl">💍</span>, img: 'https://i.ibb.co/Wp7m4w89/yuzuk.png' },
  { id: 'car', label: 'Araba', icon: <CarFront className="w-6 h-6" />, img: 'https://i.ibb.co/mrV22PcN/araba.png' },
  { id: 'dog', label: 'Köpek', icon: <Dog className="w-6 h-6" />, img: 'https://i.ibb.co/PssTbQpH/kopek.png' },
  { id: 'ship', label: 'Gemi', icon: <Ship className="w-6 h-6" />, img: 'https://i.ibb.co/hJdvwsGZ/gemi.png' },
  { id: 'hat', label: 'Şapka', icon: <span className="text-2xl">🎩</span>, img: 'https://i.ibb.co/XfV5zdq9/sapka.png' },
];

export default function App() {
  const [view, setView] = useState('welcome'); 
  const [user, setUser] = useState(null);
  const [notification, setNotification] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [gameState, setGameState] = useState({ code: '', bankBalance: INITIAL_BANK_BALANCE, players: [], transactions: [] });

  // --- FIREBASE SYNC ---
  useEffect(() => {
    if (gameState.code) {
      const unsub = onSnapshot(doc(db, "games", gameState.code), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setGameState(data);
          if (user) {
            const updatedMe = data.players.find(p => p.id === user.id);
            if (updatedMe) setUser(updatedMe);
          }
        }
      });
      return () => unsub();
    }
  }, [gameState.code, user?.id]);

  const showNotification = (msg, type) => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const playSound = (type) => {
    if (!soundEnabled) return;
    try { new Audio(SOUNDS[type]).play().catch(() => {}); } catch (e) {}
  };

  const calculateDebt = (principal, startTurn, currentTurn) => {
    if (principal <= 0) return 0;
    const turnsPassed = currentTurn - startTurn;
    let interestRate = turnsPassed >= 2 ? (turnsPassed - 1) * 25 : 0;
    return Math.floor(principal + (principal * interestRate / 100));
  };

  // --- ACTIONS ---
  const createGame = async (hostName, token) => {
    const newCode = Math.floor(1000 + Math.random() * 9000).toString();
    const hostPlayer = { id: Date.now(), name: hostName, balance: INITIAL_PLAYER_BALANCE, turn: 1, savings: 0, savingsStartTurn: 0, debt: 0, debtLenderId: null, debtStartTurn: 0, token: token, isHost: true };
    const newState = {
      code: newCode,
      bankBalance: INITIAL_BANK_BALANCE - INITIAL_PLAYER_BALANCE,
      players: [hostPlayer],
      transactions: [{ id: Date.now(), from: 'SİSTEM', to: 'HERKES', amount: 0, type: 'OYUN KURULDU', time: new Date().toLocaleTimeString() }]
    };
    await setDoc(doc(db, "games", newCode), newState);
    setUser(hostPlayer);
    setGameState(newState);
    setView('game');
    playSound('receive');
    showNotification(`Oyun kuruldu! Kod: ${newCode}`, 'success');
  };

  const joinGame = async (code, playerName, token) => {
    const gameRef = doc(db, "games", code);
    const docSnap = await getDoc(gameRef);

    if (!docSnap.exists()) return showNotification('Oyun kodu bulunamadı!', 'error');

    const data = docSnap.data();
    const existingPlayer = data.players.find(p => p.name.toLowerCase() === playerName.toLowerCase());

    if (existingPlayer) {
      setUser(existingPlayer);
      setGameState({ ...data });
      setView('game');
    } else {
      const newPlayer = { id: Date.now(), name: playerName, balance: INITIAL_PLAYER_BALANCE, turn: 1, savings: 0, savingsStartTurn: 0, debt: 0, debtLenderId: null, debtStartTurn: 0, token: token, isHost: false };
      await updateDoc(gameRef, {
        players: arrayUnion(newPlayer),
        bankBalance: data.bankBalance - INITIAL_PLAYER_BALANCE,
        transactions: [{ id: Date.now(), from: 'BANKA', to: playerName, amount: INITIAL_PLAYER_BALANCE, type: 'GİRİŞ BONUSU', time: new Date().toLocaleTimeString() }, ...data.transactions]
      });
      setUser(newPlayer);
      setGameState({ ...data, code });
      setView('game');
    }
    playSound('receive');
  };

  const handleTransaction = async (fromId, toId, amount, type) => {
    const amt = parseInt(amount);
    if (!amt || amt <= 0) return showNotification('Geçersiz tutar.', 'error');

    const newPlayers = gameState.players.map(p => ({ ...p }));
    const sender = fromId === 'BANKA' ? null : newPlayers.find(p => p.id === fromId);
    const receiver = toId === 'BANKA' ? null : newPlayers.find(p => p.id === toId);

    if (sender && sender.balance < amt) return showNotification('Yetersiz bakiye!', 'error');

    if (sender) sender.balance -= amt;
    if (receiver) receiver.balance += amt;

    let newBank = gameState.bankBalance;
    if (fromId === 'BANKA') newBank -= amt;
    if (toId === 'BANKA') newBank += amt;

    await updateDoc(doc(db, "games", gameState.code), {
      players: newPlayers,
      bankBalance: newBank,
      transactions: [{ id: Date.now(), from: fromId === 'BANKA' ? 'BANKA' : sender.name, to: toId === 'BANKA' ? 'BANKA' : receiver.name, amount: amt, type, time: new Date().toLocaleTimeString() }, ...gameState.transactions]
    });
    playSound(user.id === fromId ? 'send' : 'receive');
    showNotification('İşlem Başarılı', 'success');
  };

  const handleSalary = async (playerId) => {
    const newPlayers = gameState.players.map(p => {
      if (p.id === playerId) return { ...p, balance: p.balance + GO_SALARY, turn: p.turn + 1 };
      return p;
    });
    const pName = gameState.players.find(p => p.id === playerId).name;
    await updateDoc(doc(db, "games", gameState.code), {
      players: newPlayers,
      bankBalance: gameState.bankBalance - GO_SALARY,
      transactions: [{ id: Date.now(), from: 'BANKA', to: pName, amount: GO_SALARY, type: `MAAŞ`, time: new Date().toLocaleTimeString() }, ...gameState.transactions]
    });
    playSound('turn');
  };

  const handleLoan = async (lenderId, borrowerId, amount) => {
    const amt = parseInt(amount);
    const newPlayers = gameState.players.map(p => ({ ...p }));
    const borrower = newPlayers.find(p => p.id === borrowerId);
    let newBank = gameState.bankBalance;

    if (lenderId !== 'BANKA') {
      const lender = newPlayers.find(p => p.id === lenderId);
      if (lender.balance < amt) return showNotification('Bakiye yetersiz!', 'error');
      lender.balance -= amt;
    } else { newBank -= amt; }

    borrower.balance += amt;
    borrower.debt = amt;
    borrower.debtLenderId = lenderId;
    borrower.debtStartTurn = borrower.turn;

    await updateDoc(doc(db, "games", gameState.code), {
      players: newPlayers,
      bankBalance: newBank,
      transactions: [{ id: Date.now(), from: 'BORÇ', to: borrower.name, amount: amt, type: 'KREDİ', time: new Date().toLocaleTimeString() }, ...gameState.transactions]
    });
  };

  const payDebt = async (playerId) => {
    const newPlayers = gameState.players.map(p => ({ ...p }));
    const player = newPlayers.find(p => p.id === playerId);
    const currentDebt = calculateDebt(player.debt, player.debtStartTurn, player.turn);
    let newBank = gameState.bankBalance;

    if (player.balance < currentDebt) return showNotification('Para yetersiz!', 'error');

    if (player.debtLenderId !== 'BANKA') {
      const lender = newPlayers.find(p => p.id === player.debtLenderId);
      if (lender) lender.balance += currentDebt;
    } else { newBank += currentDebt; }

    player.balance -= currentDebt;
    player.debt = 0;

    await updateDoc(doc(db, "games", gameState.code), {
      players: newPlayers,
      bankBalance: newBank,
      transactions: [{ id: Date.now(), from: player.name, to: 'BANKA', amount: currentDebt, type: 'BORÇ KAPATMA', time: new Date().toLocaleTimeString() }, ...gameState.transactions]
    });
  };

  const handleBankruptcy = async (playerId, beneficiaryId) => {
    const player = gameState.players.find(p => p.id === playerId);
    const total = player.balance + player.savings;
    const remaining = gameState.players.filter(p => p.id !== playerId).map(p => {
      if (p.id === Number(beneficiaryId)) return { ...p, balance: p.balance + total };
      return p;
    });
    let newBank = gameState.bankBalance;
    if (beneficiaryId === 'BANKA') newBank += total;

    await updateDoc(doc(db, "games", gameState.code), {
      players: remaining,
      bankBalance: newBank,
      transactions: [{ id: Date.now(), from: player.name, to: 'İFLAS', amount: total, type: 'ÇIKIŞ', time: new Date().toLocaleTimeString() }, ...gameState.transactions]
    });
    playSound('fail');
  };

  const handleSavings = async (playerId, amount, action) => {
    const amt = parseInt(amount);
    const newPlayers = gameState.players.map(p => ({ ...p }));
    const player = newPlayers.find(p => p.id === playerId);
    let newBank = gameState.bankBalance;

    if (action === 'DEPOSIT') {
      if (player.balance < amt) return showNotification('Bakiye yetersiz!', 'error');
      player.balance -= amt;
      player.savings += amt;
      player.savingsStartTurn = player.turn;
    } else {
      const diff = player.turn - player.savingsStartTurn;
      let rate = (diff >= 5 && diff % 5 === 0) ? Math.min(Math.floor(diff / 5) * 10, 100) : 0;
      const interest = Math.floor(player.savings * (rate / 100));
      player.balance += (player.savings + interest);
      player.savings = 0;
      newBank -= interest;
    }
    await updateDoc(doc(db, "games", gameState.code), { players: newPlayers, bankBalance: newBank });
  };

  return (
    <div className={`min-h-screen ${THEME.bg} ${THEME.text} font-sans pb-24 touch-manipulation`}>
      {notification && (
        <div className={`fixed top-4 left-4 right-4 z-[100] px-4 py-3 rounded-xl shadow-2xl border text-center font-bold ${notification.type === 'error' ? 'bg-red-900 border-red-500' : 'bg-teal-600 border-teal-400'}`}>
          {notification.msg}
        </div>
      )}
      {view === 'welcome' ? (
        <WelcomeScreen onCreateGame={createGame} onJoinGame={joinGame} existingGame={gameState.code} />
      ) : (
        <MainGameInterface 
          user={user} gameState={gameState} handleTransaction={handleTransaction}
          handleSalary={handleSalary} handleSavings={handleSavings} handleLoan={handleLoan}
          handleBankruptcy={handleBankruptcy} payDebt={payDebt} onLogout={() => {setUser(null); setView('welcome');}}
          onReset={async () => { if(window.confirm('Oyun sıfırlanacak. Emin misin?')) { await deleteDoc(doc(db, "games", gameState.code)); window.location.reload(); } }}
          soundEnabled={soundEnabled} toggleSound={() => setSoundEnabled(!soundEnabled)} calculateDebt={calculateDebt}
        />
      )}
    </div>
  );
}

// --- EKRANLAR ---
function WelcomeScreen({ onCreateGame, onJoinGame, existingGame }) {
  const [mode, setMode] = useState('menu'); 
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [selectedToken, setSelectedToken] = useState(null);

  const TokenSelector = () => (
    <div className="grid grid-cols-4 gap-3 mb-6">
      {GAME_TOKENS.map((token) => (
        <button
          key={token.id}
          onClick={() => setSelectedToken(token.id)}
          className={`aspect-square flex flex-col items-center justify-center rounded-xl border transition-all relative overflow-hidden bg-slate-800 ${
            selectedToken === token.id ? 'border-teal-400 ring-2 ring-teal-500/50 scale-105' : 'border-slate-700 opacity-80'
          }`}
        >
          {token.img ? <img src={token.img} alt="" className="w-full h-full object-cover" /> : token.icon}
        </button>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col items-center min-h-screen p-6 bg-slate-950">
      <div className="mt-12 mb-8 text-center space-y-4">
        <div className="w-24 h-24 bg-gradient-to-tr from-teal-500 to-emerald-600 rounded-3xl flex items-center justify-center shadow-2xl mx-auto rotate-6 border-2 border-slate-700/50">
            <Sparkles className="w-12 h-12 text-white" />
        </div>
        <div>
            <h2 className="text-xl font-medium text-slate-400 italic font-serif">Herkeşe Benden</h2>
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 tracking-tighter">ŞIPRAYT</h1>
        </div>
      </div>
      <div className="w-full max-w-sm">
        {mode === 'menu' ? (
          <div className="space-y-4">
            <button onClick={() => setMode('create')} className="w-full bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col items-center gap-3 active:scale-95 shadow-xl transition-all">
              <PlusCircle className="text-teal-400 w-8 h-8" />
              <div className="text-center font-bold text-lg text-white">Yeni Oyun Kur</div>
            </button>
            <button onClick={() => setMode('join')} className="w-full bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col items-center gap-3 active:scale-95 shadow-xl transition-all">
              <LogIn className="text-fuchsia-400 w-8 h-8" />
              <div className="text-center font-bold text-lg text-white">Oyuna Katıl</div>
            </button>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 animate-in zoom-in-95">
             <div className="flex justify-between items-center mb-2">
                <h3 className="text-white font-bold">{mode === 'create' ? 'Kurucu Girişi' : 'Oyuna Katıl'}</h3>
                <XCircle onClick={() => setMode('menu')} className="text-slate-500 cursor-pointer" />
             </div>
             {mode === 'join' && <input type="number" value={code} onChange={e => setCode(e.target.value)} placeholder="Oyun Kodu" className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white text-center text-2xl font-mono" />}
             <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="İsminiz" className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white text-center" />
             <TokenSelector />
             <button onClick={() => mode === 'create' ? onCreateGame(name, selectedToken) : onJoinGame(code, name, selectedToken)} disabled={!name || !selectedToken} className="w-full bg-teal-600 p-4 rounded-xl font-bold shadow-lg text-white disabled:opacity-50 uppercase tracking-widest">BAŞLAT</button>
          </div>
        )}
      </div>
    </div>
  );
}

function MainGameInterface(props) {
  const { user, gameState, handleTransaction, handleSalary, handleSavings, handleLoan, handleBankruptcy, payDebt, onReset, soundEnabled, toggleSound, calculateDebt } = props;
  const [activeTab, setActiveTab] = useState('wallet');

  return (
    <>
      <div className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 p-4 flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
              <img src={IMAGES.logo} className="w-10 h-10 rounded-lg border border-slate-700" alt="logo" />
              <div className="flex flex-col"><span className="text-[10px] text-slate-500 font-bold">KOD:</span><span className="font-mono font-bold text-white leading-none tracking-widest">{gameState.code}</span></div>
          </div>
          <div className="flex items-center gap-2">
              <button onClick={toggleSound} className="p-2 bg-slate-900 rounded-full text-slate-400">{soundEnabled ? <Volume2 size={18}/> : <VolumeX size={18}/>}</button>
              <div className="w-10 h-10 bg-slate-800 rounded-full border-2 border-slate-700 overflow-hidden relative shadow-inner">
                {GAME_TOKENS.find(t => t.id === user.token)?.img ? <img src={GAME_TOKENS.find(t => t.id === user.token).img} className="w-full h-full object-cover" alt="" /> : GAME_TOKENS.find(t => t.id === user.token)?.icon}
                <div className="absolute bottom-0 right-0 bg-teal-600 text-[8px] px-1 rounded-full text-white font-bold border border-slate-950">T{user.turn}</div>
              </div>
              {user.isHost && <button onClick={onReset} className="p-2 bg-red-900/20 text-red-500 rounded-full border border-red-900/30"><LogOut size={18}/></button>}
          </div>
      </div>

      <div className="bg-slate-900 border-b border-slate-800 py-2 px-4 flex justify-between items-center text-xs shadow-inner">
          <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider flex items-center gap-1"><Landmark size={12}/> Merkez Bankası</span>
          <span className="font-mono text-teal-400 text-sm font-bold tracking-tighter">{gameState.bankBalance.toLocaleString()} TL</span>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        {activeTab === 'wallet' && (
          <div className="space-y-6 animate-in fade-in pb-20">
            <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl text-center relative overflow-hidden ring-1 ring-slate-700/50">
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-3xl"></div>
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">Mevcut Bakiye</span>
              <div className="text-5xl font-black mt-2 tracking-tighter text-white font-mono">{user.balance.toLocaleString()} <span className="text-teal-500 text-2xl font-medium">TL</span></div>
              <div className="mt-4 text-[9px] text-slate-500 font-bold uppercase border-t border-slate-800 pt-3">Maaş ödemeleri bankacı tarafından yapılır</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <button onClick={() => { const a = prompt('Tutar:'); if(a) handleTransaction(user.id, 'BANKA', a, 'ÖDEME') }} className="bg-slate-900 border border-red-900/20 p-6 rounded-3xl flex flex-col items-center gap-3 active:scale-95 transition-all shadow-lg hover:bg-red-950/10">
                  <div className="p-4 bg-red-500/10 rounded-full text-red-500 border border-red-500/20"><Landmark size={32}/></div>
                  <span className="font-bold text-red-200">Bankaya Öde</span>
               </button>
               <button onClick={() => { const target = prompt('Oyuncu İsmi:'); const a = prompt('Tutar:'); if(target && a) { const p = gameState.players.find(pl => pl.name.toLowerCase() === target.toLowerCase()); if(p) handleTransaction(user.id, p.id, a, 'KİRA'); else alert('Oyuncu bulunamadı!'); } }} className="bg-slate-900 border border-fuchsia-900/30 p-6 rounded-3xl flex flex-col items-center gap-3 active:scale-95 transition-all shadow-lg hover:bg-fuchsia-950/10">
                  <div className="p-4 bg-fuchsia-500/10 rounded-full text-fuchsia-500 border border-fuchsia-500/20"><Users size={32}/></div>
                  <span className="font-bold text-fuchsia-200">Kira Öde</span>
               </button>
            </div>
            <button onClick={() => { const target = prompt('Varlıkları Kime Devret (İsim yazın veya BANKA):'); if(target) { if(target.toUpperCase()==='BANKA') handleBankruptcy(user.id, 'BANKA'); else { const p = gameState.players.find(pl => pl.name.toLowerCase() === target.toLowerCase()); if(p) handleBankruptcy(user.id, p.id); else alert('Bulunamadı!'); } } }} className="w-full bg-slate-900 border border-red-900/30 text-red-600/70 py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest mt-8 hover:bg-red-950/30 hover:text-red-500 transition-colors"><Skull size={16}/> İflas Bayrağı Çek</button>
          </div>
        )}

        {activeTab === 'finance' && (
            <div className="space-y-4 animate-in fade-in pb-20">
              <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
                <h3 className="text-amber-500 font-bold flex items-center gap-2 mb-4 tracking-widest uppercase text-xs"><PiggyBank size={18}/> Vadeli Hesap</h3>
                <div className="flex justify-between items-center bg-slate-950 p-4 rounded-2xl mb-4 border border-slate-800 shadow-inner">
                    <span className="text-sm text-slate-400 font-bold">Toplam Birikim:</span>
                    <span className="font-mono font-bold text-xl text-white tracking-tighter">{user.savings.toLocaleString()} TL</span>
                </div>
                <button onClick={() => { const a = prompt('Yatırılacak Tutar:'); if(a) handleSavings(user.id, a, 'DEPOSIT') }} className="w-full bg-amber-600 p-4 rounded-xl font-bold mb-2 text-white shadow-lg active:scale-95 transition-all">PARA YATIR</button>
                <button onClick={() => handleSavings(user.id, 0, 'WITHDRAW')} className="w-full bg-slate-800 p-4 rounded-xl font-bold text-slate-300 border border-slate-700 active:scale-95 transition-all">HESABI BOZ & ÇEK</button>
              </div>
              <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
                <h3 className="text-red-500 font-bold flex items-center gap-2 mb-4 tracking-widest uppercase text-xs"><HandCoins size={18}/> Borç Durumu</h3>
                <div className="flex justify-between items-center bg-slate-950 p-4 rounded-2xl mb-4 border border-slate-800 shadow-inner">
                    <span className="text-sm text-slate-400 font-bold">Güncel Borç (Faizli):</span>
                    <span className="font-mono font-bold text-xl text-red-400 tracking-tighter">{calculateDebt(user.debt, user.debtStartTurn, user.turn).toLocaleString()} TL</span>
                </div>
                <button onClick={() => payDebt(user.id)} className="w-full bg-white text-red-900 p-4 rounded-xl font-bold shadow-lg active:scale-95 transition-all uppercase">BORCU KAPAT</button>
              </div>
            </div>
        )}

        {activeTab === 'bank' && user.isHost && (
          <div className="space-y-4 animate-in fade-in pb-20">
             <div className="bg-gradient-to-r from-amber-600 to-orange-500 p-4 rounded-2xl text-white font-bold flex items-center gap-2 shadow-lg tracking-widest"><ShieldAlert /> BANKACI PANELİ</div>
             {gameState.players.map(p => (
               <div key={p.id} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex justify-between items-center hover:border-slate-600 transition-all shadow-md">
                  <div className="flex items-center gap-3">
                     <div className="w-12 h-12 bg-slate-800 rounded-full overflow-hidden flex items-center justify-center border border-slate-700 shadow-inner">
                        {GAME_TOKENS.find(t => t.id === p.token)?.img ? <img src={GAME_TOKENS.find(t => t.id === p.token).img} className="w-full h-full object-cover" alt="" /> : p.name[0]}
                     </div>
                     <div>
                        <div className="font-bold text-white text-sm flex items-center gap-1">{p.name} {p.id === user.id && <span className="text-[8px] bg-slate-800 px-1 border border-slate-700 rounded text-slate-500">SENSİN</span>}</div>
                        <div className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-tight">TUR {p.turn} • {p.balance.toLocaleString()} TL</div>
                     </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleSalary(p.id)} className="bg-emerald-600 px-3 py-2 rounded-lg font-bold text-[10px] text-white shadow-md active:scale-90 transition-all uppercase">Maaş</button>
                    <button onClick={() => { const a = prompt('Kredi Tutarı:'); if(a) handleLoan('BANKA', p.id, a) }} className="bg-red-600 px-3 py-2 rounded-lg font-bold text-[10px] text-white shadow-md active:scale-90 transition-all uppercase">Kredi</button>
                  </div>
               </div>
             ))}
          </div>
        )}

        {activeTab === 'feed' && (
           <div className="space-y-3 animate-in fade-in pb-24">
              <h3 className="text-xs text-slate-500 font-bold uppercase tracking-widest pl-2 mb-2">Son Hareketler</h3>
              {gameState.transactions.length === 0 ? (
                <div className="text-center py-10 text-slate-600 text-sm italic">Henüz işlem yapılmadı</div>
              ) : gameState.transactions.map(t => (
                <div key={t.id} className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex justify-between items-center shadow-lg group">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-800 rounded-full text-teal-400 border border-slate-700 group-hover:border-teal-500/50 transition-all"><History size={16}/></div>
                      <div>
                        <div className="text-xs font-bold text-white">{t.from} ➝ {t.to}</div>
                        <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{t.type} • {t.time}</div>
                      </div>
                   </div>
                   <div className="font-mono font-bold text-white text-sm">{t.amount > 0 ? t.amount.toLocaleString() + ' TL' : ''}</div>
                </div>
              ))}
           </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 p-2 flex justify-around shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-40 h-20">
          <button onClick={() => setActiveTab('wallet')} className={`flex-1 flex flex-col items-center justify-center gap-1 py-1 rounded-2xl transition-all ${activeTab === 'wallet' ? 'text-white bg-slate-800 border border-slate-600 shadow-inner scale-105' : 'text-slate-500'}`}><Wallet size={20}/><span className="text-[9px] font-bold uppercase tracking-tighter">Cüzdan</span></button>
          <button onClick={() => setActiveTab('finance')} className={`flex-1 flex flex-col items-center justify-center gap-1 py-1 rounded-2xl transition-all ${activeTab === 'finance' ? 'text-white bg-slate-800 border border-slate-600 shadow-inner scale-105' : 'text-slate-500'}`}><PiggyBank size={20}/><span className="text-[9px] font-bold uppercase tracking-tighter">Finans</span></button>
          {user.isHost && <button onClick={() => setActiveTab('bank')} className={`flex-1 flex flex-col items-center justify-center gap-1 py-1 rounded-2xl transition-all ${activeTab === 'bank' ? 'text-amber-900 bg-gradient-to-tr from-amber-400 to-yellow-200 border-2 border-yellow-100 shadow-lg -translate-y-2' : 'text-amber-500 bg-amber-950/30'}`}><ShieldAlert size={20}/><span className="text-[9px] font-bold uppercase tracking-tighter">Banka</span></button>}
          <button onClick={() => setActiveTab('feed')} className={`flex-1 flex flex-col items-center justify-center gap-1 py-1 rounded-2xl transition-all ${activeTab === 'feed' ? 'text-white bg-slate-800 border border-slate-600 shadow-inner scale-105' : 'text-slate-500'}`}><History size={20}/><span className="text-[9px] font-bold uppercase tracking-tighter">Geçmiş</span></button>
      </div>
    </>
  );
}