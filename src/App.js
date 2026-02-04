import React, { useState, useEffect, useRef } from 'react';
import { 
  Wallet, 
  Landmark, 
  History, 
  LogOut, 
  ShieldAlert,
  Users,
  CarFront,
  Ship,
  Dog,
  Cat,
  Copy,
  PlusCircle,
  LogIn,
  LayoutGrid,
  Volume2,
  VolumeX,
  RefreshCw,
  EyeOff,
  PiggyBank, 
  CalendarClock,
  Briefcase, 
  HandCoins, 
  TrendingUp,
  AlertTriangle,
  Skull, 
  ArrowRightLeft,
  XCircle,
  CheckCircle2,
  Sparkles // Yeni ikon
} from 'lucide-react';

// --- CONFIG ---
const INITIAL_BANK_BALANCE = 50000000; 
const INITIAL_PLAYER_BALANCE = 150000; 
const GO_SALARY = 20000; 
const MAX_LOAN_LIMIT = 100000;

// GÖRSELLER (Header kaldırıldı, Logo korundu)
const IMAGES = {
  logo: 'https://i.ibb.co/3yjXmptX/arayuz-ekrani.png'
};

const THEME = {
  bg: "bg-slate-950",
  card: "bg-slate-900", 
  primary: "bg-teal-600",
  secondary: "bg-fuchsia-700",
  text: "text-slate-100",
  muted: "text-slate-400",
  gold: "text-amber-400",
  danger: "text-red-500"
};

const SOUNDS = {
  send: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3', 
  receive: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3',
  turn: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  alarm: 'https://assets.mixkit.co/active_storage/sfx/2865/2865-preview.mp3',
  fail: 'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3' 
};

// --- PİYON LİSTESİ ---
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
  
  const [gameState, setGameState] = useState(() => {
    const saved = localStorage.getItem('monopoly_state_v13'); // Versiyon v13
    return saved ? JSON.parse(saved) : {
      code: '',
      bankBalance: INITIAL_BANK_BALANCE,
      players: [],
      transactions: []
    };
  });

  useEffect(() => {
    localStorage.setItem('monopoly_state_v13', JSON.stringify(gameState));
  }, [gameState]);

  useEffect(() => {
    if (user) {
      const updatedUser = gameState.players.find(p => p.id === user.id);
      if (updatedUser) {
        setUser(updatedUser);
      } else {
        setUser(null);
        setView('welcome');
      }
    }
  }, [gameState.players]);

  const playSound = (type) => {
    if (!soundEnabled) return;
    try {
      const audio = new Audio(SOUNDS[type]);
      audio.volume = 0.5;
      audio.play().catch(e => console.log("Audio interaction needed", e));
    } catch (e) { console.error(e); }
  };

  const calculateDebt = (principal, startTurn, currentTurn) => {
    if (principal <= 0) return 0;
    const turnsPassed = currentTurn - startTurn;
    let interestRate = 0;
    if (turnsPassed >= 2) {
      interestRate = (turnsPassed - 1) * 25;
    }
    return Math.floor(principal + (principal * interestRate / 100));
  };

  // --- ACTIONS ---

  const createGame = (hostName, token) => {
    const newCode = Math.floor(1000 + Math.random() * 9000).toString();
    const hostPlayer = {
      id: Date.now(),
      name: hostName,
      balance: INITIAL_PLAYER_BALANCE,
      turn: 1, 
      savings: 0,
      savingsStartTurn: 0,
      debt: 0,
      debtLenderId: null, 
      debtStartTurn: 0,
      token: token,
      isHost: true
    };

    // Test Bots
    const testBots = [
      { id: Date.now() + 1, name: 'Zeynep', balance: INITIAL_PLAYER_BALANCE, turn: 1, savings: 0, savingsStartTurn: 0, debt: 0, debtLenderId: null, debtStartTurn: 0, token: 'cat', isHost: false },
      { id: Date.now() + 2, name: 'Can', balance: INITIAL_PLAYER_BALANCE, turn: 1, savings: 0, savingsStartTurn: 0, debt: 0, debtLenderId: null, debtStartTurn: 0, token: 'ship', isHost: false },
      { id: Date.now() + 3, name: 'Elif', balance: INITIAL_PLAYER_BALANCE, turn: 1, savings: 0, savingsStartTurn: 0, debt: 0, debtLenderId: null, debtStartTurn: 0, token: 'shoe', isHost: false }
    ];

    setGameState({
      code: newCode,
      bankBalance: INITIAL_BANK_BALANCE - (INITIAL_PLAYER_BALANCE * 4),
      players: [hostPlayer, ...testBots],
      transactions: [{
        id: Date.now(),
        from: 'SİSTEM',
        to: 'HERKES',
        amount: 0,
        type: 'OYUN KURULDU',
        time: getCurrentTime()
      }]
    });
    
    setUser(hostPlayer);
    setView('game');
    playSound('receive');
    showNotification(`Oyun kuruldu! Kod: ${newCode}`, 'success');
  };

  const joinGame = (code, playerName, token) => {
    if (code !== gameState.code) {
      return showNotification('Oyun kodu bulunamadı!', 'error');
    }

    const existingPlayer = gameState.players.find(p => p.name.toLowerCase() === playerName.toLowerCase());

    if (existingPlayer) {
      setUser(existingPlayer);
      setView('game');
      playSound('receive');
      showNotification('Tekrar hoşgeldin!', 'success');
    } else {
      const newPlayer = {
        id: Date.now(),
        name: playerName,
        balance: INITIAL_PLAYER_BALANCE,
        turn: 1,
        savings: 0,
        savingsStartTurn: 0,
        debt: 0,
        debtLenderId: null,
        debtStartTurn: 0,
        token: token,
        isHost: false
      };

      setGameState(prev => ({
        ...prev,
        bankBalance: prev.bankBalance - INITIAL_PLAYER_BALANCE,
        players: [...prev.players, newPlayer],
        transactions: [{
          id: Date.now(),
          from: 'BANKA',
          to: playerName,
          amount: INITIAL_PLAYER_BALANCE,
          type: 'GİRİŞ BONUSU',
          time: getCurrentTime()
        }, ...prev.transactions]
      }));

      setUser(newPlayer);
      setView('game');
      playSound('receive');
      showNotification('Oyuna katıldın!', 'success');
    }
  };

  const handleTransaction = (fromId, toId, amount, type) => {
    const amountNum = parseInt(amount);
    if (!amountNum || amountNum <= 0) return showNotification('Geçersiz tutar.', 'error');

    setGameState(prev => {
      let newBankBalance = prev.bankBalance;
      const newPlayers = prev.players.map(p => ({ ...p }));
      
      const sender = fromId === 'BANKA' ? null : newPlayers.find(p => p.id === fromId);
      const receiver = toId === 'BANKA' ? null : newPlayers.find(p => p.id === toId);

      if (sender && sender.balance < amountNum) {
        showNotification('Yetersiz bakiye!', 'error');
        return prev;
      }

      if (sender) sender.balance -= amountNum;
      if (receiver) receiver.balance += amountNum;
      
      if (fromId === 'BANKA') newBankBalance -= amountNum;
      if (toId === 'BANKA') newBankBalance += amountNum;

      const newLog = {
        id: Date.now(),
        from: fromId === 'BANKA' ? 'MERKEZ BANKASI' : sender?.name,
        to: toId === 'BANKA' ? 'MERKEZ BANKASI' : receiver?.name,
        amount: amountNum,
        type: type,
        time: getCurrentTime()
      };

      if (user.id === fromId) playSound('send');
      else if (user.id === toId) playSound('receive');
      else if (user.isHost) playSound('send');

      showNotification('İşlem Başarılı', 'success');

      return {
        ...prev,
        bankBalance: newBankBalance,
        players: newPlayers,
        transactions: [newLog, ...prev.transactions]
      };
    });
  };

  const handleSalary = (playerId) => {
    setGameState(prev => {
      const newPlayers = prev.players.map(p => ({ ...p }));
      const player = newPlayers.find(p => p.id === playerId);
      
      if (!player) return prev;

      player.balance += GO_SALARY;
      player.turn += 1; 
      
      const newBankBalance = prev.bankBalance - GO_SALARY;

      playSound('turn');
      showNotification(`${player.name} maaş aldı ve ${player.turn}. tura geçti!`, 'success');

      return {
        ...prev,
        bankBalance: newBankBalance,
        players: newPlayers,
        transactions: [{
          id: Date.now(),
          from: 'BANKA',
          to: player.name,
          amount: GO_SALARY,
          type: `MAAŞ (TUR ${player.turn})`,
          time: getCurrentTime()
        }, ...prev.transactions]
      };
    });
  };

  const handleLoan = (lenderId, borrowerId, amount) => {
    const amountNum = parseInt(amount);
    if (!amountNum || amountNum <= 0) return showNotification('Geçersiz tutar', 'error');
    if (amountNum > MAX_LOAN_LIMIT) return showNotification(`Max limit: ${MAX_LOAN_LIMIT.toLocaleString()} TL`, 'error');

    setGameState(prev => {
        const newPlayers = prev.players.map(p => ({...p}));
        const borrower = newPlayers.find(p => p.id === borrowerId);
        
        if (borrower.debt > 0) {
            showNotification('Mevcut borç ödenmeden yenisi alınamaz!', 'error');
            return prev;
        }

        let newBankBalance = prev.bankBalance;
        let lenderName = 'BANKA';

        if (lenderId !== 'BANKA') {
            const lender = newPlayers.find(p => p.id === lenderId);
            if (lender.balance < amountNum) {
                showNotification('Borç vermek için bakiyeniz yetersiz!', 'error');
                return prev;
            }
            lender.balance -= amountNum;
            lenderName = lender.name;
        } else {
            newBankBalance -= amountNum;
        }

        borrower.balance += amountNum;
        borrower.debt = amountNum;
        borrower.debtLenderId = lenderId;
        borrower.debtStartTurn = borrower.turn; 

        showNotification(`${lenderName} tarafından kredi verildi.`, 'success');
        playSound('receive');

        return {
            ...prev,
            bankBalance: newBankBalance,
            players: newPlayers,
            transactions: [{
                id: Date.now(),
                from: `${lenderName} (BORÇ)`,
                to: borrower.name,
                amount: amountNum,
                type: 'BORÇ VERİLDİ',
                time: getCurrentTime()
            }, ...prev.transactions]
        };
    });
  };

  const payDebt = (playerId) => {
    setGameState(prev => {
        const newPlayers = prev.players.map(p => ({...p}));
        const player = newPlayers.find(p => p.id === playerId);
        
        const currentDebt = calculateDebt(player.debt, player.debtStartTurn, player.turn);

        if (player.balance < currentDebt) {
            showNotification('Borcu ödemek için paran yetersiz!', 'error');
            playSound('alarm');
            return prev;
        }

        let receiverName = 'BANKA';
        let newBankBalance = prev.bankBalance;

        if (player.debtLenderId && player.debtLenderId !== 'BANKA') {
            const lender = newPlayers.find(p => p.id === player.debtLenderId);
            if (lender) {
                lender.balance += currentDebt;
                receiverName = lender.name;
            } else {
                newBankBalance += currentDebt;
            }
        } else {
            newBankBalance += currentDebt;
        }

        player.balance -= currentDebt;
        player.debt = 0;
        player.debtLenderId = null;
        player.debtStartTurn = 0;

        showNotification('Borç faiziyle ödendi.', 'success');
        playSound('send');

        return {
            ...prev,
            bankBalance: newBankBalance,
            players: newPlayers,
            transactions: [{
                id: Date.now(),
                from: player.name,
                to: `${receiverName} (BORÇ)`,
                amount: currentDebt,
                type: 'BORÇ KAPATMA',
                time: getCurrentTime()
            }, ...prev.transactions]
        };
    });
  };

  const handleBankruptcy = (playerId, beneficiaryId) => {
     setGameState(prev => {
        const currentPlayers = prev.players.map(p => ({...p}));
        const bankruptPlayer = currentPlayers.find(p => p.id === playerId);
        
        if (!bankruptPlayer) return prev;

        const assets = bankruptPlayer.balance;
        const savings = bankruptPlayer.savings; 
        const totalAssets = assets + savings;

        let beneficiaryName = 'BANKA';
        let newBankBalance = prev.bankBalance;

        if (beneficiaryId === 'BANKA') {
            newBankBalance += totalAssets;
        } else {
            const beneficiary = currentPlayers.find(p => p.id === Number(beneficiaryId));
            if (beneficiary) {
                beneficiary.balance += totalAssets;
                beneficiaryName = beneficiary.name;
            } else {
                newBankBalance += totalAssets;
            }
        }

        const remainingPlayers = currentPlayers.filter(p => p.id !== playerId);

        playSound('fail');
        
        return {
            ...prev,
            bankBalance: newBankBalance,
            players: remainingPlayers,
            transactions: [{
                id: Date.now(),
                from: bankruptPlayer.name,
                to: beneficiaryName,
                amount: totalAssets,
                type: 'İFLAS / OYUNDAN ÇIKIŞ',
                time: getCurrentTime()
            }, ...prev.transactions]
        };
     });
  };

  const handleSavings = (playerId, amount, action) => {
    const amountNum = parseInt(amount);
    
    setGameState(prev => {
      const newPlayers = prev.players.map(p => ({ ...p }));
      const player = newPlayers.find(p => p.id === playerId);
      
      if (!player) return prev;

      if (action === 'DEPOSIT') {
        if (!amountNum || amountNum <= 0) { showNotification('Geçersiz tutar', 'error'); return prev; }
        if (player.balance < amountNum) { showNotification('Yetersiz bakiye', 'error'); return prev; }
        
        if (player.savings > 0) {
           showNotification('Vade süresi sıfırlandı.', 'error');
        }

        player.balance -= amountNum;
        player.savings += amountNum;
        player.savingsStartTurn = player.turn; 

        showNotification('Para vadeli hesaba yatırıldı.', 'success');
      } 
      else if (action === 'WITHDRAW') {
        if (player.savings <= 0) return prev;

        const turnsPassed = player.turn - player.savingsStartTurn;
        let interestRate = 0;

        if (turnsPassed >= 5 && turnsPassed % 5 === 0) {
          const milestones = Math.floor(turnsPassed / 5);
          interestRate = Math.min(milestones * 10, 100);
        }

        const interestAmount = Math.floor(player.savings * (interestRate / 100));
        const totalPayout = player.savings + interestAmount;

        player.balance += totalPayout;
        player.savings = 0;
        player.savingsStartTurn = 0;
        let newBankBalance = prev.bankBalance - interestAmount;

        const logMsg = interestAmount > 0 
          ? `Vade doldu! %${interestRate} faizle çekildi.` 
          : `Erken çekim! Faiz yandı.`;

        showNotification(logMsg, interestAmount > 0 ? 'success' : 'error');
        playSound('receive');
        
        return {
            ...prev,
            bankBalance: newBankBalance,
            players: newPlayers,
            transactions: [{
                id: Date.now(),
                from: 'VADELİ HESAP',
                to: player.name,
                amount: interestAmount, 
                type: interestAmount > 0 ? 'FAİZ KAZANCI' : 'FAİZ İPTALİ',
                time: getCurrentTime()
            }, ...prev.transactions]
        };
      }

      return { ...prev, players: newPlayers };
    });
  };

  const handleLogout = () => {
    setUser(null);
    setView('welcome');
  };

  const resetGame = () => {
    if (confirm('Oyun sıfırlanacak. Emin misin?')) {
      localStorage.removeItem('monopoly_state_v13');
      setGameState({
        code: '',
        bankBalance: INITIAL_BANK_BALANCE,
        players: [],
        transactions: []
      });
      setUser(null);
      setView('welcome');
    }
  };

  const getCurrentTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const showNotification = (msg, type) => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className={`min-h-screen ${THEME.bg} ${THEME.text} font-sans pb-24 touch-manipulation`}>
      <div className="relative z-10">
        {notification && (
          <div className={`fixed top-4 left-4 right-4 z-[100] px-4 py-3 rounded-xl shadow-2xl border flex items-center justify-center text-center font-bold ${
            notification.type === 'error' ? 'bg-red-900/95 border-red-500 backdrop-blur' : 'bg-teal-600/95 border-teal-400 backdrop-blur'
          } animate-in slide-in-from-top-2`}>
            {notification.msg}
          </div>
        )}

        {view === 'welcome' ? (
          <WelcomeScreen onCreateGame={createGame} onJoinGame={joinGame} existingGame={gameState.code ? gameState.code : null} />
        ) : (
          <MainGameInterface 
            user={user} 
            gameState={gameState} 
            handleTransaction={handleTransaction}
            handleSalary={handleSalary}
            handleSavings={handleSavings}
            handleLoan={handleLoan}
            handleBankruptcy={handleBankruptcy}
            payDebt={payDebt}
            onLogout={handleLogout}
            onReset={resetGame}
            soundEnabled={soundEnabled}
            toggleSound={() => setSoundEnabled(!soundEnabled)}
            calculateDebt={calculateDebt}
          />
        )}
      </div>
    </div>
  );
}

// --- EKRANLAR ---

function WelcomeScreen({ onCreateGame, onJoinGame, existingGame }) {
  const [mode, setMode] = useState('menu'); 
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [selectedToken, setSelectedToken] = useState(null);

  const reset = () => {
    setMode('menu');
    setName('');
    setCode('');
    setSelectedToken(null);
  };

  const TokenSelector = () => (
    <div className="grid grid-cols-4 gap-3 mb-6">
      {GAME_TOKENS.map((token) => (
        <button
          key={token.id}
          onClick={() => setSelectedToken(token.id)}
          className={`aspect-square flex flex-col items-center justify-center rounded-xl border transition-all relative overflow-hidden bg-slate-800 ${
            selectedToken === token.id 
              ? 'border-teal-400 ring-2 ring-teal-500/50 transform scale-105 z-10' 
              : 'border-slate-700 opacity-80 hover:opacity-100 hover:border-slate-500'
          }`}
        >
          {token.img ? (
            <img src={token.img} alt={token.label} className="w-full h-full object-cover" 
                 onError={(e) => {e.target.style.display='none'; e.target.nextSibling.style.display='block'}} />
          ) : null}
          <div className="scale-75 absolute inset-0 flex items-center justify-center" style={{display: token.img ? 'none' : 'flex'}}>
             {token.icon}
          </div>
        </button>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col items-center min-h-screen relative overflow-y-auto pb-10 bg-slate-950">
      
      {/* HEADER LOGO/TITLE SECTION */}
      <div className="w-full flex flex-col items-center justify-center mt-12 mb-8 px-6 text-center space-y-4 animate-in fade-in slide-in-from-top-10 duration-700">
        <div className="w-24 h-24 bg-gradient-to-tr from-teal-500 to-emerald-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-teal-500/30 transform rotate-6 border-2 border-slate-700/50">
            <Sparkles className="w-12 h-12 text-white" />
        </div>
        
        <div>
            <h2 className="text-xl font-medium text-slate-400 tracking-wide font-serif italic">Herkeşe Benden</h2>
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 tracking-tighter drop-shadow-sm my-1">
                ŞIPRAYT
            </h1>
            <div className="flex items-center justify-center gap-2">
                <div className="h-[1px] w-8 bg-slate-700"></div>
                <span className="text-sm font-bold text-slate-500 uppercase tracking-[0.3em]">Monopoly</span>
                <div className="h-[1px] w-8 bg-slate-700"></div>
            </div>
        </div>
      </div>
      
      <div className="relative z-10 w-full max-w-sm px-6">
        
        {mode === 'menu' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8 delay-150">
            {existingGame && (
              <div className="bg-slate-900/80 p-4 rounded-2xl text-center border border-teal-500/30 mb-6 shadow-lg backdrop-blur-sm">
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Mevcut Oyun</span>
                <div className="font-mono text-teal-400 font-black tracking-widest text-3xl">{existingGame}</div>
                <div className="text-[10px] text-slate-500 mt-1">Devam etmek için "Katıl" diyip kodunuzu girin</div>
              </div>
            )}

            <button 
              onClick={() => setMode('create')}
              className="w-full bg-slate-900 border border-slate-800 hover:border-teal-500/50 p-6 rounded-3xl flex flex-col items-center gap-3 transition-all group active:scale-95 shadow-xl hover:shadow-teal-900/20 hover:bg-slate-800"
            >
              <div className="p-4 bg-teal-500/10 rounded-full text-teal-400 group-hover:scale-110 transition-transform">
                <PlusCircle className="w-8 h-8" />
              </div>
              <div className="text-center">
                <div className="font-bold text-lg text-white">Yeni Oyun Kur</div>
                <div className="text-xs text-slate-400">Oyun kurucusu ve Bankacı ol</div>
              </div>
            </button>

            <button 
              onClick={() => setMode('join')}
              className="w-full bg-slate-900 border border-slate-800 hover:border-fuchsia-500/50 p-6 rounded-3xl flex flex-col items-center gap-3 transition-all group active:scale-95 shadow-xl hover:shadow-fuchsia-900/20 hover:bg-slate-800"
            >
              <div className="p-4 bg-fuchsia-500/10 rounded-full text-fuchsia-400 group-hover:scale-110 transition-transform">
                <LogIn className="w-8 h-8" />
              </div>
              <div className="text-center">
                <div className="font-bold text-lg text-white">Oyuna Katıl</div>
                <div className="text-xs text-slate-400">Mevcut bir oyuna gir</div>
              </div>
            </button>
          </div>
        )}

        {(mode === 'create' || mode === 'join') && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl animate-in fade-in zoom-in-95 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-white font-bold text-xl">{mode === 'create' ? 'Oyun Oluştur' : 'Oyuna Katıl'}</h3>
                <button onClick={reset} className="text-slate-500 hover:text-white transition-colors">
                    <XCircle className="w-6 h-6" />
                </button>
            </div>
            
            {mode === 'join' && (
              <div className="mb-4">
                <label className="text-[10px] text-slate-500 font-bold ml-1 mb-1 block uppercase tracking-wider">Oyun Kodu</label>
                <input 
                  type="number" value={code} onChange={e => setCode(e.target.value)}
                  placeholder="1234" maxLength={4}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-4 text-white font-mono tracking-widest text-center focus:border-fuchsia-500 focus:outline-none placeholder:text-slate-800 text-2xl font-bold transition-colors"
                />
              </div>
            )}
            
            <div className="mb-6">
                <label className="text-[10px] text-slate-500 font-bold ml-1 mb-1 block uppercase tracking-wider">Oyuncu Adı</label>
                <input 
                type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="İsminiz..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 focus:outline-none placeholder:text-slate-700 transition-colors"
                />
            </div>
            
            <label className="text-[10px] text-slate-500 font-bold mb-2 block ml-1 uppercase tracking-wider">Piyonunu Seç</label>
            <TokenSelector />
            
            <button 
              onClick={() => mode === 'create' ? onCreateGame(name, selectedToken) : onJoinGame(code, name, selectedToken)}
              disabled={!name || (!selectedToken && !existingGame) || (mode === 'join' && code.length < 4)}
              className={`w-full text-white font-bold py-4 rounded-2xl disabled:opacity-50 mt-2 shadow-lg transition-all active:scale-95 text-lg ${
                mode === 'create' ? 'bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-500 hover:to-emerald-400' : 'bg-gradient-to-r from-fuchsia-600 to-purple-500 hover:from-fuchsia-500 hover:to-purple-400'
              }`}
            >
              {mode === 'create' ? 'BAŞLAT' : 'GİRİŞ YAP'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function MainGameInterface(props) {
  const { user, gameState, handleTransaction, handleSalary, handleSavings, handleLoan, handleBankruptcy, payDebt, onLogout, onReset, soundEnabled, toggleSound, calculateDebt } = props;
  const [activeTab, setActiveTab] = useState('wallet'); 

  // --- NAVIGASYON YAPILANDIRMASI ---
  const tabs = [];
  
  if (user.isHost) {
    // BANKA BUTONU EN BAŞTA VE ÖZEL TASARIMLI
    tabs.push({ 
      id: 'bank', 
      label: 'BANKA', 
      icon: <ShieldAlert className="w-6 h-6" />, 
      highlight: true 
    });
  }
  
  tabs.push(
    { id: 'wallet', label: 'Cüzdan', icon: <Wallet className="w-5 h-5" /> },
    { id: 'finance', label: 'Finans', icon: <PiggyBank className="w-5 h-5" /> }, 
    { id: 'feed', label: 'Geçmiş', icon: <History className="w-5 h-5" /> }
  );

  return (
    <>
      {/* GLOBAL HEADER */}
      <div className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 shadow-md">
        <div className="max-w-md mx-auto px-4 py-2 flex justify-between items-center h-16">
          
          {/* SOL: LOGO VE KOD */}
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-lg overflow-hidden border border-slate-700 shadow-sm">
                 <img src={IMAGES.logo} alt="Logo" className="w-full h-full object-cover" />
             </div>
             <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-bold tracking-widest">KOD:</span>
                <button onClick={() => navigator.clipboard.writeText(gameState.code)} className="font-mono text-lg font-bold text-white leading-none hover:text-teal-400 transition-colors">
                    {gameState.code}
                </button>
             </div>
          </div>
          
          {/* SAĞ: KULLANICI BİLGİSİ VE BUTONLAR */}
          <div className="flex items-center gap-3">
             <button onClick={toggleSound} className="p-2 bg-slate-900 rounded-full text-slate-400 hover:text-white border border-slate-800 transition-colors">
               {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
             </button>
            
            {/* AVATAR */}
            <div className="w-10 h-10 bg-slate-800 rounded-full border-2 border-slate-700 flex items-center justify-center text-slate-300 overflow-hidden shadow-md relative group">
                {(() => {
                    const token = GAME_TOKENS.find(t => t.id === user.token);
                    return token?.img ? (
                      <img src={token.img} alt="" className="w-full h-full object-cover" 
                           onError={(e) => {e.target.style.display='none'; e.target.nextSibling.style.display='block'}} />
                    ) : null;
                })()}
                <div style={{display: 'none'}}>{GAME_TOKENS.find(t => t.id === user.token)?.icon}</div>
                
                {/* Tur Bilgisi Badge */}
                <div className="absolute bottom-0 right-0 bg-teal-600 text-[8px] font-bold px-1 rounded-full border border-slate-900 text-white">T{user.turn}</div>
            </div>
            
            {user.isHost ? (
               <button onClick={onReset} className="p-2 bg-red-900/20 border border-red-900/50 rounded-full text-red-500 hover:bg-red-900/40 transition-colors" title="Oyunu Sıfırla">
                <LogOut className="w-4 h-4" />
              </button>
            ) : (
               <button onClick={onLogout} className="p-2 bg-slate-900 rounded-full text-slate-500 hover:text-white transition-colors" title="Çıkış Yap">
                <LogOut className="w-4 h-4" />
              </button>
            )}
           
          </div>
        </div>
        
        {/* MERKEZ BANKASI ÖZET ŞERİDİ */}
        <div className="bg-slate-900 border-b border-slate-800 py-1.5 px-4 flex justify-between items-center text-xs shadow-inner">
          <span className="text-slate-400 flex items-center gap-1 font-bold uppercase tracking-wider text-[10px]"><Landmark className="w-3 h-3" /> Merkez Bankası</span>
          <span className="font-mono text-teal-400 text-sm font-bold">{gameState.bankBalance.toLocaleString()} TL</span>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 min-h-[80vh]">
        {activeTab === 'wallet' && (
          <PlayerWallet user={user} players={gameState.players} onTransaction={handleTransaction} handleBankruptcy={handleBankruptcy} />
        )}

        {activeTab === 'finance' && (
          <FinancePanel 
            user={user} 
            players={gameState.players}
            currentTurn={user.turn} 
            handleSavings={handleSavings} 
            calculateDebt={calculateDebt} 
            payDebt={payDebt} 
            handleLoan={handleLoan} 
          />
        )}
        
        {activeTab === 'bank' && user.isHost && (
          <BankerControls players={gameState.players} onTransaction={handleTransaction} handleSalary={handleSalary} handleLoan={handleLoan} />
        )}

        {activeTab === 'feed' && (
          <TransactionFeed transactions={gameState.transactions} />
        )}
      </div>

      {/* BOTTOM NAVIGATION */}
      <div className="fixed bottom-0 left-0 w-full bg-slate-950/95 backdrop-blur-md border-t border-slate-800 pb-safe z-40">
        <div className="max-w-md mx-auto flex justify-around p-2 gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-all duration-300 ${
                activeTab === tab.id 
                  ? (tab.highlight 
                      ? 'text-amber-900 bg-gradient-to-tr from-amber-400 to-yellow-200 shadow-lg -translate-y-2 border-2 border-yellow-100' 
                      : 'text-white bg-slate-800 border border-slate-600') 
                  : (tab.highlight
                      ? 'text-amber-500 bg-amber-950/30 border border-amber-900/50'
                      : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900')
              }`}
            >
              {tab.icon}
              <span className="text-[9px] font-bold tracking-wide">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

// --- ALT BİLEŞENLER ---

function PlayerWallet({ user, players, onTransaction, handleBankruptcy }) {
  const [mode, setMode] = useState(null); 
  const [targetId, setTargetId] = useState(null);
  const [amount, setAmount] = useState('');
  const [showBankruptcyModal, setShowBankruptcyModal] = useState(false);
  const [beneficiary, setBeneficiary] = useState('');

  const handleSend = () => {
    if (!amount) return;
    const type = mode === 'pay_bank' ? 'ÖDEME' : 'KİRA/TİCARET';
    const to = mode === 'pay_bank' ? 'BANKA' : targetId;
    onTransaction(user.id, to, amount, type);
    setAmount('');
    setMode(null);
    setTargetId(null);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 pb-20">
      {/* Wallet Card */}
      <div className={`relative overflow-hidden rounded-3xl p-6 border shadow-2xl mb-6 ${THEME.card} border-slate-800`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-3xl transform translate-x-10 -translate-y-10"></div>
        <div className="relative z-10 flex flex-col items-center justify-center py-4">
          <span className="text-slate-400 text-[10px] tracking-[0.2em] mb-2 font-bold uppercase">Mevcut Bakiye</span>
          <div className="text-5xl font-black text-white font-mono tracking-tighter flex items-baseline gap-2 drop-shadow-md">
            {user.balance.toLocaleString()}
            <span className="text-2xl text-teal-500 font-sans font-medium">TL</span>
          </div>
        </div>
        
        <div className="w-full mt-4 text-center text-[10px] text-slate-500 border-t border-slate-800 pt-2 font-medium uppercase tracking-wide">
            Maaş ödemeleri Bankacı tarafından yapılır
        </div>
      </div>

      {!mode ? (
        <>
            <div className="grid grid-cols-2 gap-4 mb-8">
            <button 
                onClick={() => setMode('pay_bank')}
                className={`flex flex-col items-center justify-center ${THEME.card} border border-red-900/30 p-6 rounded-2xl gap-3 active:scale-95 transition-all touch-manipulation hover:bg-red-950/10 group shadow-lg`}
            >
                <div className="p-4 bg-red-500/10 rounded-full text-red-500 group-hover:scale-110 transition-transform border border-red-500/20"><Landmark className="w-8 h-8" /></div>
                <div className="text-center">
                    <span className="text-red-200 font-bold text-lg block">Bankaya Öde</span>
                    <span className="text-[10px] text-red-500/60 uppercase tracking-wider font-bold">Vergi • Arsa • Ceza</span>
                </div>
            </button>

            <button 
                onClick={() => setMode('pay_player')}
                className={`flex flex-col items-center justify-center ${THEME.card} border border-fuchsia-900/30 p-6 rounded-2xl gap-3 active:scale-95 transition-all touch-manipulation hover:bg-fuchsia-950/10 group shadow-lg`}
            >
                <div className="p-4 bg-fuchsia-500/10 rounded-full text-fuchsia-500 group-hover:scale-110 transition-transform border border-fuchsia-500/20"><Users className="w-8 h-8" /></div>
                <div className="text-center">
                    <span className="text-fuchsia-200 font-bold text-lg block">Kira Öde</span>
                    <span className="text-[10px] text-fuchsia-500/60 uppercase tracking-wider font-bold">Oyuncuya Transfer</span>
                </div>
            </button>
            </div>

            {/* İFLAS BUTONU */}
            <div className="border-t border-slate-800 pt-6 px-4">
                <button 
                    onClick={() => setShowBankruptcyModal(true)} 
                    className="w-full bg-slate-900 border border-red-900/30 text-red-600/70 py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-red-950/50 hover:text-red-500 hover:border-red-500 transition-all font-bold tracking-widest text-xs uppercase"
                >
                    <Skull className="w-4 h-4" />
                    İflas Bayrağı Çek
                </button>
            </div>

            {/* İFLAS MODALI */}
            {showBankruptcyModal && (
                <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in zoom-in-95">
                    <div className="w-full max-w-sm bg-slate-900 border-2 border-red-600 rounded-2xl p-6 text-center relative overflow-hidden shadow-2xl shadow-red-900/50">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-3xl"></div>
                        
                        <div className="mb-6 relative">
                            <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full"></div>
                            <Skull className="w-20 h-20 text-red-600 mx-auto relative z-10" />
                        </div>
                        
                        <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">İFLAS</h2>
                        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                            Tüm mal varlığınızı seçtiğiniz kişiye devredip <strong className="text-red-500">oyundan kalıcı olarak silineceksiniz.</strong><br/>Bu işlemin geri dönüşü yoktur.
                        </p>

                        <div className="space-y-4">
                            <div className="text-left bg-slate-950 p-4 rounded-xl border border-slate-800">
                                <label className="text-[10px] font-bold text-slate-500 block mb-2 uppercase tracking-wider">VARLIKLARI DEVRET</label>
                                <select 
                                    value={beneficiary}
                                    onChange={(e) => setBeneficiary(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 text-white p-3 rounded-lg text-sm focus:border-red-500 focus:outline-none"
                                >
                                    <option value="" disabled>Seçiniz...</option>
                                    <option value="BANKA">MERKEZ BANKASI</option>
                                    {players.filter(p => p.id !== user.id).map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>

                            <button 
                                onClick={() => beneficiary && handleBankruptcy(user.id, beneficiary)}
                                disabled={!beneficiary}
                                className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-bold py-4 rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                            >
                                ONAYLA VE ÇIK
                            </button>

                            <button 
                                onClick={() => {setShowBankruptcyModal(false); setBeneficiary('');}}
                                className="text-slate-500 text-sm font-medium hover:text-white py-2"
                            >
                                İPTAL ET
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
      ) : (
        <div className={`border border-slate-800 rounded-3xl p-5 animate-in zoom-in-95 ${THEME.card} shadow-2xl`}>
          <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
                {mode === 'pay_bank' ? <Landmark className="text-red-500"/> : <Users className="text-fuchsia-500"/>}
                {mode === 'pay_bank' ? 'Bankaya Ödeme' : 'Oyuncuya Gönder'}
            </h3>
            <button onClick={() => setMode(null)} className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2 rounded-full transition-colors">
                <XCircle className="w-5 h-5"/>
            </button>
          </div>

          {mode === 'pay_player' && (
            <div className="grid grid-cols-3 gap-2 mb-6">
              {players.filter(p => p.id !== user.id).length > 0 ? (
                players.filter(p => p.id !== user.id).map(p => (
                  <button
                    key={p.id}
                    onClick={() => setTargetId(p.id)}
                    className={`p-3 rounded-2xl border flex flex-col items-center gap-2 text-xs transition-all touch-manipulation ${
                      targetId === p.id 
                        ? 'bg-fuchsia-600 border-fuchsia-400 text-white shadow-lg scale-105' 
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">
                        {(() => {
                            const token = GAME_TOKENS.find(t => t.id === p.token);
                            return token?.img ? (
                              <img src={token.img} alt="" className="w-full h-full object-cover" 
                                   onError={(e) => {e.target.style.display='none'; e.target.nextSibling.style.display='block'}} />
                            ) : null;
                        })()}
                        <div style={{display: 'none'}}>{GAME_TOKENS.find(t => t.id === p.token)?.icon}</div>
                    </div>
                    <span className="font-bold truncate w-full text-center">{p.name}</span>
                  </button>
                ))
              ) : (
                <div className="col-span-3 text-center text-slate-500 py-4 text-sm">
                  Oyunda başka kimse yok.<br/>Arkadaşlarını davet et!
                </div>
              )}
            </div>
          )}

          <div className="space-y-4">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <label className="text-[10px] text-slate-500 font-bold ml-1 mb-1 block uppercase">TUTAR GİRİNİZ</label>
                <input 
                type="number" 
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0"
                className="w-full bg-transparent text-4xl font-mono text-white text-center focus:outline-none placeholder:text-slate-800"
                autoFocus
                />
            </div>
            
            <button 
              onClick={handleSend}
              disabled={!amount || (mode === 'pay_player' && !targetId)}
              className="w-full py-4 bg-white text-slate-900 font-black text-lg rounded-xl hover:bg-slate-200 disabled:opacity-50 active:scale-95 transition-transform shadow-lg flex items-center justify-center gap-2"
            >
              ONAYLA <CheckCircle2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FinancePanel({ user, players, currentTurn, handleSavings, calculateDebt, payDebt, handleLoan }) {
  const [savingsAmount, setSavingsAmount] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('loan'); 
  
  const [loanTarget, setLoanTarget] = useState('');
  const [loanAmount, setLoanAmount] = useState('');

  const turnsPassed = user.savings > 0 ? currentTurn - user.savingsStartTurn : 0;
  const isMilestone = turnsPassed > 0 && turnsPassed % 5 === 0;
  const milestones = Math.floor(turnsPassed / 5);
  const interestRate = Math.min(milestones * 10, 100);
  const interestAmount = Math.floor(user.savings * (interestRate / 100));
  const nextMilestone = (Math.floor(turnsPassed / 5) + 1) * 5;

  const currentDebt = calculateDebt(user.debt, user.debtStartTurn, currentTurn);
  const debtTurns = user.debt > 0 ? currentTurn - user.debtStartTurn : 0;
  let debtRate = 0;
  if (debtTurns >= 2) debtRate = (debtTurns - 1) * 25;
  
  const lenderName = user.debtLenderId === 'BANKA' ? 'BANKA' : players.find(p => p.id === user.debtLenderId)?.name || 'Bilinmeyen';

  return (
    <div className={`animate-in fade-in space-y-4 pb-20 ${THEME.card} p-4 rounded-3xl border border-slate-800`}>
      
      <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
        <button onClick={() => setActiveSubTab('loan')} className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${activeSubTab === 'loan' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}>
            <HandCoins className="w-4 h-4"/> KREDİ / BORÇ
        </button>
        <button onClick={() => setActiveSubTab('savings')} className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${activeSubTab === 'savings' ? 'bg-amber-900/30 text-amber-500 shadow-md border border-amber-900/50' : 'text-slate-500 hover:text-slate-300'}`}>
            <PiggyBank className="w-4 h-4"/> VADELİ HESAP
        </button>
      </div>

      {activeSubTab === 'savings' && (
      <div className="bg-gradient-to-br from-amber-950/40 to-slate-900 border border-amber-900/30 rounded-2xl p-5 relative overflow-hidden">
        <div className="flex justify-between items-start mb-4 relative z-10">
           <div>
             <span className="text-amber-500 text-[10px] font-bold tracking-widest uppercase flex items-center gap-1 mb-1">
                TOPLAM BİRİKİM
             </span>
             <div className="text-3xl font-mono text-white font-bold">
               {user.savings.toLocaleString()} <span className="text-lg text-amber-500">TL</span>
             </div>
           </div>
        </div>

        {user.savings > 0 ? (
          <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800 relative z-10">
            <div className="flex justify-between items-center mb-2">
               <span className="text-slate-400 text-xs font-bold">KAZANÇ DURUMU</span>
               <span className="text-white font-mono font-bold text-xs">{turnsPassed} / {nextMilestone} TUR</span>
            </div>
            
            <div className="w-full bg-slate-800 rounded-full h-2 mb-3 overflow-hidden border border-slate-700">
              <div 
                className={`h-full rounded-full transition-all duration-1000 relative z-10 ${isMilestone ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-amber-500'}`} 
                style={{ width: `${(turnsPassed % 5 === 0 && turnsPassed > 0 ? 100 : (turnsPassed % 5) * 20)}%` }}
              ></div>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className={isMilestone ? "text-green-400 font-bold text-xs" : "text-slate-500 text-xs"}>
                 {isMilestone ? "✅ ÇEKİLEBİLİR" : "⏳ BEKLENİYOR"}
              </span>
              <span className={isMilestone ? "text-green-400 font-bold font-mono" : "text-slate-500 font-mono"}>
                +{interestAmount.toLocaleString()} TL (%{interestRate})
              </span>
            </div>
          </div>
        ) : (
            <div className="text-slate-400 text-xs relative z-10 mb-4 bg-slate-950/30 p-3 rounded-lg border border-slate-800/50">
               💰 Paranızı yatırın, her 5 turda bir %10 faiz kazanın. Erken çekerseniz sadece ana paranızı alırsınız.
            </div>
        )}

        <div className="relative z-10 mt-4 border-t border-slate-800 pt-4">
        {user.savings === 0 ? (
          <div className="flex gap-2">
            <input 
              type="number" 
              value={savingsAmount}
              onChange={e => setSavingsAmount(e.target.value)}
              placeholder="Miktar"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 font-mono text-white text-center focus:outline-none focus:border-amber-500 text-sm"
            />
            <button 
              onClick={() => { handleSavings(user.id, savingsAmount, 'DEPOSIT'); setSavingsAmount(''); }}
              disabled={!savingsAmount}
              className="bg-amber-600 text-white font-bold px-6 rounded-xl hover:bg-amber-500 disabled:opacity-50 active:scale-95 transition-transform text-sm"
            >
              YATIR
            </button>
          </div>
        ) : (
            <button 
              onClick={() => handleSavings(user.id, 0, 'WITHDRAW')}
              className={`w-full py-3 font-bold rounded-xl active:scale-95 transition-transform flex flex-col items-center justify-center gap-1 ${
                isMilestone 
                ? 'bg-green-600 text-white hover:bg-green-500 shadow-lg shadow-green-900/20' 
                : 'bg-slate-800 text-red-400 border border-red-900/30 hover:bg-slate-700'
              }`}
            >
              <span>{isMilestone ? 'KÂRI TAHSİL ET' : 'HESABI BOZ & ÇEK'}</span>
              {!isMilestone && <span className="text-[9px] opacity-70">(Faiz Yanar!)</span>}
            </button>
        )}
        </div>
      </div>
      )}

      {activeSubTab === 'loan' && (
          <>
          <div className="bg-gradient-to-br from-red-950/10 to-slate-900 border border-red-900/20 rounded-2xl p-5 relative overflow-hidden">
             <div className="flex justify-between items-start mb-4 relative z-10">
               <div>
                 <span className="text-red-500 text-[10px] font-bold tracking-widest uppercase flex items-center gap-1 mb-1">
                    TOPLAM BORÇ
                 </span>
                 <div className="text-3xl font-mono text-white font-bold">
                   {user.debt > 0 ? currentDebt.toLocaleString() : "0"} <span className="text-lg text-red-500">TL</span>
                 </div>
               </div>
            </div>
    
            {user.debt > 0 ? (
                <div className="relative z-10">
                    <div className="bg-slate-950/50 rounded-xl p-3 border border-red-900/30 mb-4">
                        <div className="flex justify-between text-xs text-slate-300 mb-1">
                            <span>Alacaklı:</span>
                            <span className="font-bold text-white">{lenderName}</span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-300 mb-1">
                            <span>Ana Para:</span>
                            <span className="font-mono">{user.debt.toLocaleString()} TL</span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-300 mb-1">
                            <span>Süre:</span>
                            <span className="font-mono text-white">{debtTurns} Tur</span>
                        </div>
                        <div className="flex justify-between text-xs text-red-400 font-bold border-t border-slate-800 pt-1 mt-1">
                            <span>Faiz Oranı:</span>
                            <span className="font-mono">% {debtRate}</span>
                        </div>
                        {debtTurns <= 1 && (
                            <div className="text-[9px] text-green-400 mt-2 text-center bg-green-900/10 py-1 rounded border border-green-900/30">
                                ✨ İLK TUR FAİZSİZ
                            </div>
                        )}
                    </div>
                    
                    <button 
                    onClick={() => payDebt(user.id)}
                    className="w-full py-3 bg-white text-red-900 font-bold rounded-xl hover:bg-slate-200 active:scale-95 transition-transform shadow-lg"
                    >
                    BORCU KAPAT
                    </button>
                </div>
            ) : (
                <div className="text-slate-400 text-xs relative z-10 bg-slate-950/30 p-3 rounded-lg border border-slate-800/50">
                    Şu an borcunuz yok. Bankadan veya arkadaşlarınızdan borç alabilirsiniz.
                    <br/> <span className="text-red-400/80 mt-1 block">⚠️ 1. Turdan sonra her tur %25 faiz biner!</span>
                </div>
            )}
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4">
              <h4 className="text-white font-bold mb-3 flex items-center gap-2 text-xs uppercase tracking-wide"><ArrowRightLeft className="w-3 h-3 text-indigo-400"/> ARKADAŞINA BORÇ VER</h4>
              
              <div className="flex flex-col gap-3">
                  <select 
                     className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white text-xs"
                     value={loanTarget}
                     onChange={(e) => setLoanTarget(e.target.value)}
                  >
                      <option value="">Kime Borç Vereceksin?</option>
                      {players.filter(p => p.id !== user.id).map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                  </select>
                  
                  <div className="flex gap-2">
                    <input 
                        type="number"
                        placeholder="Miktar"
                        value={loanAmount}
                        onChange={(e) => setLoanAmount(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white text-xs font-mono focus:border-indigo-500 outline-none"
                    />

                    <button 
                        onClick={() => {
                            if(loanTarget && loanAmount) {
                                handleLoan(user.id, parseInt(loanTarget), loanAmount);
                                setLoanAmount('');
                                setLoanTarget('');
                            }
                        }}
                        disabled={!loanTarget || !loanAmount}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 rounded-xl disabled:opacity-50 text-xs shadow-lg shadow-indigo-900/20"
                    >
                        VER
                    </button>
                  </div>
              </div>
          </div>
          </>
      )}

    </div>
  );
}

function BankerControls({ players, onTransaction, handleSalary, handleLoan }) {
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('GIVE'); 
  const [loanAmount, setLoanAmount] = useState('');

  const execute = () => {
    if (!amount || !selectedPlayer) return;
    if (type === 'GIVE') {
      onTransaction('BANKA', selectedPlayer.id, amount, 'BONUS');
    } else {
      onTransaction(selectedPlayer.id, 'BANKA', amount, 'CEZA/VERGİ');
    }
    setAmount('');
    setSelectedPlayer(null);
  };

  const paySalaryAction = () => {
      handleSalary(selectedPlayer.id);
      setSelectedPlayer(null);
  };

  const giveLoan = () => {
      if(!loanAmount) return;
      handleLoan('BANKA', selectedPlayer.id, loanAmount);
      setLoanAmount('');
      setSelectedPlayer(null);
  };

  return (
    <div className="animate-in fade-in pb-20">
      <div className="flex items-center gap-3 mb-6 p-4 bg-gradient-to-r from-amber-600 to-orange-500 rounded-2xl shadow-lg text-white">
        <div className="bg-white/20 p-2 rounded-full"><ShieldAlert className="w-6 h-6" /></div>
        <div>
          <h3 className="font-bold text-lg leading-tight">BANKACI PANELİ</h3>
          <p className="text-xs text-white/80">Oyuncu yönetimi ve maaşlar</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {players.map(p => (
          <div key={p.id} className={`bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between hover:border-slate-600 transition-colors`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">
                {(() => {
                    const token = GAME_TOKENS.find(t => t.id === p.token);
                    return token?.img ? <img src={token.img} alt="" className="w-full h-full object-cover"/> : token?.icon;
                })()}
              </div>
              <div>
                <div className="font-bold text-white flex items-center gap-2">
                    {p.name}
                    <span className="text-[9px] bg-slate-800 px-2 py-0.5 rounded text-teal-400 border border-slate-700 font-mono">TUR {p.turn}</span>
                </div>
                <div className="text-xs font-mono text-slate-500 flex items-center gap-1 mt-0.5">
                <EyeOff className="w-3 h-3" /> **** TL
                </div>
              </div>
            </div>
            <button 
            onClick={() => setSelectedPlayer(p)}
            className="bg-slate-800 hover:bg-slate-700 text-xs px-4 py-2 rounded-lg text-white border border-slate-700 font-bold"
            >
            YÖNET
            </button>
          </div>
        ))}
      </div>

      {selectedPlayer && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-3xl p-6 animate-in slide-in-from-bottom-10 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="text-center mb-6">
              <div className="inline-block w-20 h-20 bg-slate-800 rounded-full mb-3 border-4 border-slate-700 overflow-hidden shadow-lg">
                {(() => {
                    const token = GAME_TOKENS.find(t => t.id === selectedPlayer.token);
                    return token?.img ? <img src={token.img} alt="" className="w-full h-full object-cover"/> : token?.icon;
                })()}
              </div>
              <h3 className="text-2xl font-bold text-white">{selectedPlayer.name}</h3>
              <p className="text-slate-400 text-sm font-mono bg-slate-800 inline-block px-3 py-1 rounded-full mt-2">Mevcut Tur: {selectedPlayer.turn}</p>
            </div>

            {/* MAAŞ BUTONU */}
            <button 
              onClick={paySalaryAction}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold py-4 rounded-xl mb-6 shadow-lg shadow-emerald-900/30 active:scale-95 transition-transform flex items-center justify-center gap-2 border border-emerald-500/30"
            >
               <Briefcase className="w-5 h-5" />
               MAAŞ ÖDE & TUR ATLAT
            </button>

            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 mb-4">
                 <h4 className="text-[10px] font-bold text-slate-500 mb-3 uppercase tracking-wider">Manuel İşlem</h4>
                 <div className="grid grid-cols-2 gap-2 mb-3">
                    <button 
                        onClick={() => setType('GIVE')}
                        className={`py-2 rounded-lg border text-xs font-bold transition-colors ${type === 'GIVE' ? 'bg-teal-600 border-teal-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                    >
                        PARA EKLE
                    </button>
                    <button 
                        onClick={() => setType('TAKE')}
                        className={`py-2 rounded-lg border text-xs font-bold transition-colors ${type === 'TAKE' ? 'bg-red-600 border-red-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                    >
                        PARA ÇEK
                    </button>
                 </div>
                 <div className="flex gap-2">
                    <input 
                        type="number" 
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        placeholder="Miktar"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-3 text-lg font-mono text-white text-center focus:outline-none focus:border-white"
                    />
                    <button onClick={execute} className="bg-white text-slate-900 font-bold rounded-lg px-4 hover:bg-slate-200">OK</button>
                 </div>
            </div>
            
            <div className="bg-red-950/20 p-4 rounded-xl border border-red-900/30 mb-2">
                 <h4 className="text-[10px] font-bold text-red-400 mb-3 uppercase tracking-wider">Kredi Ver (Banka)</h4>
                 <div className="flex gap-2">
                    <input 
                        type="number" 
                        value={loanAmount}
                        onChange={e => setLoanAmount(e.target.value)}
                        placeholder="Max 100.000"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white text-center focus:outline-none focus:border-red-500"
                    />
                    <button onClick={giveLoan} className="bg-red-600 text-white font-bold px-4 rounded-lg text-xs">VER</button>
                 </div>
            </div>

            <button onClick={() => setSelectedPlayer(null)} className="w-full py-4 bg-slate-800 text-slate-400 text-sm font-bold rounded-xl mt-4 hover:bg-slate-700 transition-colors">KAPAT</button>
          </div>
        </div>
      )}
    </div>
  );
}

function TransactionFeed({ transactions }) {
  if (transactions.length === 0) return <div className="text-center text-slate-500 py-10 text-sm">Henüz işlem yok.</div>;

  return (
    <div className="space-y-3 pb-20 animate-in fade-in">
      <h3 className="text-xs text-slate-500 font-bold uppercase tracking-widest pl-2 mb-4">Son Hareketler</h3>
      {transactions.map(t => (
        <div key={t.id} className={`bg-slate-900/80 border border-slate-800 p-3 rounded-xl flex items-center justify-between ${t.type.includes('İFLAS') ? 'border-red-900/50 bg-red-950/10' : ''}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${t.from.includes('BANKA') || t.from === 'SİSTEM' ? 'bg-teal-500/10 text-teal-500' : (t.type.includes('İFLAS') ? 'bg-red-500/10 text-red-500' : 'bg-fuchsia-500/10 text-fuchsia-500')}`}>
              {t.from.includes('BANKA') || t.from === 'SİSTEM' ? <Landmark className="w-4 h-4" /> : (t.type.includes('İFLAS') ? <Skull className="w-4 h-4"/> : <LayoutGrid className="w-4 h-4" />)}
            </div>
            <div>
              <div className="text-xs font-bold text-white mb-0.5">
                {t.from} <span className="text-slate-500 px-1">➝</span> {t.to}
              </div>
              <div className="text-[9px] text-slate-500 uppercase tracking-wide font-medium">{t.type} • {t.time}</div>
            </div>
          </div>
          <div className={`font-mono font-bold text-sm ${t.amount === 0 ? 'text-slate-500' : 'text-white'}`}>{t.amount > 0 ? t.amount.toLocaleString() : ''} {t.amount > 0 && 'TL'}</div>
        </div>
      ))}
    </div>
  );
}