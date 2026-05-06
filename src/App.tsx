import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  FileText, 
  Building2, 
  Plus, 
  Search, 
  ChevronRight, 
  Download, 
  History, 
  Settings, 
  X, 
  Trash2, 
  Edit3, 
  Calendar,
  LogOut,
  Info,
  ArrowLeft,
  FileCheck,
  Ban,
  Paperclip,
  MessageSquare,
  ExternalLink,
  PieChart,
  List
} from 'lucide-react';

import { logout, verifyPassword } from './lib/firebase';
import { useData } from './lib/useData';
import { ViolationRecord, ViolationType, ViolationLevel, Attachment } from './types';
import { exportViolationsToExcel } from './lib/export';
// import { format } from 'date-fns';

// --- Components ---

const Badge = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[13px] font-black uppercase tracking-widest border ${className}`}>
    {children}
  </span>
);

const Card = ({ children, className = "", onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) => (
  <div 
    onClick={onClick}
    className={`bg-white border border-stone-200 rounded-lg shadow-sm overflow-hidden ${onClick ? 'cursor-pointer hover:border-port-blue active:bg-stone-50 active:scale-[0.99] transition-[border-color,background-color,transform] duration-100 select-none' : ''} ${className}`}
  >
    {children}
  </div>
);

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = "", 
  disabled = false,
  type = 'button'
}: { 
  children: React.ReactNode, 
  onClick?: () => void, 
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success',
  className?: string,
  disabled?: boolean,
  type?: 'button' | 'submit'
}) => {
  const themes = {
    primary: 'bg-port-slate text-white hover:bg-[#3a3e56] active:bg-[#2d3047] active:scale-[0.97] shadow-sm',
    secondary: 'bg-white text-stone-600 hover:bg-stone-50 active:bg-stone-100 active:scale-[0.97] border border-stone-200',
    danger: 'bg-rose-500 text-white hover:bg-rose-600 active:bg-rose-700 active:scale-[0.97] shadow-sm',
    ghost: 'bg-transparent text-stone-400 hover:text-stone-700 hover:bg-stone-100 active:bg-stone-200 active:scale-[0.97]',
    success: 'bg-port-sage text-white hover:opacity-90 active:opacity-80 active:scale-[0.97] shadow-sm'
  };
  return (
    <button 
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`px-4 py-2 rounded-md text-sm font-black uppercase tracking-widest transition-[background-color,transform,opacity] duration-100 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed select-none ${themes[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const Modal = ({ isOpen, onClose, title, children, maxWidth = "max-w-xl" }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode, maxWidth?: string }) => {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setMounted(true));
    } else {
      const t = setTimeout(() => setMounted(false), 150);
      return () => clearTimeout(t);
    }
  }, [isOpen]);
  if (!mounted && !isOpen) return null;
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-150 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/50"
      />
      <div 
        className={`relative bg-white w-full ${maxWidth} rounded-lg shadow-2xl overflow-hidden border border-slate-200 transition-[transform,opacity] duration-150 ${isOpen ? 'scale-100 opacity-100' : 'scale-[0.98] opacity-0'}`}
      >
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
          <h2 className="text-[17px] font-bold text-slate-900 uppercase tracking-wider">{title}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-200 active:bg-slate-300 rounded transition-colors duration-100">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <div className="p-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

const FileUploader = ({ onFileSelect, existingFiles = [] }: { onFileSelect: (files: Attachment[]) => void, existingFiles?: Attachment[] }) => {
  const [files, setFiles] = useState<Attachment[]>(existingFiles);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;
    
    Array.from(selectedFiles).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newFile: Attachment = {
          name: file.name,
          data: event.target?.result as string,
          type: file.type
        };
        setFiles(prev => {
          const updated = [...prev, newFile];
          onFileSelect(updated);
          return updated;
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    setFiles(prev => {
      const updated = prev.filter((_, i) => i !== index);
      onFileSelect(updated);
      return updated;
    });
  };

  return (
    <div className="space-y-2">
      <div 
        className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer relative bg-slate-50/50"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const droppedFiles = e.dataTransfer.files;
          if (droppedFiles) {
            Array.from(droppedFiles).forEach(file => {
              const reader = new FileReader();
              reader.onload = (event) => {
                const newFile: Attachment = {
                  name: file.name,
                  data: event.target?.result as string,
                  type: file.type
                };
                setFiles(prev => {
                  const updated = [...prev, newFile];
                  onFileSelect(updated);
                  return updated;
                });
              };
              reader.readAsDataURL(file);
            });
          }
        }}
      >
        <input 
          type="file" 
          multiple 
          className="absolute inset-0 opacity-0 cursor-pointer" 
          onChange={handleFileChange} 
        />
        <Paperclip className="w-6 h-6 text-slate-300 mx-auto mb-2" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
          拖曳檔案至此或點擊選擇上傳<br/>
          <span className="text-slate-300 font-medium">(支援圖片、文件資料等附件)</span>
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {files.map((f, i) => (
          <div key={i} className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded text-[9px] font-bold text-slate-600 shadow-sm">
            <div className="flex items-center gap-2 truncate flex-1 pr-2">
              <FileText className="w-3 h-3 text-slate-400 flex-shrink-0" />
              <span className="truncate">{f.name}</span>
            </div>
            <button type="button" onClick={() => removeFile(i)} className="text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded transition-colors">
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<boolean>(() => sessionStorage.getItem('port_auth') === '1');
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'violations' | 'companies' | 'suspensions' | 'config'>('dashboard');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [showViolationModal, setShowViolationModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState<ViolationRecord | null>(null);
  const [showSuspensionModal, setShowSuspensionModal] = useState(false);
  const [editingViolation, setEditingViolation] = useState<ViolationRecord | null>(null);
  const [editingConfig, setEditingConfig] = useState<ViolationType | null>(null);

  // Form states
  const [formLevelFilter, setFormLevelFilter] = useState<ViolationLevel | "">("");
  const [formAttachments, setFormAttachments] = useState<Attachment[]>([]);
  const [selectedViolationForDetail, setSelectedViolationForDetail] = useState<ViolationRecord | null>(null);
  const [showAppealModal, setShowAppealModal] = useState(false);
  const [appealDescription, setAppealDescription] = useState("");
  const [appealAttachments, setAppealAttachments] = useState<Attachment[]>([]);
  const [editingAppeal, setEditingAppeal] = useState<AppealRecord | null>(null);
  const [selectedTypeId, setSelectedTypeId] = useState<string>("");
  const [otherTypeName, setOtherTypeName] = useState<string>("");

  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const { 
    companies, 
    violationTypes, 
    violations, 
    suspensions, 
    appeals,
    companyStats, 
    loading,
    addRecord, 
    updateRecord, 
    removeRecord 
  } = useData();

  const handleInitializeDefaults = useCallback(async () => {
    const defaults: Omit<ViolationType, 'id'>[] = [
      { name: '無裝卸許可證', level: '極嚴重', description: '無裝卸許可證' },
      
      { name: '1. 機具超過場地載重，且未外伸撐座或鋪設墊料', level: '重大', description: '機具超過場地載重，且未外伸撐座或鋪設墊料' },
      { name: '2. 貨物堆置超過場地載重限制', level: '重大', description: '貨物堆置超過場地載重限制' },
      { name: '3. 機具吊掛貨物超過荷重限制', level: '重大', description: '機具吊掛貨物超過荷重限制(依相關主管機關判定裁處)' },
      { name: '4. 堆高機操作超過荷重限制', level: '重大', description: '堆高機操作超過荷重限制(依相關主管機關判定裁處)' },
      
      { name: '1. 起重機具無防護措施承載或吊升人員作業', level: '一般', description: '起重機具無防護措施承載或吊升人員作業' },
      { name: '2. 吊掛或搬運作業未設立警示區', level: '一般', description: '吊掛或搬運作業未設立警示區' },
      { name: '3. 起重機具吊掛作業吊鉤或吊具無防脫落裝置', level: '一般', description: '起重機具吊掛作業吊鉤或吊具無防脫落裝置' },
      { name: '4. 堆高機無警示裝置或未開啟', level: '一般', description: '堆高機無警示裝置或未開啟' },
      { name: '5. 人員搭載於堆高機乘坐席以外(含托板等處)', level: '一般', description: '人員搭載於堆高機乘坐席以外(含托板等處)' },
      { name: '6. 吊掛作業無人員指揮', level: '一般', description: '吊掛作業無人員指揮' },
      { name: '7. 車輛機械搬運作業時無引導人員', level: '一般', description: '車輛機械搬運作業時無引導人員' },
      { name: '8. 未依指定區域堆(儲)放貨物或進行裝卸', level: '一般', description: '未依指定區域堆(儲)放貨物或進行裝卸' },
      { name: '9. 貨物滯留港區未事先申請', level: '一般', description: '貨物滯留港區未事先申請' },
      { name: '10. 堆高機超速', level: '一般', description: '堆高機超速(依相關主管機關判定裁處)' },
      
      { name: '1. 作業中未戴安全帽或反光背心', level: '輕微', description: '作業中未戴安全帽或反光背心' },
      { name: '2. 非作業車輛違規停放於【裝卸作業區】或【妨礙裝卸作業位置】或【影響交通安全(如紅線、港區道路轉彎處等)】等處', level: '輕微', description: '非作業車輛違規停放於【裝卸作業區】或【妨礙裝卸作業位置】或【影響交通安全(如紅線、港區道路轉彎處等)】等處' },
      { name: '3. 非作業人員進入裝卸作業區', level: '輕微', description: '非作業人員進入裝卸作業區' },
      { name: '4. 棄置廢棄物', level: '輕微', description: '棄置廢棄物' },
      { name: '5. 作業後未清潔現場', level: '輕微', description: '作業後未清潔現場' },
      { name: '6. 未落實環保防制措施(如未設置防塵網、未經洗車池、隨意在港區清理車斗等)', level: '輕微', description: '未落實環保防制措施(如未設置防塵網、未經洗車池、隨意在港區清理車斗等)' },
      { name: '7. 載貨掉落致危害', level: '輕微', description: '載貨掉落致危害' },
      { name: '8. 機具/車輛未適時開燈具', level: '輕微', description: '機具/車輛未適時開燈具' },
      { name: '9. 未事先申請進港或進倉裝卸作業', level: '輕微', description: '未事先申請進港或進倉裝卸作業' },
    ];

    for (const item of defaults) {
      const exists = violationTypes.some(t => t.name === item.name);
      if (!exists) {
        await addRecord('violationTypes', item);
      }
    }
  }, [violationTypes, addRecord]);

  useEffect(() => {
    const migrateLevels = async () => {
      if (loading || !user || violationTypes.length === 0) return;
      
      const needsMigration = violationTypes.some(t => t.level.includes('('));
      if (needsMigration) {
        console.log('Migrating violation levels...');
        for (const t of violationTypes) {
          if (t.level.includes('(')) {
            const cleanLevel = t.level.split(' ')[0] as ViolationLevel;
            await updateRecord('violationTypes', t.id, { level: cleanLevel });
          }
        }
      }
    };
    migrateLevels();
  }, [violationTypes, loading, user, updateRecord]);

  useEffect(() => {
    // Auto-initialize violation types if they don't exist and loading is complete
    if (!loading && user && violationTypes.length === 0) {
      handleInitializeDefaults();
    }
  }, [violationTypes, loading, user, handleInitializeDefaults]);

  useEffect(() => {
    // 保持登入狀態（關閉分頁後清除，重新開啟需再輸入密碼）
  }, []);

  const currentYear = new Date().getFullYear();
  const [viewYear, setViewYear] = useState(currentYear);

  // Filters
  const [search, setSearch] = useState("");
  const [showCancelledOnly, setShowCancelledOnly] = useState(false);

  const filteredStats = useMemo(() => {
    return companyStats.filter(s => s.company.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => b.totalPoints - a.totalPoints);
  }, [companyStats, search]);

  const filteredViolations = useMemo(() => {
    return violations.filter(v => v.year === viewYear)
      .filter(v => {
        if (showCancelledOnly && !v.isCancelled) return false;
        const co = companies.find(c => c.id === v.companyId);
        return co?.name.toLowerCase().includes(search.toLowerCase());
      });
  }, [violations, viewYear, companies, search, showCancelledOnly]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim()) return;
    setPasswordLoading(true);
    setPasswordError('');
    const ok = await verifyPassword(passwordInput.trim());
    setPasswordLoading(false);
    if (ok) {
      sessionStorage.setItem('port_auth', '1');
      setUser(true);
    } else {
      setPasswordError('密碼錯誤，請再試一次');
      setPasswordInput('');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-sm w-full p-8 text-center shadow-xl">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-black text-slate-900 mb-1 uppercase tracking-tight">港區違規管理系統</h1>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-7">請輸入系統存取密碼</p>
          <form onSubmit={handleLogin} className="space-y-3">
            {passwordError && (
              <p className="text-sm font-bold text-rose-500 bg-rose-50 border border-rose-100 rounded-md px-3 py-2">
                {passwordError}
              </p>
            )}
            <input
              type="password"
              value={passwordInput}
              onChange={e => setPasswordInput(e.target.value)}
              placeholder="輸入密碼"
              autoFocus
              className="w-full bg-slate-50 border border-slate-200 rounded-md px-4 py-3 text-center text-base font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-port-blue focus:border-transparent"
            />
            <Button type="submit" disabled={passwordLoading} className="w-full h-11 text-sm">
              {passwordLoading ? '驗證中...' : '進入系統'}
            </Button>
          </form>
          <p className="text-xs text-slate-300 font-bold uppercase tracking-widest mt-5 flex items-center justify-center gap-1">
            <span>🔒</span> 需要密碼才能存取
          </p>
        </Card>
      </div>
    );
  }

  const handleAddViolation = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const companyName = formData.get('companyName') as string;
    const date = formData.get('date') as string;
    const typeId = formData.get('type') as string;
    const otherType = formData.get('otherType') as string;
    const docNo = formData.get('docNumber') as string;
    const desc = formData.get('description') as string;

    if (!companyName || !date) return;

    // Find or create company
    const existingCo = companies.find(c => c.name === companyName);
    const coId = existingCo 
      ? existingCo.id 
      : await addRecord('companies', { name: companyName }) as string;

    const vType = violationTypes.find(t => t.id === typeId);
    
    const record: Partial<ViolationRecord> = {
      companyId: coId,
      violationTypeId: typeId || 'other',
      violationTypeName: otherType || vType?.name || '未知',
      level: (vType?.level || formData.get('level') || '一般') as ViolationLevel,
      date,
      year: new Date(date).getFullYear(),
      docNumber: docNo,
      description: desc,
      points: 1,
      isCancelled: false,
      attachments: formAttachments,
    };

    if (editingViolation) {
      await updateRecord('violations', editingViolation.id, record);
    } else {
      await addRecord('violations', record);
    }
    
    setShowViolationModal(false);
    setEditingViolation(null);
    setFormAttachments([]);
    setFormLevelFilter("");
  };

  const handleAddAppeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedViolationForDetail) return;

    if (editingAppeal) {
      await updateRecord('appeals', editingAppeal.id, {
        description: appealDescription,
        attachments: appealAttachments,
      });
    } else {
      const appealData = {
        violationId: selectedViolationForDetail.id,
        date: new Date().toISOString().split('T')[0],
        description: appealDescription,
        attachments: appealAttachments,
      };
      await addRecord('appeals', appealData);
      
      // Update violation to show it has an appeal (not finished yet)
      await updateRecord('violations', selectedViolationForDetail.id, {
        isAppealFinished: false
      });
    }
    
    setShowAppealModal(false);
    setAppealDescription("");
    setAppealAttachments([]);
    setEditingAppeal(null);
  };

  const handleAddConfig = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const level = formData.get('level') as ViolationLevel;
    const desc = formData.get('description') as string;

    if (!name || !level) return;

    const data = { name, level, description: desc };
    if (editingConfig) {
      await updateRecord('violationTypes', editingConfig.id, data);
    } else {
      await addRecord('violationTypes', data);
    }
    setShowConfigModal(false);
    setEditingConfig(null);
  };

  const handleCancelViolation = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!showCancelModal) return;
    const formData = new FormData(e.currentTarget);
    const reason = formData.get('reason') as string;
    const fileUrl = formData.get('fileUrl') as string; // Simulation of upload
    const fileName = formData.get('fileName') as string;

    await updateRecord('violations', showCancelModal.id, {
      isCancelled: true,
      cancelReason: reason,
      appeal: {
        fileUrl: fileUrl || 'https://via.placeholder.com/150',
        fileName: fileName || '相關函文.pdf',
        explanation: reason
      }
    });

    setShowCancelModal(null);
  };

  const handleAddSuspension = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const companyName = formData.get('companyName') as string;
    const start = formData.get('startDate') as string;
    const end = formData.get('endDate') as string;
    const note = formData.get('note') as string;

    if (!companyName || !start || !end) return;

    // Find or create company
    const existingCo = companies.find(c => c.name === companyName);
    const coId = existingCo 
      ? existingCo.id 
      : await addRecord('companies', { name: companyName }) as string;

    await addRecord('suspensions', {
      companyId: coId,
      startDate: start,
      endDate: end,
      note
    });

    setShowSuspensionModal(false);
  };

  const getLevelColor = (lv: ViolationLevel) => {
    switch(lv) {
      case '極嚴重': return 'bg-rose-50 text-rose-600 border-rose-100';
      case '重大': return 'bg-orange-50 text-orange-600 border-orange-100';
      case '一般': return 'bg-stone-100 text-stone-600 border-stone-200';
      case '輕微': return 'bg-port-sage/10 text-port-sage border-port-sage/20';
      default: return 'bg-stone-50 text-stone-400 border-stone-100';
    }
  };

  return (
    <div className="min-h-screen bg-port-bg font-sans text-stone-800 flex">
      {/* Sidebar Nav */}
      <nav className="fixed md:relative top-0 left-0 bottom-0 w-64 bg-port-slate text-stone-100 z-50 p-4 flex flex-col hide-mobile">
        <div className="flex items-center gap-3 px-3 py-6 border-b border-white/5 mb-6">
          <div className="w-8 h-8 bg-port-blue rounded flex items-center justify-center text-white shadow-lg shadow-black/10">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-[17px] font-black text-white tracking-tighter uppercase leading-none">Port Safety</h1>
            <p className="text-xs text-port-blue font-black uppercase mt-1 tracking-widest">港區監督管理系統</p>
          </div>
        </div>

        <div className="space-y-1">
          {[
            { id: 'dashboard', label: '面板首頁', icon: PieChart },
            { id: 'violations', label: '違規總表', icon: List },
            { id: 'companies', label: '公司清單', icon: Building2 },
            { id: 'suspensions', label: '扣證管理', icon: Ban },
            { id: 'config', label: '系統設定', icon: Settings },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id as 'dashboard' | 'violations' | 'companies' | 'suspensions' | 'config'); setSelectedCompanyId(null); }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-black uppercase tracking-widest transition-[background-color,color] duration-100 select-none ${
                activeTab === item.id 
                  ? 'bg-port-blue text-white shadow-lg shadow-black/10' 
                  : 'text-stone-200 hover:text-white hover:bg-white/5 active:bg-white/10'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-auto pt-4 border-t border-slate-800">
          <div className="px-3 mb-4">
            <p className="text-[13px] font-bold text-white uppercase tracking-wider truncate">
              系統管理員
            </p>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">系統管理員</p>
          </div>
          <button 
            onClick={() => { sessionStorage.removeItem('port_auth'); setUser(false); logout(); }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded text-sm font-bold uppercase tracking-widest text-slate-400 hover:text-white hover:bg-slate-800 active:bg-slate-700 transition-[background-color,color] duration-100 select-none"
          >
            <LogOut className="w-4 h-4" />
            <span>登出系統</span>
          </button>
        </div>
      </nav>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-12 bg-white border-b border-slate-200 flex items-center px-6 justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-bold text-slate-400 uppercase tracking-widest">管理後台</span>
            <ChevronRight className="w-4 h-4 text-slate-300" />
            <span className="text-[13px] font-bold text-slate-900 uppercase tracking-widest">
              {activeTab === 'dashboard' ? '主要面板' : 
               activeTab === 'violations' ? '違規總表' : 
               activeTab === 'companies' ? '公司清單' : 
               activeTab === 'suspensions' ? '扣證管理' : '系統設定'}
            </span>
          </div>
          
          <div className="flex items-center gap-4">
             {/* Year Selector */}
             <div className="flex bg-slate-100 rounded p-0.5">
                {[2025, 2024, 2023].map(y => (
                  <button 
                    key={y}
                    onClick={() => setViewYear(y)}
                    className={`px-3 py-1 rounded text-[13px] font-bold transition-[background-color,color] duration-100 select-none ${viewYear === y ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700 active:bg-white/70'}`}
                  >
                    {y}
                  </button>
                ))}
             </div>
             <Button variant="primary" className="h-8 px-4" onClick={() => { setFormLevelFilter(""); setShowViolationModal(true); }}>
                <Plus className="w-4 h-4" /> 新增記錄
             </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 custom-scrollbar animate-in fade-in duration-300">
        
        {/* --- DASHBOARD --- */}
        {activeTab === 'dashboard' && !selectedCompanyId && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-[23px] font-black text-slate-900 uppercase tracking-tight">高雄港商港公用場域使用須知記點面板</h2>
                <p className="text-[13px] font-bold text-slate-400 uppercase tracking-widest">即時港區安全合規監控</p>
              </div>
            </div>

            {/* Threshold Alerts */}
            {companyStats.some(s => s.isAtThreshold && !s.activeSuspension) && (
              <div className="bg-red-600 text-white rounded p-3 flex gap-4 items-center shadow-lg shadow-red-200">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
                <div className="flex-1">
                  <p className="text-[14px] font-black uppercase tracking-wider">警告：已達扣證門檻通知</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {companyStats.filter(s => s.isAtThreshold && !s.activeSuspension).map(s => (
                      <span key={s.company.id} className="text-[13px] bg-red-800/50 px-1.5 py-0.5 rounded font-bold cursor-pointer hover:bg-red-800 active:bg-red-900 transition-colors duration-75 select-none" onClick={() => setSelectedCompanyId(s.company.id)}>
                        {s.company.name} ({s.totalPoints} 點)
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: '本年度總違規', value: violations.filter(v => v.year === currentYear && !v.isCancelled).length, icon: FileText, color: 'text-blue-600', onClick: () => { setActiveTab('violations'); setShowCancelledOnly(false); } },
                { label: '營運中公司數', value: companies.length, icon: Building2, color: 'text-slate-600', onClick: () => setActiveTab('companies') },
                { label: '執行扣證中', value: companyStats.filter(s => s.activeSuspension).length, icon: Ban, color: 'text-red-600', onClick: () => setActiveTab('suspensions') },
                { label: '待處理申訴', value: violations.filter(v => v.isCancelled).length, icon: FileCheck, color: 'text-emerald-600', onClick: () => { setActiveTab('violations'); setShowCancelledOnly(true); } },
              ].map((stat, i) => (
                <Card key={i} className="p-4 flex flex-col justify-between" onClick={stat.onClick}>
                  <div>
                    <p className="text-[13px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                    <p className={`text-[33px] font-black ${stat.color}`}>{stat.value}</p>
                  </div>
                  <div className="flex justify-end mt-2">
                    <stat.icon className={`w-5 h-5 opacity-10`} />
                  </div>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[15px] font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                    高風險警示對象
                  </h3>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="關鍵字搜尋..." 
                      className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded text-[13px] font-bold w-56 focus:outline-none focus:ring-1 focus:ring-blue-500 uppercase tracking-wider"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                  </div>
                </div>
                <Card>
                  <table className="w-full text-left dense-table">
                    <thead>
                      <tr>
                        <th>公司名稱</th>
                        <th className="text-center">累計點數</th>
                        <th>目前狀態</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStats.slice(0, 10).map(stat => (
                        <tr key={stat.company.id} className="hover:bg-slate-50 transition-colors duration-75 cursor-pointer select-none" onClick={() => setSelectedCompanyId(stat.company.id)}>
                          <td className="font-bold text-[15px]">{stat.company.name}</td>
                          <td className="text-center font-black text-[17px]">
                            <span className={stat.totalPoints >= 3 ? 'text-red-600' : 'text-slate-900'}>
                              {stat.totalPoints}
                            </span>
                          </td>
                          <td>
                            {stat.activeSuspension ? (
                              <Badge className="bg-red-600 text-white">扣證中</Badge>
                            ) : stat.totalPoints >= 5 ? (
                              <Badge className="bg-orange-500 text-white">達門檻</Badge>
                            ) : (
                              <Badge className="bg-slate-100 text-slate-600">正常</Badge>
                            )}
                          </td>
                          <td className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <ChevronRight className="w-4 h-4 text-slate-300" />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              </div>

              <div className="space-y-4">
                <h3 className="text-[15px] font-black uppercase tracking-widest text-slate-900">歷史紀錄存檔</h3>
                <Card className="p-2 space-y-1">
                  {[2025, 2024, 2023].map(year => (
                    <button 
                      key={year}
                      onClick={() => { setViewYear(year); setActiveTab('violations'); }}
                      className="w-full flex items-center justify-between p-2 hover:bg-slate-50 active:bg-slate-100 rounded group transition-[background-color] duration-75 select-none"
                    >
                      <div className="flex items-center gap-2">
                        <History className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                        <span className="text-sm font-bold text-slate-600 uppercase tracking-wider">{year} 年度數據</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600" />
                    </button>
                  ))}
                  <p className="text-xs text-slate-400 p-2 italic text-center font-bold uppercase tracking-widest border-t border-slate-50 mt-2">僅提供歷史唯讀檢核</p>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* --- COMPANY DETAIL --- */}
        {selectedCompanyId && (
          <div className="space-y-6 animate-in slide-in-from-right-2 duration-300">
            <button 
              onClick={() => setSelectedCompanyId(null)}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-900 text-[13px] font-black uppercase tracking-widest mb-2 px-1"
            >
              <ArrowLeft className="w-4 h-4" /> 返回管理後台
            </button>

            {(() => {
              const stat = companyStats.find(s => s.company.id === selectedCompanyId);
              if (!stat) return null;

              return (
                <>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                    <div>
                      <div className="flex items-center gap-4 mb-1">
                        <h2 className="text-xl font-black uppercase tracking-tight">{stat.company.name}</h2>
                        {stat.activeSuspension && <Badge className="bg-red-600 text-white animate-pulse">執行扣證中</Badge>}
                      </div>
                      <div className="flex gap-4 text-[13px] text-slate-400 font-bold uppercase tracking-widest">
                        <span className="flex items-center gap-1"><Info className="w-4 h-4" /> 統一編號: {stat.company.taxId || '----'}</span>
                        <span className="flex items-center gap-1"><Building2 className="w-4 h-4" /> 業者類型: {stat.company.businessType || '----'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="p-4 flex flex-col justify-between">
                      <div>
                        <p className="text-[13px] font-black text-slate-400 uppercase tracking-widest mb-1">年度點數累計</p>
                        <p className={`text-[39px] font-black ${stat.totalPoints >= 5 ? 'text-red-600' : 'text-slate-900'}`}>{stat.totalPoints}</p>
                      </div>
                      <div className="mt-4">
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-1000 ${stat.totalPoints >= 5 ? 'bg-red-600' : 'bg-blue-600'}`}
                            style={{ width: `${Math.min(100, (stat.totalPoints / 5) * 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between mt-1 text-xs font-bold text-slate-400 uppercase tracking-widest">
                          <span>目前: {stat.totalPoints}/5 點</span>
                          <span>門檻: 100%</span>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="p-4 md:col-span-2">
                       <h4 className="text-[13px] font-black uppercase tracking-widest text-slate-900 mb-3 flex items-center gap-2">
                        <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                        扣證執行紀錄
                      </h4>
                      {suspensions.filter(s => s.companyId === selectedCompanyId).length > 0 ? (
                        <div className="space-y-1">
                          {suspensions.filter(s => s.companyId === selectedCompanyId).map(s => (
                            <div key={s.id} className="flex items-center justify-between p-2 bg-slate-50 rounded text-sm font-bold">
                              <span className="text-slate-900 uppercase tracking-wider">{s.startDate} » {s.endDate}</span>
                              <span className="text-slate-400 font-normal italic">{s.note}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="h-20 flex items-center justify-center text-[13px] text-slate-400 font-bold uppercase tracking-widest italic opacity-50 border border-dashed border-slate-200 rounded">
                          目前無執行中或歷史扣證紀錄
                        </div>
                      )}
                    </Card>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <h3 className="text-xs font-black uppercase tracking-widest">違規明細稽核</h3>
                    </div>
                    
                    <div className="space-y-2">
                      {stat.violations.filter(v => v.year === viewYear).sort((a,b) => b.date.localeCompare(a.date)).map(v => (
                        <Card key={v.id} className="p-4 group hover:bg-slate-50/50 active:bg-slate-100/80 transition-[background-color,transform] duration-75 select-none" onClick={() => setSelectedViolationForDetail(v)}>
                          <div className="flex flex-col md:flex-row justify-between gap-4">
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-3">
                                <Badge className={getLevelColor(v.level)}>{v.level}</Badge>
                                <span className="text-[15px] font-black text-slate-900 uppercase tracking-tight">{v.violationTypeName}</span>
                                {v.isCancelled && <Badge className="bg-slate-100 text-slate-400">已撤銷</Badge>}
                                {v.attachments && v.attachments.length > 0 && <Paperclip className="w-4 h-4 text-blue-500" />}
                              </div>
                              <p className="text-[14px] text-slate-500 font-medium leading-relaxed">{v.description}</p>
                              <div className="flex flex-wrap gap-4 pt-1">
                                <span className="text-[13px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1 border-r border-slate-200 pr-3"><Calendar className="w-3.5 h-3.5" /> {v.date}</span>
                                <span className="text-[13px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> 函文字號: {v.docNumber || '----'}</span>
                                {appeals.some(a => a.violationId === v.id) && (
                                  <span className={`text-[13px] font-bold uppercase tracking-wider flex items-center gap-1 ${v.isAppealFinished ? 'text-blue-500' : 'text-orange-500'}`}>
                                    <MessageSquare className="w-3.5 h-3.5" /> {v.isAppealFinished ? '申訴完成' : '申訴中'}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-2">
                              <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                                <button 
                                  onClick={() => {
                                    setEditingViolation(v);
                                    setFormLevelFilter(v.level);
                                    setSelectedTypeId(v.violationTypeId || 'other');
                                    setOtherTypeName(v.violationTypeId === 'other' ? v.violationTypeName : '');
                                    setFormAttachments(v.attachments || []);
                                    setShowViolationModal(true);
                                  }}
                                  className="p-1 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => {
                                    if (confirm('確定要執行刪除？此動作無法復原。')) {
                                      removeRecord('violations', v.id);
                                    }
                                  }}
                                  className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                                <Button variant="secondary" className="p-1 h-7 w-14 text-sm" onClick={() => setShowCancelModal(v)}>
                                  撤銷
                                </Button>
                              </div>
                              <div className="flex items-center gap-1 text-sm font-bold text-blue-600 uppercase tracking-widest md:mt-2">
                                詳細資訊 <ChevronRight className="w-4 h-4" />
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}

                      {stat.violations.filter(v => v.year === viewYear).length === 0 && (
                        <div className="p-10 text-center text-[13px] font-bold text-slate-400 uppercase tracking-widest border border-dashed border-slate-200 rounded">
                          目標年度無任何違規記錄
                        </div>
                      )}
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* --- VIOLATIONS TABLE --- */}
        {activeTab === 'violations' && (
           <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-[23px] font-black text-slate-900 uppercase tracking-tight">系統違規清冊總表</h2>
                <p className="text-[13px] font-bold text-slate-400 uppercase tracking-widest">{viewYear} 年度稽核紀錄存檔</p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => exportViolationsToExcel(filteredViolations, companies, `維修違規匯出_${viewYear}`)}>
                  <Download className="w-4 h-4" /> 匯出 Excel 存檔
                </Button>
              </div>
            </div>

            <Card>
               <div className="p-2 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                  <div className="relative w-72">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="公司名稱篩選..." 
                      className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded text-[13px] font-bold w-full focus:outline-none focus:ring-1 focus:ring-blue-500 uppercase tracking-wider"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    {showCancelledOnly && (
                      <button 
                        onClick={() => setShowCancelledOnly(false)}
                        className="mr-4 text-[13px] font-black text-emerald-600 flex items-center gap-1 hover:bg-emerald-50 px-2 py-1 rounded border border-emerald-200 uppercase tracking-widest"
                      >
                        <X className="w-4 h-4" /> 目前僅顯示撤銷件
                      </button>
                    )}
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">年度週期:</p>
                    <div className="flex bg-slate-200 rounded p-0.5">
                      {[2025, 2024, 2023].map(year => (
                        <button 
                          key={year}
                          onClick={() => setViewYear(year)}
                          className={`px-3 py-1 rounded text-xs font-black transition-[background-color,color] duration-100 select-none ${viewYear === year ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700 active:bg-white/70'}`}
                        >
                          {year}
                        </button>
                      ))}
                    </div>
                  </div>
               </div>
               <table className="w-full text-left dense-table">
                  <thead>
                    <tr>
                      <th>業者名稱</th>
                      <th>發生日期</th>
                      <th>違規等級</th>
                      <th>違規態樣</th>
                      <th>目前狀態</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredViolations.map(v => {
                      const co = companies.find(c => c.id === v.companyId);
                      return (
                        <tr key={v.id} className="hover:bg-slate-50 active:bg-slate-100 transition-colors duration-75 group select-none">
                          <td className="font-bold text-[15px]">{co?.name}</td>
                          <td className="text-[13px]">{v.date}</td>
                          <td>
                            <Badge className={getLevelColor(v.level)}>{v.level}</Badge>
                          </td>
                          <td className="max-w-[200px] truncate text-sm font-medium text-slate-500">{v.violationTypeName}</td>
                          <td>
                            {v.isCancelled ? <Badge className="bg-slate-200 text-slate-400">已撤銷</Badge> : <Badge className="bg-blue-600 text-white">正常累計</Badge>}
                          </td>
                          <td className="text-right flex justify-end gap-1">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingViolation(v);
                                setFormLevelFilter(v.level);
                                setSelectedTypeId(v.violationTypeId || 'other');
                                setOtherTypeName(v.violationTypeId === 'other' ? v.violationTypeName : '');
                                setFormAttachments(v.attachments || []);
                                setShowViolationModal(true);
                              }}
                              className="p-1 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"
                              title="編輯"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm('確定要刪除此筆記錄？')) {
                                  removeRecord('violations', v.id);
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded transition-colors"
                              title="刪除"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <Button variant="secondary" className="h-7 px-2 text-xs" onClick={() => setSelectedViolationForDetail(v)}>
                              案件詳情
                            </Button>
                            <Button variant="ghost" className="h-7 px-2 text-xs" onClick={() => setSelectedCompanyId(v.companyId)}>
                              公司明細
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
               </table>
               {filteredViolations.length === 0 && <div className="p-20 text-center text-[13px] font-bold text-slate-300 uppercase tracking-widest italic">查無符合搜尋條件之違規記錄</div>}
            </Card>
           </div>
        )}

        {/* --- COMPANIES TAB --- */}
        {activeTab === 'companies' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-[23px] font-black text-slate-900 uppercase tracking-tight">業者通訊錄目錄</h2>
                <p className="text-[13px] font-bold text-slate-400 uppercase tracking-widest">港區註冊營運業者完整清單</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {companies.map(co => (
                <Card key={co.id} className="p-3">
                  <div className="flex items-start justify-between mb-2">
                     <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center text-slate-400">
                      <Building2 className="w-4 h-4" />
                     </div>
                     <div className="text-right">
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">累計記錄數</p>
                        <p className="text-[17px] font-black">{violations.filter(v => v.companyId === co.id).length}</p>
                     </div>
                  </div>
                  <h3 className="text-[14px] font-black uppercase tracking-tight mb-1 truncate">{co.name}</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-3">統編: {co.taxId || '----'}</p>
                  <div className="flex gap-1">
                    <Button variant="secondary" className="w-full h-7 text-xs" onClick={() => setSelectedCompanyId(co.id)}>
                      數據查看
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* --- SUSPENSIONS TAB --- */}
        {activeTab === 'suspensions' && (
          <div className="space-y-4">
             <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-[23px] font-black text-slate-900 uppercase tracking-tight">存取控制 (扣證管理)</h2>
                <p className="text-[13px] font-bold text-slate-400 uppercase tracking-widest">目前執行中之各項限制管理清冊</p>
              </div>
              <Button onClick={() => setShowSuspensionModal(true)}>
                <Plus className="w-4 h-4" /> 新錄扣證紀錄
              </Button>
            </div>

            <Card>
              <table className="w-full text-left dense-table">
                  <thead>
                    <tr>
                      <th>業者名稱</th>
                      <th>生效日期</th>
                      <th>結束日期</th>
                      <th>內部備註</th>
                      <th>執行狀態</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {suspensions.sort((a,b) => b.startDate.localeCompare(a.startDate)).map(s => {
                      const co = companies.find(c => c.id === s.companyId);
                      const today = new Date().toISOString().split('T')[0];
                      const isActive = s.startDate <= today && s.endDate >= today;
                      
                      return (
                        <tr key={s.id}>
                          <td className="font-bold text-[15px]">{co?.name}</td>
                          <td className="text-[13px] text-slate-500">{s.startDate}</td>
                          <td className="text-[13px] text-slate-500">{s.endDate}</td>
                          <td className="text-slate-400 text-[13px] italic truncate max-w-[200px]">{s.note}</td>
                          <td>
                            {isActive ? <Badge className="bg-red-600 text-white">執行中</Badge> : <Badge className="bg-slate-200 text-slate-400">已到期</Badge>}
                          </td>
                          <td className="text-right">
                             <Button variant="ghost" className="p-1 h-7 w-7" onClick={() => { if(confirm('確定要刪除此筆記錄？')) removeRecord('suspensions', s.id) }}>
                              <Trash2 className="w-4 h-4" />
                             </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
               </table>
               {suspensions.length === 0 && <div className="p-20 text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest italic">目前系統中無任何執行中之扣證紀錄</div>}
            </Card>
          </div>
        )}

        {/* --- CONFIG TAB --- */}
        {activeTab === 'config' && (
          <div className="space-y-4">
             <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-[23px] font-black text-slate-900 uppercase tracking-tight">系統各項參數設定</h2>
                <p className="text-[13px] font-bold text-slate-400 uppercase tracking-widest">權責政策與資料關聯配置</p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={handleInitializeDefaults}>
                  初始化預設值
                </Button>
                <Button onClick={() => setShowConfigModal(true)}>
                  <Plus className="w-4 h-4" /> 新增政策
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {violationTypes.sort((a,b) => a.level.localeCompare(b.level)).map(type => (
                <Card key={type.id} className="p-4 flex flex-col justify-between group">
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={getLevelColor(type.level)}>{type.level}</Badge>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" className="p-1 h-6 w-6" onClick={() => { setEditingConfig(type); setShowConfigModal(true); }}>
                          <Edit3 className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" className="p-1 h-6 w-6 text-red-600" onClick={() => { if(confirm('確定要刪除此政策？')) removeRecord('violationTypes', type.id) }}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <h4 className="text-sm font-black uppercase tracking-tight mb-1">{type.name}</h4>
                    <p className="text-[13px] text-slate-500 font-medium leading-relaxed line-clamp-3">{type.description}</p>
                  </div>
                </Card>
              ))}
            </div>
            {violationTypes.length === 0 && (
              <div className="p-20 text-center bg-white border border-slate-200 rounded">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic opacity-50">尚未初始化任何政策定義</p>
              </div>
            )}
          </div>
        )}
      </main>
      </div>

      {/* --- MODALS --- */}

      {/* Violation App Add/Edit Modal */}
      <Modal 
        isOpen={showViolationModal} 
        onClose={() => { setShowViolationModal(false); setEditingViolation(null); setFormLevelFilter(""); }} 
        title={editingViolation ? "修改違規事件記錄" : "登記新違規事件"}
      >
        <form onSubmit={handleAddViolation} className="space-y-3">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">業者名稱</label>
            <input 
              name="companyName" 
              list="companies-list" 
              required 
              placeholder="請輸入或選擇業者名稱"
              className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-600" 
              defaultValue={companies.find(c => c.id === (editingViolation?.companyId || selectedCompanyId))?.name || ""} 
            />
            <datalist id="companies-list">
              {companies.map(c => <option key={c.id} value={c.name} />)}
            </datalist>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[13px] font-black uppercase tracking-widest text-slate-400 mb-1 block">發生日期</label>
              <input name="date" type="date" required className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-blue-600" defaultValue={editingViolation?.date || new Date().toISOString().split('T')[0]} />
            </div>
            <div>
              <label className="text-[13px] font-black uppercase tracking-widest text-slate-400 mb-1 block">違規分結</label>
              <select 
                name="level" 
                required
                value={formLevelFilter}
                onChange={(e) => {
                  setFormLevelFilter(e.target.value as ViolationLevel);
                  setSelectedTypeId("");
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                <option value="">-- 全部級別 --</option>
                <option value="輕微">輕微違規</option>
                <option value="一般">一般違規</option>
                <option value="重大">重大違規</option>
                <option value="極嚴重">極嚴重違規</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="text-[13px] font-black uppercase tracking-widest text-slate-400 mb-1 block">違規態樣分類</label>
              <select 
                name="type" 
                required
                value={selectedTypeId}
                onChange={(e) => setSelectedTypeId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-blue-600" 
              >
                <option value="">{formLevelFilter ? `-- 請選擇 ${formLevelFilter} 類別態樣 --` : "-- 請選擇違規態樣 --"}</option>
                {violationTypes
                  .filter(t => !formLevelFilter || t.level === formLevelFilter)
                  .map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                <option value="other">其他 (最後一格寫其他)</option>
              </select>
            </div>
          </div>

          {(selectedTypeId === 'other' || (!selectedTypeId && editingViolation?.violationTypeId === 'other')) && (
            <div className="space-y-1 animate-in slide-in-from-top-1 duration-150">
              <label className="text-[12px] font-black uppercase tracking-widest text-slate-400 mb-1 block">自定義態樣名稱</label>
              <input 
                name="otherType" 
                required
                value={otherTypeName}
                onChange={(e) => setOtherTypeName(e.target.value)}
                placeholder="請輸入自定義態樣內容..." 
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-blue-600" 
              />
            </div>
          )}

          <div>
            <label className="text-[13px] font-black uppercase tracking-widest text-slate-400 mb-1 block">違規函號</label>
            <input name="docNumber" placeholder="如：港務字第..." className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-blue-600" defaultValue={editingViolation?.docNumber || ""} />
          </div>

          <div>
            <label className="text-[13px] font-black uppercase tracking-widest text-slate-400 mb-1 block">詳細事由描述</label>
            <textarea 
              name="description" 
              rows={3} 
              placeholder="請輸入詳細違規情事描述..." 
              className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-600" 
              defaultValue={editingViolation?.description || ""}
            />
          </div>

          <div>
            <label className="text-[13px] font-black uppercase tracking-widest text-slate-400 mb-1 block">上傳檢附附件 (可拖曳上傳)</label>
            <FileUploader 
              onFileSelect={setFormAttachments} 
              existingFiles={editingViolation?.attachments || []} 
            />
          </div>

          <div className="pt-2 flex gap-2">
            <Button type="submit" className="flex-1 h-10 text-sm font-black uppercase tracking-widest">
              {editingViolation ? "存回變更" : "正式登記違規"}
            </Button>
            <Button onClick={() => { setShowViolationModal(false); setEditingViolation(null); setSelectedTypeId(""); setOtherTypeName(""); }} variant="secondary" className="h-10 px-6 text-sm font-black uppercase tracking-widest">取消</Button>
          </div>
        </form>
      </Modal>

      {/* Violation Detail Modal */}
      <Modal 
        isOpen={!!selectedViolationForDetail} 
        onClose={() => { setSelectedViolationForDetail(null); setShowDeleteConfirm(false); }} 
        title="違規案件稽核詳情"
        maxWidth="max-w-3xl"
      >
        {selectedViolationForDetail && (
          <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Badge className={getLevelColor(selectedViolationForDetail.level)}>{selectedViolationForDetail.level}</Badge>
                  <h3 className="text-[15px] font-black text-slate-900 uppercase tracking-tight">{selectedViolationForDetail.violationTypeName}</h3>
                </div>
                <div className="flex gap-4 text-[13px] font-bold text-slate-400 uppercase tracking-widest">
                  <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {selectedViolationForDetail.date}</span>
                  <span className="flex items-center gap-1"><FileText className="w-4 h-4" /> 字號: {selectedViolationForDetail.docNumber || '無'}</span>
                </div>
              </div>
              <div className="flex gap-2">
                {showDeleteConfirm ? (
                  <div className="flex bg-rose-50 border border-rose-100 rounded-lg overflow-hidden group">
                    <button 
                      onClick={async () => {
                        await removeRecord('violations', selectedViolationForDetail.id);
                        setSelectedViolationForDetail(null);
                        setShowDeleteConfirm(false);
                      }}
                      className="px-3 py-1 bg-rose-500 text-white text-[13px] font-black uppercase tracking-widest hover:bg-rose-600 transition-colors"
                    >
                      確認刪除
                    </button>
                    <button 
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-3 py-1 bg-white text-stone-400 text-[13px] font-black uppercase tracking-widest hover:bg-stone-50 transition-colors"
                    >
                      取消
                    </button>
                  </div>
                ) : (
                  <Button variant="danger" className="h-8 px-3 text-sm font-black uppercase tracking-widest" onClick={() => setShowDeleteConfirm(true)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
                <Button variant="secondary" className="h-8 px-4 text-sm font-black uppercase tracking-widest" onClick={() => { setEditingViolation(selectedViolationForDetail); setFormLevelFilter(selectedViolationForDetail.level); setShowViolationModal(true); setFormAttachments(selectedViolationForDetail.attachments || []); setSelectedViolationForDetail(null); }}>
                  <Edit3 className="w-4 h-4 mr-1" /> 編輯資料
                </Button>
                {!selectedViolationForDetail.isAppealFinished ? (
                  <>
                    <Button variant="primary" className="h-8 px-4 text-sm font-black uppercase tracking-widest" onClick={() => { setEditingAppeal(null); setAppealDescription(""); setAppealAttachments([]); setShowAppealModal(true); }}>
                      <MessageSquare className="w-4 h-4 mr-1" /> 新增申訴
                    </Button>
                    {appeals.some(a => a.violationId === selectedViolationForDetail.id) && (
                      <Button variant="success" className="h-8 px-4 text-sm font-black uppercase tracking-widest" onClick={async () => {
                        await updateRecord('violations', selectedViolationForDetail.id, { isAppealFinished: true });
                        setSelectedViolationForDetail(prev => prev ? { ...prev, isAppealFinished: true } : null);
                      }}>
                        <FileCheck className="w-4 h-4 mr-1" /> 結案申訴
                      </Button>
                    )}
                  </>
                ) : (
                  <Badge className="bg-blue-50 text-blue-500 border-blue-100 h-8 px-4 flex items-center gap-1">
                    <FileCheck className="w-4 h-4" /> 申訴程序已結案
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-[13px] font-black uppercase tracking-widest text-slate-400 mb-2">事件說明內容</h4>
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-4">
                  <p className="text-[15px] font-medium text-slate-700 leading-relaxed whitespace-pre-wrap">{selectedViolationForDetail.description}</p>
                </div>
              </div>

              {selectedViolationForDetail.attachments && selectedViolationForDetail.attachments.length > 0 && (
                <div>
                  <h4 className="text-[13px] font-black uppercase tracking-widest text-slate-400 mb-2">檢附證明附件 ({selectedViolationForDetail.attachments.length})</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedViolationForDetail.attachments.map((file, i) => (
                      <a key={i} href={file.data} download={file.name} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg hover:border-blue-400 active:bg-slate-50 transition-[border-color,background-color] duration-100 group">
                        <div className="w-8 h-8 bg-slate-50 rounded flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors">
                          <Paperclip className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-bold text-slate-700 truncate">{file.name}</p>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{file.type.indexOf('/') !== -1 ? file.type.split('/')[1]?.toUpperCase() : 'FILE'}</p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-slate-300" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[13px] font-black uppercase tracking-widest text-slate-400">申訴審核紀錄及後續說明</h4>
                </div>
                
                <div className="space-y-4">
                  {appeals.filter(a => a.violationId === selectedViolationForDetail.id).length > 0 ? (
                    appeals.filter(a => a.violationId === selectedViolationForDetail.id).map(appeal => (
                      <div key={appeal.id} className="relative pl-6 border-l-2 border-slate-100">
                        <div className="absolute left-[-5px] top-0 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"></div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{appeal.date} 提報申訴</span>
                          <button 
                            onClick={() => {
                              setEditingAppeal(appeal);
                              setAppealDescription(appeal.description);
                              setAppealAttachments(appeal.attachments || []);
                              setShowAppealModal(true);
                            }}
                            className="text-[13px] font-black text-port-blue hover:text-slate-600 uppercase tracking-widest transition-colors flex items-center gap-1"
                          >
                            <Edit3 className="w-3.5 h-3.5" /> 編輯紀錄
                          </button>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
                          <p className="text-[15px] font-medium text-slate-600 leading-relaxed mb-3 whitespace-pre-wrap">{appeal.description}</p>
                          {appeal.attachments && appeal.attachments.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {appeal.attachments.map((file, i) => (
                                <a key={i} href={file.data} download={file.name} className="flex items-center gap-2 px-2 py-1 bg-slate-50 border border-slate-100 rounded text-[13px] font-bold text-slate-500 hover:text-blue-600 hover:bg-white active:bg-slate-100 transition-[background-color,color] duration-75">
                                  <Paperclip className="w-4 h-4" />
                                  <span className="max-w-[150px] truncate">{file.name}</span>
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
                      <MessageSquare className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                      <p className="text-[13px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                        目前尚無申訴紀錄資料<br/>
                        <span className="text-slate-300 font-medium">若對此案件有疑義可點選上方「新增申訴」</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal 
        isOpen={showAppealModal} 
        onClose={() => { setShowAppealModal(false); setEditingAppeal(null); }} 
        title={editingAppeal ? "編輯申訴/後續說明" : "新增申訴/後續說明紀錄"}
      >
        <form onSubmit={handleAddAppeal} className="space-y-4">
          <div className="bg-stone-50 border border-stone-100 p-4 rounded-lg">
            <h4 className="text-[13px] font-black uppercase tracking-widest text-stone-500 mb-1 flex items-center gap-2">
              <Info className="w-4 h-4" /> 申訴填寫說明
            </h4>
            <p className="text-[11px] font-medium text-stone-400 leading-relaxed">
              請在此詳述申訴理由、現場實際情況說明或改善計畫內容。如需檢附相關函文、現場照片等證明資料，請透過下方上傳功能附件提供。
            </p>
          </div>

          <div>
            <label className="text-[13px] font-black uppercase tracking-widest text-slate-400 mb-1 block">申訴內容說明</label>
            <textarea 
              value={appealDescription}
              onChange={e => setAppealDescription(e.target.value)}
              required 
              placeholder="請詳細輸入說明事項..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-port-blue h-32 tracking-wider"
            ></textarea>
          </div>

          <div>
            <label className="text-[13px] font-black uppercase tracking-widest text-slate-400 mb-1 block">上傳申訴證明附件</label>
            <FileUploader onFileSelect={setAppealAttachments} existingFiles={appealAttachments} />
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1 uppercase text-sm font-black tracking-widest" type="button" onClick={() => { setShowAppealModal(false); setEditingAppeal(null); }}>取消返回</Button>
            <Button variant="primary" className="flex-[2] uppercase text-sm font-black tracking-widest" type="submit">
              {editingAppeal ? "存回變更" : "確認提交申訴紀錄"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!showCancelModal} onClose={() => setShowCancelModal(null)} title="撤銷違規事件記錄">
        <form onSubmit={handleCancelViolation} className="space-y-4">
          <div className="bg-rose-50 p-3 rounded-lg border border-rose-100 flex gap-3 items-start">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <p className="text-[13px] text-rose-700 font-black leading-relaxed uppercase tracking-tight">
              動作確認：撤銷此記錄將使其不計入年度點數累計。稽核日誌仍會保留存檔。
            </p>
          </div>

          <div>
            <label className="text-[13px] font-black uppercase tracking-widest text-slate-400 mb-1 block">撤銷理由說明</label>
            <textarea 
              name="reason" 
              required 
              rows={3} 
              placeholder="請提供官方撤銷之法律或行政理由..." 
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-port-blue" 
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
             <div className="space-y-1">
                <label className="text-[13px] font-black uppercase tracking-widest text-slate-400 mb-1 block">附件字號</label>
                <input name="fileName" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-sm font-bold" placeholder="附件字號.pdf" />
             </div>
             <div className="space-y-1">
                <label className="text-[13px] font-black uppercase tracking-widest text-slate-400 mb-1 block">內部連結 (URL)</label>
                <input name="fileUrl" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-sm font-bold" placeholder="https://..." />
             </div>
          </div>

          <Button type="submit" variant="danger" className="w-full h-11 mt-2 text-sm font-black uppercase tracking-widest">
            確認執行撤銷 (不計點)
          </Button>
        </form>
      </Modal>

      <Modal isOpen={showConfigModal} onClose={() => { setShowConfigModal(false); setEditingConfig(null); }} title="內部政策參數配置">
        <form onSubmit={handleAddConfig} className="space-y-4">
           <div>
              <label className="text-[13px] font-black uppercase tracking-widest text-slate-400 mb-1 block">政策標題名稱</label>
              <input name="name" required className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-blue-600" defaultValue={editingConfig?.name || ""} />
           </div>
           <div>
              <label className="text-[13px] font-black uppercase tracking-widest text-slate-400 mb-1 block">級別 / 嚴重度</label>
              <select name="level" required className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-blue-600" defaultValue={editingConfig?.level || "一般"}>
                {['極嚴重', '重大', '一般', '輕微'].map(lv => <option key={lv} value={lv}>{lv}</option>)}
              </select>
           </div>
           <div>
              <label className="text-[13px] font-black uppercase tracking-widest text-slate-400 mb-1 block">詳細內容規定</label>
              <textarea name="description" rows={4} className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-600" defaultValue={editingConfig?.description || ""} />
           </div>
           <Button type="submit" className="w-full h-11 mt-2 text-sm font-black uppercase tracking-widest">更新系統參數</Button>
        </form>
      </Modal>

      <Modal isOpen={showSuspensionModal} onClose={() => setShowSuspensionModal(false)} title="實施扣證管制程序">
        <form onSubmit={handleAddSuspension} className="space-y-4">
          <div>
             <label className="text-[13px] font-black uppercase tracking-widest text-slate-400 mb-1 block">目標業者名稱</label>
             <input 
                name="companyName" 
                list="comp-list-susp" 
                required 
                placeholder="請輸入或選擇業者名稱"
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-blue-600" 
                defaultValue={companies.find(c => c.id === selectedCompanyId)?.name || ""} 
             />
             <datalist id="comp-list-susp">
                {companies.map(c => <option key={c.id} value={c.name} />)}
             </datalist>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
               <label className="text-[13px] font-black uppercase tracking-widest text-slate-400 mb-1 block">生效開始日期</label>
               <input name="startDate" type="date" required className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-blue-600" />
            </div>
            <div>
               <label className="text-[13px] font-black uppercase tracking-widest text-slate-400 mb-1 block">生效結束日期</label>
               <input name="endDate" type="date" required className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-blue-600" />
            </div>
          </div>
          <div>
             <label className="text-[13px] font-black uppercase tracking-widest text-slate-400 mb-1 block">稽核備註說明</label>
             <textarea name="note" rows={2} placeholder="請輸入必要之內部備註..." className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-600" />
          </div>
          <Button type="submit" variant="danger" className="w-full h-11 mt-2 text-sm font-black uppercase tracking-widest">正式執行扣證管制</Button>
        </form>
      </Modal>

    </div>
  );
}
