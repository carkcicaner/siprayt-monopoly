import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  onSnapshot, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  arrayUnion 
} from 'firebase/firestore';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken, 
  onAuthStateChanged 
} from 'firebase/auth';
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
  PlusCircle,
  LogIn,
  LayoutGrid,
  Volume2,
  VolumeX,
  EyeOff,
  PiggyBank, 
  Briefcase, 
  HandCoins, 
  Skull, 
  ArrowRightLeft,
  XCircle,
  CheckCircle2,
  Sparkles 
} from 'lucide-react';

// --- FIREBASE CONFIG & INIT ---
const firebaseConfig = typeof __firebase_config !== 'undefined' 
  ? JSON.parse(__firebase_config) 
  : {
      apiKey: "AIzaSyBrYALtfdsZT4-hYaYxqfJ2x1wVF_6vWGM",
      authDomain: "siprayt-monopoly.firebaseapp.com",
      projectId: "siprayt-monopoly",
      storageBucket: "siprayt-monopoly.firebasestorage.app",
      messagingSenderId: "219751868418",
      appId: "1:219751868418:web:f6e1d33b23ab4f2b789f1b"
    };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Rule 1 Compliance: appId documentation IDs cannot contain slashes.
const rawAppId = typeof __app_id !== 'undefined' ? __app_id : 'siprayt-monopoly';
const appId = rawAppId.replace(/\//g, '_');

// --- CONFIG ---
const INITIAL_BANK_BALANCE = 50000000; 
const INITIAL_PLAYER_BALANCE = 150000; 
const GO_SALARY = 20000; 

// GÖRSELLER
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
  const [authReady, setAuthReady] = useState(false);
  
  const [gameState, setGameState] = useState({
      code: '',
      bankBalance: INITIAL_BANK_BALANCE,
      players: [],
      transactions: []
  });

  const getGameDoc = (code) => doc(db, 'artifacts', appId, 'public', 'data', 'games', code);

  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
      setAuthReady(true);
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, () => {});
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (gameState.code && authReady) {
      const unsub = onSnapshot(getGameDoc(gameState.code), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setGameState(data);
          if (user) {
            const updatedUser = data.players.find(p => p.id === user.id);
            if (updatedUser) {
              setUser(updatedUser);
            } else {
              setUser(null);
              setView('welcome');
            }
          }
        }
      }, (error) => {
        console.error("Firestore sync error:", error);
      });
      return () => unsub();
    }
  }, [gameState.code, authReady, user?.id]);

  const playSound = (type) => {
    if (!soundEnabled) return;
    try {
      const audio = new Audio(SOUNDS[type]);
      audio.volume = 0.4;
      audio.play().catch(() => {});
    } catch (e) {}
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

  const createGame = async (hostName, token) => {
    if (!auth.currentUser) return;
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

    const initialGameState = {
      code: newCode,
      bankBalance: INITIAL_BANK_BALANCE - INITIAL_PLAYER_BALANCE,
      players: [hostPlayer],
      transactions: [{
        id: Date.now(),
        from: 'SİSTEM',
        to: 'HERKES',
        amount: 0,
        type: 'OYUN KURULDU',
        time: getCurrentTime()
      }]
    };

    await setDoc(getGameDoc(newCode), initialGameState);
    
    setUser(hostPlayer);
    setGameState(initialGameState);
    setView('game');
    playSound('receive');
    showNotification(`Oyun kuruldu! Kod: ${newCode}`, 'success');
  };

  const joinGame = async (code, playerName, token) => {
    if (!auth.currentUser) return;
    const gameRef = getGameDoc(code);
    const docSnap = await getDoc(gameRef);

    if (!docSnap.exists()) {
      return showNotification('Oyun kodu bulunamadı!', 'error');
    }

    const gameData = docSnap.data();
    const existingPlayer = gameData.players.find(p => p.name.toLowerCase() === playerName.toLowerCase());

    if (existingPlayer) {
      setUser(existingPlayer);
      setGameState(gameData);
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

      await updateDoc(gameRef, {
        bankBalance: gameData.bankBalance - INITIAL_PLAYER_BALANCE,
        players: arrayUnion(newPlayer),
        transactions: [{
          id: Date.now(),
          from: 'BANKA',
          to: playerName,
          amount: INITIAL_PLAYER_BALANCE,
          type: 'GİRİŞ BONUSU',
          time: getCurrentTime()
        }, ...gameData.transactions]
      });

      setUser(newPlayer);
      setGameState({ ...gameData, code });
      setView('game');
      playSound('receive');
      showNotification('Oyuna katıldın!', 'success');
    }
  };

  const handleTransaction = async (fromId, toId, amount, type) => {
    if (!auth.currentUser) return;
    const amountNum = parseInt(amount);
    if (!amountNum || amountNum <= 0) return showNotification('Geçersiz tutar.', 'error');

    const gameRef = getGameDoc(gameState.code);
    const newPlayers = gameState.players.map(p => ({ ...p }));
    
    const sender = fromId === 'BANKA' ? null : newPlayers.find(p => p.id === fromId);
    const receiver = toId === 'BANKA' ? null : newPlayers.find(p => p.id === toId);

    if (sender && sender.balance < amountNum) {
      return showNotification('Yetersiz bakiye!', 'error');
    }

    if (sender) sender.balance -= amountNum;
    if (receiver) receiver.balance += amountNum;
    
    let newBankBalance = gameState.bankBalance;
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

    await updateDoc(gameRef, {
      bankBalance: newBankBalance,
      players: newPlayers,
      transactions: [newLog, ...gameState.transactions]
    });

    showNotification('İşlem Başarılı', 'success');
  };

  const handleSalary = async (playerId) => {
    if (!auth.currentUser) return;
    const gameRef = getGameDoc(gameState.code);
    const newPlayers = gameState.players.map(p => {
      if (p.id === playerId) {
        return { ...p, balance: p.balance + GO_SALARY, turn: p.turn + 1 };
      }
      return p;
    });
    
    const player = gameState.players.find(p => p.id === playerId);
    if (!player) return;

    await updateDoc(gameRef, {
      bankBalance: gameState.bankBalance - GO_SALARY,
      players: newPlayers,
      transactions: [{
        id: Date.now(),
        from: 'BANKA',
        to: player.name,
        amount: GO_SALARY,
        type: `MAAŞ (TUR ${player.turn + 1})`,
        time: getCurrentTime()
      }, ...gameState.transactions]
    });

    playSound('turn');
    showNotification(`${player.name} maaş aldı ve yeni tura geçti!`, 'success');
  };

  const handleLoan = async (lenderId, borrowerId, amount) => {
    if (!auth.currentUser) return;
    const amountNum = parseInt(amount);
    if (!amountNum || amountNum <= 0) return showNotification('Geçersiz tutar', 'error');
    
    const gameRef = getGameDoc(gameState.code);
    const newPlayers = gameState.players.map(p => ({...p}));
    const borrower = newPlayers.find(p => p.id === borrowerId);
    
    if (borrower.debt > 0) {
        return showNotification('Mevcut borç ödenmeden yenisi alınamaz!', 'error');
    }

    let newBankBalance = gameState.bankBalance;
    let lenderName = 'BANKA';

    if (lenderId !== 'BANKA') {
        const lender = newPlayers.find(p => p.id === lenderId);
        if (lender.balance < amountNum) {
            return showNotification('Bakiyeniz yetersiz!', 'error');
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

    await updateDoc(gameRef, {
      bankBalance: newBankBalance,
      players: newPlayers,
      transactions: [{
          id: Date.now(),
          from: `${lenderName} (KREDİ)`,
          to: borrower.name,
          amount: amountNum,
          type: 'BORÇ VERİLDİ',
          time: getCurrentTime()
      }, ...gameState.transactions]
    });

    showNotification(`${lenderName} kredisi onaylandı.`, 'success');
    playSound('receive');
  };

  const payDebt = async (playerId) => {
    if (!auth.currentUser) return;
    const gameRef = getGameDoc(gameState.code);
    const newPlayers = gameState.players.map(p => ({...p}));
    const player = newPlayers.find(p => p.id === playerId);
    const currentDebt = calculateDebt(player.debt, player.debtStartTurn, player.turn);

    if (player.balance < currentDebt) {
        playSound('alarm');
        return showNotification('Borcu ödemek için paranız yetersiz!', 'error');
    }

    let receiverName = 'BANKA';
    let newBankBalance = gameState.bankBalance;

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

    await updateDoc(gameRef, {
      bankBalance: newBankBalance,
      players: newPlayers,
      transactions: [{
          id: Date.now(),
          from: player.name,
          to: `${receiverName}`,
          amount: currentDebt,
          type: 'BORÇ KAPATMA',
          time: getCurrentTime()
      }, ...gameState.transactions]
    });

    showNotification('Borç faiziyle kapatıldı.', 'success');
    playSound('send');
  };

  const handleBankruptcy = async (playerId, beneficiaryId) => {
    if (!auth.currentUser) return;
    const gameRef = getGameDoc(gameState.code);
    const currentPlayers = gameState.players.map(p => ({...p}));
    const bankruptPlayer = currentPlayers.find(p => p.id === playerId);
    
    if (!bankruptPlayer) return;

    const totalAssets = bankruptPlayer.balance + bankruptPlayer.savings;
    let beneficiaryName = 'BANKA';
    let newBankBalance = gameState.bankBalance;

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
    
    await updateDoc(gameRef, {
        bankBalance: newBankBalance,
        players: remainingPlayers,
        transactions: [{
            id: Date.now(),
            from: bankruptPlayer.name,
            to: beneficiaryName,
            amount: totalAssets,
            type: 'İFLAS / AYRILDI',
            time: getCurrentTime()
        }, ...gameState.transactions]
    });
  };

  const handleSavings = async (playerId, amount, action) => {
    if (!auth.currentUser) return;
    const amountNum = parseInt(amount);
    const gameRef = getGameDoc(gameState.code);
    const newPlayers = gameState.players.map(p => ({ ...p }));
    const player = newPlayers.find(p => p.id === playerId);
    let newBankBalance = gameState.bankBalance;

    if (action === 'DEPOSIT') {
      if (!amountNum || amountNum <= 0) return showNotification('Geçersiz tutar', 'error');
      if (player.balance < amountNum) return showNotification('Yetersiz bakiye', 'error');
      
      player.balance -= amountNum;
      player.savings += amountNum;
      player.savingsStartTurn = player.turn; 
      showNotification('Vadeli hesaba yatırıldı.', 'success');
    } 
    else if (action === 'WITHDRAW') {
      if (player.savings <= 0) return;

      const turnsPassed = player.turn - player.savingsStartTurn;
      let interestRate = (turnsPassed >= 5 && turnsPassed % 5 === 0) ? Math.min(Math.floor(turnsPassed / 5) * 10, 100) : 0;

      const interestAmount = Math.floor(player.savings * (interestRate / 100));
      const totalPayout = player.savings + interestAmount;

      player.balance += totalPayout;
      player.savings = 0;
      player.savingsStartTurn = 0;
      newBankBalance -= interestAmount;

      playSound('receive');
      showNotification(interestAmount > 0 ? `Vade doldu! %${interestRate} kazançla çekildi.` : 'Erken çekim! Faiz yandı.', interestAmount > 0 ? 'success' : 'error');
    }

    await updateDoc(gameRef, {
      players: newPlayers,
      bankBalance: newBankBalance
    });
  };

  const handleLogout = () => {
    setUser(null);
    setView('welcome');
  };

  const resetGame = async () => {
    if (window.confirm('Oyun sıfırlanacak. Emin misiniz?')) {
      await deleteDoc(getGameDoc(gameState.code));
      setUser(null);
      setGameState({ code: '', bankBalance: INITIAL_BANK_BALANCE, players: [], transactions: [] });
      setView('welcome');
    }
  };

  const getCurrentTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const showNotification = (msg, type) => { setNotification({ msg, type }); setTimeout(() => setNotification(null), 3000); };

  if (!authReady) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-teal-500 font-bold animate-pulse uppercase tracking-[0.3em]">Sistem Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${THEME.bg} ${THEME.text} font-sans pb-24 touch-manipulation`}>
      <div className="relative z-10">
        {notification && (
          <div className={`fixed top-4 left-4 right-4 z-[100] px-4 py-3 rounded-xl shadow-2xl border flex items-center justify-center text-center font-bold ${
            notification.type === 'error' ? 'bg-red-900 border-red-500' : 'bg-teal-600 border-teal-400'
          } animate-in slide-in-from-top-2 backdrop-blur`}>
            {notification.msg}
          </div>
        )}

        {view === 'welcome' ? (
          <WelcomeScreen onCreateGame={createGame} onJoinGame={joinGame} existingGame={gameState.code || null} />
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
          type="button"
          onClick={() => setSelectedToken(token.id)}
          className={`aspect-square flex flex-col items-center justify-center rounded-xl border transition-all relative overflow-hidden bg-slate-800 ${
            selectedToken === token.id 
              ? 'border-teal-400 ring-2 ring-teal-500/50 scale-105 z-10 shadow-lg' 
              : 'border-slate-700 opacity-80 hover:opacity-100 hover:border-slate-500'
          }`}
        >
          {token.img ? (
            <img src={token.img} alt={token.label} className="w-full h-full object-cover" 
                 onError={(e) => {e.target.style.display='none'; e.target.nextSibling.style.display='flex'}} />
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
      
      <div className="w-full flex flex-col items-center justify-center mt-12 mb-8 px-6 text-center space-y-4 animate-in fade-in slide-in-from-top-10 duration-700">
        <div className="w-24 h-24 bg-gradient-to-tr from-teal-500 to-emerald-600 rounded-3xl flex items-center justify-center shadow-2xl rotate-6 border-2 border-slate-700/50">
            <Sparkles className="w-12 h-12 text-white" />
        </div>
        
        <div>
            <h2 className="text-xl font-medium text-slate-400 tracking-wide italic">Herkeşe Benden</h2>
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
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8">
            {existingGame && (
              <div className="bg-slate-900/80 p-4 rounded-2xl text-center border border-teal-500/30 mb-6 shadow-lg backdrop-blur-sm">
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Mevcut Oyun</span>
                <div className="font-mono text-teal-400 font-black tracking-widest text-3xl font-mono">{existingGame}</div>
                <div className="text-[10px] text-slate-500 mt-1">Giriş yapıp kodunuzu yazarak devam edin</div>
              </div>
            )}

            <button 
              type="button"
              onClick={() => setMode('create')}
              className="w-full bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col items-center gap-3 transition-all active:scale-95 shadow-xl hover:bg-slate-800"
            >
              <div className="p-4 bg-teal-500/10 rounded-full text-teal-400">
                <PlusCircle className="w-8 h-8" />
              </div>
              <div className="text-center font-bold text-lg text-white uppercase tracking-widest">Yeni Oyun Kur</div>
            </button>

            <button 
              type="button"
              onClick={() => setMode('join')}
              className="w-full bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col items-center gap-3 transition-all active:scale-95 shadow-xl hover:bg-slate-800"
            >
              <div className="p-4 bg-fuchsia-500/10 rounded-full text-fuchsia-400">
                <LogIn className="w-8 h-8" />
              </div>
              <div className="text-center font-bold text-lg text-white uppercase tracking-widest">Oyuna Katıl</div>
            </button>
          </div>
        )}

        {(mode === 'create' || mode === 'join') && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl animate-in zoom-in-95 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-white font-bold text-xl uppercase tracking-tighter">{mode === 'create' ? 'Oyun Kurucu' : 'Katılımcı'}</h3>
                <button type="button" onClick={reset} className="text-slate-500 hover:text-white">
                    <XCircle className="w-6 h-6" />
                </button>
            </div>
            
            {mode === 'join' && (
              <div className="mb-4">
                <label className="text-[10px] text-slate-500 font-bold ml-1 mb-1 block uppercase">Oyun Kodu</label>
                <input 
                  type="number" value={code} onChange={e => setCode(e.target.value)}
                  placeholder="1234" maxLength={4}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-4 text-white font-mono tracking-widest text-center focus:border-fuchsia-500 outline-none text-2xl font-bold transition-colors font-mono"
                />
              </div>
            )}
            
            <div className="mb-6">
                <label className="text-[10px] text-slate-500 font-bold ml-1 mb-1 block uppercase">Oyuncu Adı</label>
                <input 
                  type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="İsminiz..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-teal-500 outline-none transition-colors"
                />
            </div>
            
            <label className="text-[10px] text-slate-500 font-bold mb-2 block ml-1 uppercase tracking-widest">Piyon Seçimi</label>
            <TokenSelector />
            
            <button 
              type="button"
              onClick={() => mode === 'create' ? onCreateGame(name, selectedToken) : onJoinGame(code, name, selectedToken)}
              disabled={!name || !selectedToken || (mode === 'join' && code.length < 4)}
              className={`w-full text-white font-bold py-4 rounded-2xl disabled:opacity-50 mt-2 shadow-lg active:scale-95 text-lg uppercase tracking-widest ${
                mode === 'create' ? 'bg-gradient-to-r from-teal-600 to-emerald-500' : 'bg-gradient-to-r from-fuchsia-600 to-purple-500'
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
  const { user, gameState, handleTransaction, handleSalary, handleSavings, handleLoan, handleBankruptcy, payDebt, onReset, soundEnabled, toggleSound, calculateDebt } = props;
  const [activeTab, setActiveTab] = useState('wallet'); 

  const tabs = [];
  if (user?.isHost) tabs.push({ id: 'bank', label: 'BANKA', icon: <ShieldAlert className="w-6 h-6" />, highlight: true });
  tabs.push({ id: 'wallet', label: 'Cüzdan', icon: <Wallet className="w-5 h-5" /> }, { id: 'finance', label: 'Finans', icon: <PiggyBank className="w-5 h-5" /> }, { id: 'feed', label: 'Geçmiş', icon: <History className="w-5 h-5" /> });

  return (
    <>
      <div className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 h-16 flex justify-between items-center px-4">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-lg overflow-hidden border border-slate-700 shadow-sm"><img src={IMAGES.logo} alt="Logo" className="w-full h-full object-cover" /></div>
             <div className="flex flex-col"><span className="text-[10px] text-slate-500 font-bold tracking-widest leading-tight uppercase">Kod:</span><button type="button" onClick={() => { window.navigator.clipboard.writeText(gameState.code); }} className="font-mono text-lg font-bold text-white leading-none tracking-widest font-mono">{gameState.code}</button></div>
          </div>
          
          <div className="flex items-center gap-3">
             <button type="button" onClick={toggleSound} className="p-2 bg-slate-900 rounded-full text-slate-400 border border-slate-800 transition-colors">{soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}</button>
            <div className="w-10 h-10 bg-slate-800 rounded-full border-2 border-slate-700 flex items-center justify-center overflow-hidden relative shadow-md">
                {(() => {
                    const token = GAME_TOKENS.find(t => t.id === user?.token);
                    return token?.img ? <img src={token.img} alt="" className="w-full h-full object-cover" /> : token?.icon;
                })()}
                <div className="absolute bottom-0 right-0 bg-teal-600 text-[8px] font-bold px-1 rounded-full border border-slate-900 text-white font-mono">T{user?.turn || 1}</div>
            </div>
            {user?.isHost && <button type="button" onClick={onReset} className="p-2 bg-red-900/20 border border-red-900/50 rounded-full text-red-500"><LogOut className="w-4 h-4" /></button>}
          </div>
      </div>
      
      <div className="bg-slate-900 border-b border-slate-800 py-1.5 px-4 flex justify-between items-center text-xs shadow-inner">
        <span className="text-slate-400 flex items-center gap-1 font-bold uppercase tracking-wider text-[10px] font-bold"><Landmark className="w-3 h-3" /> Merkez Bankası</span>
        <span className="font-mono text-teal-400 text-sm font-bold tracking-tighter font-mono">{gameState.bankBalance.toLocaleString()} TL</span>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6 min-h-[80vh]">
        {activeTab === 'wallet' && user && <PlayerWallet user={user} players={gameState.players} onTransaction={handleTransaction} handleBankruptcy={handleBankruptcy} />}
        {activeTab === 'finance' && user && <FinancePanel user={user} players={gameState.players} currentTurn={user.turn} handleSavings={handleSavings} calculateDebt={calculateDebt} payDebt={payDebt} handleLoan={handleLoan} />}
        {activeTab === 'bank' && user?.isHost && <BankerControls players={gameState.players} onTransaction={handleTransaction} handleSalary={handleSalary} handleLoan={handleLoan} />}
        {activeTab === 'feed' && <TransactionFeed transactions={gameState.transactions} />}
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-slate-950/95 backdrop-blur-md border-t border-slate-800 pb-safe z-40 h-20">
        <div className="max-w-md mx-auto flex justify-around p-2 gap-2">
          {tabs.map(tab => (
            <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`flex-1 flex flex-col items-center justify-center gap-1 py-1 rounded-xl transition-all duration-300 ${activeTab === tab.id ? (tab.highlight ? 'text-amber-900 bg-gradient-to-tr from-amber-400 to-yellow-200 shadow-lg -translate-y-2 border-2 border-yellow-100 scale-105' : 'text-white bg-slate-800 border border-slate-600 shadow-inner') : (tab.highlight ? 'text-amber-500 bg-amber-950/30 border border-amber-900/50 opacity-60' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900')}`}>
              {tab.icon}
              <span className="text-[9px] font-bold tracking-widest uppercase">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function PlayerWallet({ user, players, onTransaction, handleBankruptcy }) {
  const [mode, setMode] = useState(null); 
  const [targetId, setTargetId] = useState(null);
  const [amount, setAmount] = useState('');
  const [showBankruptcyModal, setShowBankruptcyModal] = useState(false);
  const [beneficiary, setBeneficiary] = useState('');
  
  const handleSend = () => { if (!amount) return; onTransaction(user.id, mode === 'pay_bank' ? 'BANKA' : targetId, amount, mode === 'pay_bank' ? 'ÖDEME' : 'KİRA/TİCARET'); setAmount(''); setMode(null); setTargetId(null); };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 pb-20">
      <div className={`relative overflow-hidden rounded-[2rem] p-8 border shadow-2xl mb-8 bg-slate-900 border-slate-800 ring-1 ring-slate-700/30 text-center`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-3xl transform translate-x-10 -translate-y-10"></div>
        <span className="text-slate-500 text-[10px] tracking-[0.25em] mb-3 block font-bold uppercase">Mevcut Bakiye</span>
        <div className="text-5xl font-black text-white font-mono tracking-tighter drop-shadow-md font-mono">
          {user.balance.toLocaleString()} <span className="text-2xl text-teal-500 font-sans font-medium">TL</span>
        </div>
        <div className="mt-4 text-[9px] text-slate-600 font-bold uppercase tracking-wider border-t border-slate-800 pt-3 italic">Ödemeler anında işlenir</div>
      </div>

      {!mode ? (
        <>
            <div className="grid grid-cols-2 gap-4">
              <button type="button" onClick={() => setMode('pay_bank')} className="flex flex-col items-center justify-center bg-slate-900 border border-red-900/30 p-8 rounded-[2rem] gap-4 hover:bg-red-950/10 shadow-xl transition-all active:scale-95 group"><div className="p-4 bg-red-500/10 rounded-full text-red-500 border border-red-500/20 group-hover:scale-110 transition-transform"><Landmark size={32} /></div><div className="text-center font-bold text-lg text-red-200 uppercase tracking-widest">Banka</div></button>
              <button type="button" onClick={() => setMode('pay_player')} className="flex flex-col items-center justify-center bg-slate-900 border border-fuchsia-900/30 p-8 rounded-[2rem] gap-4 hover:bg-fuchsia-950/10 shadow-xl transition-all active:scale-95 group"><div className="p-4 bg-fuchsia-500/10 rounded-full text-fuchsia-500 border border-fuchsia-500/20 group-hover:scale-110 transition-transform"><Users size={32} /></div><div className="text-center font-bold text-lg text-fuchsia-200 uppercase tracking-widest">Kira</div></button>
            </div>
            <button type="button" onClick={() => setShowBankruptcyModal(true)} className="w-full bg-slate-950 border border-red-900/20 text-red-600/50 py-4 rounded-xl flex items-center justify-center gap-2 mt-12 hover:text-red-500 transition-all font-bold text-xs uppercase tracking-[0.3em]"><Skull size={16} /> İflas Et</button>
            {showBankruptcyModal && (
                <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-6"><div className="w-full max-w-sm bg-slate-900 border-2 border-red-600 rounded-3xl p-8 text-center shadow-2xl"><Skull className="w-16 h-16 text-red-600 mx-auto mb-4" /><h2 className="text-3xl font-black text-white mb-2 tracking-tighter uppercase">İflas</h2><p className="text-slate-400 text-sm mb-8 leading-relaxed">Tüm varlıklarını devredip <strong className="text-red-500">oyundan ayrılacaksınız.</strong></p><select value={beneficiary} onChange={(e) => setBeneficiary(e.target.value)} className="w-full bg-slate-950 border border-slate-700 text-white p-4 rounded-xl mb-6 outline-none focus:border-red-500"><option value="">Kime Devredilsin?</option><option value="BANKA">BANKA</option>{players.filter(p => p.id !== user.id).map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}</select><button type="button" onClick={() => beneficiary && handleBankruptcy(user.id, beneficiary)} className="w-full bg-red-600 text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 mb-4 uppercase tracking-widest">Onayla ve Çık</button><button type="button" onClick={() => setShowBankruptcyModal(false)} className="text-slate-500 font-bold uppercase text-xs tracking-widest hover:text-white">İptal</button></div></div>
            )}
        </>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 shadow-2xl animate-in zoom-in-95 ring-1 ring-slate-700/30">
          <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4"><h3 className="text-white font-bold text-xl flex items-center gap-2 uppercase tracking-widest font-bold">{mode === 'pay_bank' ? <Landmark className="text-red-500"/> : <Users className="text-fuchsia-500"/>} {mode === 'pay_bank' ? 'Ödeme' : 'Para Gönder'}</h3><button type="button" onClick={() => setMode(null)} className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2 rounded-full transition-colors"><XCircle size={20}/></button></div>
          {mode === 'pay_player' && <div className="grid grid-cols-3 gap-3 mb-8">{players.filter(p => p.id !== user.id).map(p => (<button key={p.id} type="button" onClick={() => setTargetId(p.id)} className={`p-4 rounded-2xl border flex flex-col items-center gap-2 text-xs transition-all ${targetId === p.id ? 'bg-fuchsia-600 border-fuchsia-400 text-white shadow-lg scale-105' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'}`}><div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">{(() => { const token = GAME_TOKENS.find(t => t.id === p.token); return token?.img ? <img src={token.img} alt="" className="w-full h-full object-cover" /> : token?.icon; })()}</div><span className="font-bold truncate w-full text-center tracking-tight uppercase font-bold">{p.name}</span></button>))}</div>}
          <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 mb-6 shadow-inner"><label className="text-[10px] text-slate-600 font-bold ml-1 mb-2 block uppercase tracking-widest font-bold">Tutarı Yazınız</label><input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" className="w-full bg-transparent text-5xl font-mono text-white text-center outline-none tracking-tighter font-mono" autoFocus /></div>
          <button type="button" onClick={handleSend} disabled={!amount || (mode === 'pay_player' && !targetId)} className="w-full py-5 bg-white text-slate-900 font-black text-xl rounded-2xl hover:bg-slate-100 disabled:opacity-50 shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest font-bold">Onayla <CheckCircle2 size={24} /></button>
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
  const currentDebt = calculateDebt(user.debt, user.debtStartTurn, currentTurn);

  return (
    <div className="animate-in fade-in space-y-6 pb-20 bg-slate-900 p-6 rounded-[2rem] border border-slate-800 shadow-2xl">
      <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 shadow-inner"><button type="button" onClick={() => setActiveSubTab('loan')} className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${activeSubTab === 'loan' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-600 font-bold'}`}><HandCoins size={16}/> BORÇLARIM</button><button type="button" onClick={() => setActiveSubTab('savings')} className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${activeSubTab === 'savings' ? 'bg-amber-900/30 text-amber-500 shadow-md border border-amber-900/50' : 'text-slate-600 font-bold'}`}><PiggyBank size={16}/> VADELİ</button></div>
      {activeSubTab === 'savings' && <div className="bg-gradient-to-br from-amber-950/40 to-slate-900 border border-amber-900/30 rounded-3xl p-6 shadow-xl"><div className="mb-6"><span className="text-amber-500 text-[10px] font-bold uppercase tracking-[0.3em] font-bold">Vadeli Birikim</span><div className="text-4xl font-mono text-white font-black mt-1 font-mono font-black">{user.savings.toLocaleString()} <span className="text-xl font-bold">TL</span></div></div>{user.savings > 0 ? <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800"><div className="flex justify-between items-center mb-2"><span className="text-slate-500 text-[9px] font-bold uppercase font-bold">Durum</span><span className="text-white font-mono font-bold text-xs uppercase tracking-tighter font-mono">{turnsPassed} / {(Math.floor(turnsPassed / 5) + 1) * 5} Tur Beklendi</span></div><div className="w-full bg-slate-900 rounded-full h-2 mb-4 overflow-hidden border border-slate-800"><div className={`h-full rounded-full transition-all duration-1000 ${isMilestone ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'bg-amber-500'}`} style={{ width: `${(turnsPassed % 5 === 0 && turnsPassed > 0 ? 100 : (turnsPassed % 5) * 20)}%` }}></div></div><div className="flex justify-between items-center"><span className={isMilestone ? "text-green-400 font-bold text-[10px] font-bold" : "text-slate-500 text-[10px] font-bold"}>{isMilestone ? "✅ KAZANÇ HAZIR" : "⌛ TUR BEKLENİYOR"}</span><span className={isMilestone ? "text-green-400 font-bold font-mono text-xs font-mono" : "text-slate-600 font-mono text-xs font-mono"}>+{interestAmount.toLocaleString()} TL (%{interestRate})</span></div></div> : <div className="text-slate-500 text-xs italic bg-slate-950/30 p-4 rounded-xl border border-slate-800/50 italic font-bold">💰 Paranızı vadeli hesaba yatırarak her 5 turda bir %10 kazanç sağlayabilirsiniz. Erken çekerseniz sadece ana paranızı alırsınız.</div>}<div className="mt-6 border-t border-slate-800 pt-6">{user.savings === 0 ? <div className="flex gap-2"><input type="number" value={savingsAmount} onChange={e => setSavingsAmount(e.target.value)} placeholder="0" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 font-mono text-white text-center outline-none focus:border-amber-500 shadow-inner font-mono" /><button type="button" onClick={() => { handleSavings(user.id, savingsAmount, 'DEPOSIT'); setSavingsAmount(''); }} className="bg-amber-600 text-white font-bold px-8 rounded-xl shadow-lg active:scale-95 transition-all text-xs tracking-widest uppercase font-bold">Yatır</button></div> : <button type="button" onClick={() => handleSavings(user.id, 0, 'WITHDRAW')} className={`w-full py-4 font-bold rounded-xl active:scale-95 transition-all flex flex-col items-center justify-center gap-1 shadow-lg ${isMilestone ? 'bg-green-600 text-white' : 'bg-slate-800 text-red-400 border border-red-900/20'}`}><span className="uppercase tracking-widest text-xs font-bold">{isMilestone ? 'Kazancı Çek' : 'Hesabı Kapat'}</span>{!isMilestone && <span className="text-[8px] opacity-60 font-bold">(Faiz Silinecektir!)</span>}</button>}</div></div>}
      {activeSubTab === 'loan' && <><div className="bg-gradient-to-br from-red-950/20 to-slate-900 border border-red-900/20 rounded-3xl p-6 shadow-xl"><div className="mb-6"><span className="text-red-500 text-[10px] font-bold uppercase tracking-[0.3em] font-bold">Borç Bakiyesi</span><div className="text-4xl font-mono text-white font-black mt-1 font-mono font-black">{user.debt > 0 ? currentDebt.toLocaleString() : "0"} <span className="text-xl font-bold">TL</span></div></div>{user.debt > 0 ? <div className="relative z-10"><div className="bg-slate-950/60 rounded-2xl p-5 border border-red-900/10 mb-6 shadow-inner"><div className="flex justify-between text-xs mb-2 text-slate-400 uppercase tracking-tighter font-bold"><span>Ana Para</span><span className="font-mono text-white font-mono">{user.debt.toLocaleString()} TL</span></div><div className="flex justify-between text-xs mb-2 text-slate-400 uppercase tracking-tighter font-bold"><span>Geçen Süre</span><span className="font-mono text-white font-mono">{currentTurn - user.debtStartTurn} Tur</span></div><div className="flex justify-between text-xs text-red-500 font-bold border-t border-slate-800 pt-2 mt-2 uppercase tracking-widest font-bold"><span>Faiz Oranı</span><span className="font-mono font-mono">% {((currentTurn - user.debtStartTurn) >= 2) ? (currentTurn - user.debtStartTurn - 1) * 25 : 0}</span></div></div><button type="button" onClick={() => payDebt(user.id)} className="w-full py-4 bg-white text-red-900 font-black rounded-xl hover:bg-slate-100 active:scale-95 shadow-2xl tracking-[0.2em] uppercase text-xs font-bold">Borcu Kapat</button></div> : <div className="text-slate-500 text-xs italic bg-slate-950/30 p-4 rounded-xl border border-slate-800/50 font-bold italic">Şu an borcunuz bulunmuyor. Bankacıdan kredi alabilir veya arkadaşlarınıza borç verebilirsiniz.<br/><span className="text-red-500/60 mt-2 block font-bold text-[10px] uppercase font-bold">⚠️ 1. turdan sonra faiz oranı %25 olarak artar!</span></div>}</div><div className="bg-slate-950/50 border border-slate-800 rounded-3xl p-6 shadow-xl shadow-inner"><h4 className="text-white font-bold mb-4 flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] font-bold tracking-widest"><ArrowRightLeft size={14} className="text-indigo-400"/> Borç Ver</h4><div className="flex flex-col gap-3"><select className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-white text-xs outline-none focus:border-indigo-500 font-bold" value={loanTarget} onChange={(e) => setLoanTarget(e.target.value)}><option value="">Oyuncu Seç</option>{players.filter(p => p.id !== user.id).map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}</select><div className="flex gap-2"><input type="number" placeholder="0" value={loanAmount} onChange={(e) => setLoanAmount(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-white text-lg font-mono outline-none focus:border-indigo-500 shadow-inner font-mono" /><button type="button" onClick={() => { if(loanTarget && loanAmount) { handleLoan(user.id, parseInt(loanTarget), loanAmount); setLoanAmount(''); setLoanTarget(''); } }} disabled={!loanTarget || !loanAmount} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 rounded-xl shadow-lg active:scale-95 transition-all uppercase text-[10px] tracking-widest font-bold">Gönder</button></div></div></div></>}
    </div>
  );
}

function BankerControls({ players, onTransaction, handleSalary, handleLoan }) {
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('GIVE'); 
  const [loanAmount, setLoanAmount] = useState('');
  const execute = () => { if (!amount || !selectedPlayer) return; onTransaction(type === 'GIVE' ? 'BANKA' : selectedPlayer.id, type === 'GIVE' ? selectedPlayer.id : 'BANKA', amount, type === 'GIVE' ? 'ÖZEL_BONUS' : 'CEZA_VERGİ'); setAmount(''); setSelectedPlayer(null); };

  return (
    <div className="animate-in fade-in pb-20">
      <div className="flex items-center gap-3 mb-6 p-6 bg-gradient-to-r from-amber-600 to-orange-500 rounded-[2rem] shadow-xl text-white ring-2 ring-white/10"><div className="bg-white/20 p-3 rounded-2xl"><ShieldAlert size={32} /></div><div><h3 className="font-black text-xl leading-tight uppercase tracking-tighter font-black">Bankacı Paneli</h3><p className="text-[10px] text-white/70 uppercase font-bold tracking-[0.2em] font-bold">Oyun Yönetimi</p></div></div>
      <div className="grid grid-cols-1 gap-4">{players.map(p => (<div key={p.id} className="bg-slate-900 border border-slate-800 p-5 rounded-3xl flex items-center justify-between hover:border-slate-600 transition-all shadow-lg ring-1 ring-slate-800"><div className="flex items-center gap-4"><div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center overflow-hidden shadow-inner">{(() => { const token = GAME_TOKENS.find(t => t.id === p.token); return token?.img ? <img src={token.img} alt="" className="w-full h-full object-cover"/> : token?.icon; })()}</div><div><div className="font-bold text-white flex items-center gap-2 text-base uppercase font-bold">{p.name}<span className="text-[8px] bg-slate-800 px-2 py-0.5 rounded-full text-teal-400 border border-slate-700 font-mono uppercase font-black tracking-widest font-mono">T{p.turn}</span></div><div className="text-[10px] font-mono text-slate-500 flex items-center gap-1 mt-0.5 uppercase tracking-tighter italic font-mono"><EyeOff size={12} /> Bakiye Gizlendi</div></div></div><button type="button" onClick={() => setSelectedPlayer(p)} className="bg-slate-800 hover:bg-slate-700 text-[10px] px-6 py-3 rounded-xl text-white border border-slate-700 font-black uppercase tracking-widest transition-all active:scale-95 shadow-md font-black">Yönet</button></div>))}</div>
      {selectedPlayer && <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"><div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-y-auto max-h-[90vh]"><div className="text-center mb-8"><div className="inline-block w-24 h-24 bg-slate-800 rounded-full mb-4 border-4 border-slate-700 overflow-hidden shadow-2xl">{(() => { const token = GAME_TOKENS.find(t => t.id === selectedPlayer.token); return token?.img ? <img src={token.img} alt="" className="w-full h-full object-cover"/> : token?.icon; })()}</div><h3 className="text-3xl font-black text-white tracking-tighter uppercase font-black">{selectedPlayer.name}</h3><div className="flex items-center justify-center gap-2 mt-2"><span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest font-bold">Durum:</span><span className="text-teal-500 font-mono font-bold text-xs uppercase bg-slate-800 px-3 py-1 rounded-full font-mono">Tur {selectedPlayer.turn}</span></div></div><button type="button" onClick={() => {handleSalary(selectedPlayer.id); setSelectedPlayer(null);}} className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black py-5 rounded-2xl mb-8 shadow-2xl active:scale-95 transition-all uppercase tracking-[0.15em] flex items-center justify-center gap-3 ring-1 ring-white/10 font-black"><Briefcase size={20} /> Maaş & Tur Atlat</button><div className="bg-slate-950/60 p-6 rounded-[2rem] border border-slate-800 mb-6 shadow-inner"><h4 className="text-[10px] font-black text-slate-500 mb-4 uppercase tracking-[0.2em] text-center font-bold tracking-widest font-black">Manuel İşlem</h4><div className="grid grid-cols-2 gap-3 mb-4"><button type="button" onClick={() => setType('GIVE')} className={`py-3 rounded-xl border text-[10px] font-black transition-all uppercase tracking-widest font-black ${type === 'GIVE' ? 'bg-teal-600 border-teal-400 text-white shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-600'}`}>Para Ekle</button><button type="button" onClick={() => setType('TAKE')} className={`py-3 rounded-xl border text-[10px] font-black transition-all uppercase tracking-widest font-black ${type === 'TAKE' ? 'bg-red-600 border-red-400 text-white shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-600'}`}>Para Çek</button></div><div className="flex gap-2"><input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-4 text-2xl font-mono text-white text-center outline-none focus:border-slate-600 shadow-inner font-mono" /><button type="button" onClick={execute} className="bg-white text-slate-900 font-black rounded-xl px-6 hover:bg-slate-100 uppercase text-[10px] shadow-lg transition-all active:scale-90 tracking-widest font-black">Ok</button></div></div><div className="bg-red-950/10 p-6 rounded-[2rem] border border-red-900/20 mb-4 shadow-inner"><h4 className="text-[10px] font-black text-red-500/60 mb-4 uppercase tracking-[0.2em] text-center font-bold tracking-widest font-black">Banka Kredisi Ver</h4><div className="flex gap-2"><input type="number" value={loanAmount} onChange={e => setLoanAmount(e.target.value)} placeholder="0" className="w-full bg-slate-900 border border-red-900/10 rounded-xl px-4 py-3 text-lg font-mono text-white text-center outline-none font-mono" /><button type="button" onClick={() => { if(loanAmount) { handleLoan('BANKA', selectedPlayer.id, loanAmount); setLoanAmount(''); setSelectedPlayer(null); } }} className="bg-red-600 hover:bg-red-500 text-white font-black px-6 rounded-xl text-[10px] uppercase shadow-lg transition-all active:scale-90 tracking-widest font-black">Kredi</button></div></div><button type="button" onClick={() => setSelectedPlayer(null)} className="w-full py-5 text-slate-500 text-xs font-black rounded-2xl mt-4 hover:text-white transition-all uppercase tracking-[0.4em] font-black">Kapat</button></div></div>}
    </div>
  );
}

function TransactionFeed({ transactions }) {
  if (transactions.length === 0) return <div className="text-center text-slate-600 py-16 text-sm italic animate-pulse tracking-widest uppercase font-bold font-bold italic uppercase tracking-widest">Henüz hareket yok...</div>;
  return (
    <div className="space-y-4 pb-24 animate-in fade-in"><h3 className="text-[10px] text-slate-600 font-black uppercase tracking-[0.4em] pl-2 mb-6 font-bold font-black">İşlem Geçmişi</h3>{transactions.map(t => (<div key={t.id} className={`bg-slate-900/70 border border-slate-800 p-5 rounded-3xl flex items-center justify-between shadow-xl backdrop-blur-sm group transition-all hover:bg-slate-800 ${t.type.includes('İFLAS') ? 'border-red-900/30 bg-red-950/10' : ''}`}><div className="flex items-center gap-4"><div className={`p-3 rounded-2xl shadow-inner ${t.from.includes('BANKA') || t.from === 'SİSTEM' ? 'bg-teal-500/10 text-teal-500' : (t.type.includes('İFLAS') ? 'bg-red-500/10 text-red-500' : 'bg-fuchsia-500/10 text-fuchsia-500')}`}>{t.from.includes('BANKA') || t.from === 'SİSTEM' ? <Landmark size={20} /> : (t.type.includes('İFLAS') ? <Skull size={20}/> : <LayoutGrid size={20} />)}</div><div><div className="text-sm font-black text-white mb-0.5 group-hover:text-teal-400 transition-colors uppercase tracking-tighter font-black uppercase">{t.from} <span className="text-slate-600 mx-1 font-bold">➝</span> {t.to}</div><div className="text-[9px] text-slate-500 uppercase tracking-[0.2em] font-black font-black uppercase">{t.type} • {t.time}</div></div></div><div className={`font-mono font-black text-base font-mono font-black font-mono`}>{t.amount > 0 ? t.amount.toLocaleString() : ''} {t.amount > 0 && 'TL'}</div></div>))}</div>
  );
}