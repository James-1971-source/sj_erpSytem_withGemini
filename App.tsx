import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
    LayoutDashboard, Mail, FileCheck, MessageSquare, Files, Users, FileText, Calendar, Database, LogOut, 
    Bell, User, ChevronDown, Search, Home, Briefcase, Power, MoreHorizontal, ChevronLeft, Trash2, Archive, 
    Send, FileWarning, Inbox, Star, Paperclip, CornerUpLeft, CornerUpRight, Trash, EllipsisVertical, ChevronsLeft,
    ChevronsRight, ChevronRight, CheckSquare, Settings, Video, X, Clock, Folder, File as FileIcon, FileType, PlusCircle, Edit, UploadCloud
} from 'lucide-react';

// --- TYPES ---
type UserProfile = { id: number; name: string; team: string; position: string; email: string; phone: string; avatar: string; };
type NavItem = { id: string; label: string; icon: React.ElementType; count?: number; };
type Email = { id: number; from: string; to?: string; subject: string; body?: string; date: string; unread: boolean; important: boolean; hasAttachment: boolean; size: string; mailbox: 'inbox' | 'sent' | 'spam' | 'trash' | 'archive' | 'draft'; };
type Approval = { id: number; title: string; requester: string; date: string; status: 'pending' | 'approved' | 'rejected'; content?: string; };
type Post = { id: number; title: string; author: string; date: string; views: number; content: string; };
type ChatMessage = { id: number; user: Pick<UserProfile, 'name' | 'team' | 'avatar'>; text: string; timestamp: string; isCurrentUser: boolean; };
type ScheduleEventType = '업무' | '부서' | '회사';
type ScheduleEvent = { id: number; title: string; start: Date; end: Date; type: ScheduleEventType; owner: string; color: string; };
type Document = { id: number; name: string; type: 'folder' | 'pdf' | 'docx' | 'txt'; owner: string; modifiedDate: string; size: string | null; parentId: number | null; };

// --- MOCK DATA ---
const userProfile: UserProfile = { id: 1, name: '김민수', team: '교육팀', position: '교육팀장', email: 'mskim@sj-hs.or.kr', phone: '010-1234-5678', avatar: '김' };

const initialUsers: UserProfile[] = [
    userProfile,
    { id: 2, name: '이수진', team: '디자인팀', position: '디자이너', email: 'sjlee@sj-hs.or.kr', phone: '010-2345-6789', avatar: '이' },
    { id: 3, name: '박서준', team: '개발팀', position: '개발자', email: 'sjpark@sj-hs.or.kr', phone: '010-3456-7890', avatar: '박' },
    { id: 4, name: '최은지', team: '인사팀', position: '인사담당자', email: 'ejchoi@sj-hs.or.kr', phone: '010-4567-8901', avatar: '최' },
];

const initialEmails: Email[] = [
    { id: 1, from: 'NICE평가정보', subject: '[NICE지키미] 윤*성님의 대출정보가 변경됐습니다.', date: '2025-09-20 11:06', unread: true, important: true, hasAttachment: false, size: '13.77 KB', mailbox: 'inbox' },
    { id: 2, from: '삼성화재', subject: '[삼성화재] 개인정보 이용내역 안내', date: '2025-09-19 16:30', unread: false, important: false, hasAttachment: true, size: '13.95 KB', mailbox: 'inbox' },
    { id: 3, from: 'bizmeka 관리자', subject: '[결재문서 승인(참조)요청] [(사)S&J 희망나눔] 휴가신청_9/19(금) 오전반차', date: '2025-09-19 11:38', unread: false, important: false, hasAttachment: false, size: '7.89 KB', mailbox: 'inbox' },
    { id: 4, from: '김동현', subject: '[외국어교육지원사업] 2025 하반기 활동가 리스트 재공유', date: '2025-09-19 10:54', unread: true, important: false, hasAttachment: false, size: '26.33 KB', mailbox: 'inbox' },
    { id: 5, from: '서울시청', subject: '22일부터 소비쿠폰 2차 접수, 1차와 달라진 점은?', date: '2025-09-19 05:02', unread: false, important: false, hasAttachment: true, size: '156.6 KB', mailbox: 'inbox' },
    { id: 6, from: '김민수', to: '박서준', subject: 'Re: 2025년 워크샵 장소 추천', date: '2025-09-18 14:00', unread: false, important: false, hasAttachment: false, size: '10.2 KB', mailbox: 'sent' },
    { id: 7, from: '(광고) 주식정보', subject: '반드시 오를 종목! 지금 확인하세요.', date: '2025-09-18 11:00', unread: true, important: false, hasAttachment: false, size: '25.1 KB', mailbox: 'spam' },
    { id: 8, from: '이혜진', subject: '삭제된 회의록 복구 요청', date: '2025-09-17 09:30', unread: false, important: false, hasAttachment: false, size: '5.5 KB', mailbox: 'trash' },
    { id: 9, from: '김민수', subject: '(초안) 2025년 4분기 사업 계획', date: '2025-09-21 15:00', unread: false, important: false, hasAttachment: true, size: '256 KB', mailbox: 'draft' },
    { id: 10, from: '김민수', subject: '참고: 경쟁사 분석 자료', date: '2025-09-20 18:30', unread: true, important: false, hasAttachment: false, size: '5.2 KB', mailbox: 'archive' },
];

const initialApprovals: Approval[] = [
    { id: 1, title: '2025년 3분기 예산안', requester: '박서준', date: '2024-09-20', status: 'pending', content: '2025년 3분기 예산안입니다. 검토 후 승인 부탁드립니다.' },
    { id: 2, title: '휴가 신청서 (2024-10-01)', requester: '이하나', date: '2024-09-19', status: 'pending', content: '개인 사정으로 10월 1일 휴가를 신청합니다.' },
    { id: 3, title: '장비 구매 요청', requester: '최민준', date: '2024-09-18', status: 'approved', content: '개발팀 신규 모니터 3대 구매 요청.' },
];

const initialPosts: Post[] = [
    { id: 1, title: '2025년도 워크샵 장소 공지', author: '인사팀', date: '2024-09-20', views: 102, content: '2025년도 워크샵은 제주도에서 진행될 예정입니다. 자세한 일정은 추후 공지하겠습니다.' },
    { id: 2, title: '사내 IT 시스템 점검 안내 (9/22)', author: 'IT지원팀', date: '2024-09-19', views: 253, content: '9월 22일 00:00 ~ 02:00 까지 시스템 점검이 있습니다. 해당 시간에는 ERP 접속이 불가능합니다.' },
];

const initialChatMessages: ChatMessage[] = [
  { id: 1, user: { name: '이수진', team: '디자인팀', avatar: '이' }, text: '안녕하세요! 오늘 오후 회의 자료 준비 다 되셨나요?', timestamp: '오후 2:01', isCurrentUser: false },
  { id: 2, user: { name: userProfile.name, team: userProfile.team, avatar: userProfile.avatar }, text: '네, 거의 다 됐습니다. 최종 검토만 남았어요.', timestamp: '오후 2:02', isCurrentUser: true },
  { id: 3, user: { name: '박서준', team: '개발팀', avatar: '박' }, text: '회의실 예약은 제가 해뒀습니다. 3시, 대회의실입니다.', timestamp: '오후 2:03', isCurrentUser: false },
  { id: 4, user: { name: userProfile.name, team: userProfile.team, avatar: userProfile.avatar }, text: '감사합니다! 그럼 10분 전까지 최종본 공유 드릴게요.', timestamp: '오후 2:04', isCurrentUser: true },
];

const today = new Date();
const initialSchedules: ScheduleEvent[] = [
    { id: 1, title: '주간 업무 보고', start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0), end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 30), type: '업무', owner: '김민수', color: 'blue' },
    { id: 2, title: '교육팀 정기 회의', start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0), end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 15, 0), type: '부서', owner: '교육팀', color: 'green' },
    { id: 3, title: '전사 워크샵', start: new Date(2025, 8, 26), end: new Date(2025, 8, 26), type: '회사', owner: 'S&J희망나눔', color: 'purple' },
    { id: 4, title: '개천절', start: new Date(2025, 9, 3), end: new Date(2025, 9, 3), type: '회사', owner: 'S&J희망나눔', color: 'red' },
];

const initialDocuments: Document[] = [
    { id: 1, name: '공용문서', type: 'folder', owner: '관리자', modifiedDate: '2024-09-01', size: null, parentId: null },
    { id: 2, name: '인사팀', type: 'folder', owner: '최은지', modifiedDate: '2024-09-10', size: null, parentId: null },
    { id: 3, name: '교육팀', type: 'folder', owner: '김민수', modifiedDate: '2024-09-15', size: null, parentId: null },
    { id: 4, name: '2025년 휴가 규정.pdf', type: 'pdf', owner: '최은지', modifiedDate: '2024-09-11', size: '1.2MB', parentId: 2 },
    { id: 5, name: '신입사원 교육자료.docx', type: 'docx', owner: '김민수', modifiedDate: '2024-09-18', size: '5.4MB', parentId: 3 },
    { id: 6, name: '사내 로고 파일.zip', type: 'txt', owner: '이수진', modifiedDate: '2024-09-05', size: '10.8MB', parentId: 1 },
    { id: 7, name: '회의록', type: 'folder', owner: '관리자', modifiedDate: '2024-09-20', size: null, parentId: 1 },
    { id: 8, name: '20240920_주간회의록.txt', type: 'txt', owner: '김민수', modifiedDate: '2024-09-20', size: '25KB', parentId: 7 },
];


const getScheduleColor = (type: ScheduleEventType) => {
    switch (type) {
        case '업무': return 'blue';
        case '부서': return 'green';
        case '회사': return 'purple';
        default: return 'gray';
    }
}

// --- HELPER HOOK for screen size ---
const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return isMobile;
};

// --- MAIN APP COMPONENT ---
export default function App() {
    const isMobile = useIsMobile();
    const [activeMenu, setActiveMenu] = useState('대시보드');
    const [mobileView, setMobileView] = useState('home'); 
    const [mobileHistory, setMobileHistory] = useState<string[]>(['home']);

    // --- All Data States ---
    const [users, setUsers] = useState<UserProfile[]>(initialUsers);
    const [emails, setEmails] = useState<Email[]>(initialEmails);
    const [approvals, setApprovals] = useState<Approval[]>(initialApprovals);
    const [posts, setPosts] = useState<Post[]>(initialPosts);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>(initialChatMessages);
    const [schedules, setSchedules] = useState<ScheduleEvent[]>(initialSchedules);
    const [documents, setDocuments] = useState<Document[]>(initialDocuments);
    
    // --- CRUD Handlers ---
    const handleSaveUser = (user: UserProfile) => {
      if (user.id) {
        setUsers(users.map(u => u.id === user.id ? user : u));
      } else {
        const newUser = { ...user, id: Date.now(), avatar: user.name.charAt(0) };
        setUsers([...users, newUser]);
      }
    };
    const handleDeleteUser = (userId: number) => {
      if (window.confirm('이 사용자를 삭제하시겠습니까?')) {
        setUsers(users.filter(u => u.id !== userId));
      }
    };

    const handleSavePost = (post: Post) => {
      if (post.id) {
        setPosts(posts.map(p => p.id === post.id ? post : p));
      } else {
        const newPost = { ...post, id: Date.now(), author: userProfile.name, date: new Date().toISOString().split('T')[0], views: 0 };
        setPosts([newPost, ...posts]);
      }
    };
    const handleDeletePost = (postId: number) => {
      if (window.confirm('이 게시물을 삭제하시겠습니까?')) {
        setPosts(posts.filter(p => p.id !== postId));
      }
    };

    const handleSaveApproval = (approval: Approval) => {
        const newApproval = { ...approval, id: Date.now(), requester: userProfile.name, date: new Date().toISOString().split('T')[0], status: 'pending' as const };
        setApprovals([newApproval, ...approvals]);
    };
    
    const handleSendEmail = (email: Partial<Email>) => {
      const newEmail: Email = {
        id: Date.now(),
        from: userProfile.name,
        to: email.to,
        subject: email.subject || '(제목 없음)',
        body: email.body,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        unread: false,
        important: false,
        hasAttachment: false,
        size: `${(email.body?.length || 0) / 1024} KB`,
        mailbox: 'sent'
      };
      setEmails([...emails, newEmail]);
    };

    const handleUpdateChatMessage = (messageId: number, newText: string) => {
        setChatMessages(messages => messages.map(msg => msg.id === messageId ? {...msg, text: newText} : msg));
    };

    const handleDeleteChatMessage = (messageId: number) => {
        setChatMessages(messages => messages.filter(msg => msg.id !== messageId));
    };
    
    const handleSaveDocument = (doc: Partial<Document>, parentId: number | null) => {
      if (doc.id) { // rename
        setDocuments(docs => docs.map(d => d.id === doc.id ? {...d, name: doc.name!} : d));
      } else { // create new
        const newDoc: Document = {
          id: Date.now(),
          name: doc.name!,
          type: doc.type!,
          owner: userProfile.name,
          modifiedDate: new Date().toISOString().split('T')[0],
          size: doc.type === 'folder' ? null : '0KB',
          parentId: parentId
        };
        setDocuments([...documents, newDoc]);
      }
    };
    const handleDeleteDocument = (docId: number) => {
      if (window.confirm('이 항목을 삭제하시겠습니까? 하위 항목도 모두 삭제됩니다.')) {
        // Recursive delete not implemented for simplicity, just deleting the item
        setDocuments(docs => docs.filter(d => d.id !== docId));
      }
    };


    const unreadEmailsCount = useMemo(() => emails.filter(e => e.mailbox === 'inbox' && e.unread).length, [emails]);
    const pendingApprovalsCount = useMemo(() => approvals.filter(a => a.status === 'pending').length, [approvals]);
    
    const navItems: NavItem[] = [
        { id: '대시보드', label: '대시보드', icon: LayoutDashboard },
        { id: '전자결재', label: '전자결재', icon: FileCheck, count: pendingApprovalsCount },
        { id: '사내메일', label: '사내메일', icon: Mail, count: unreadEmailsCount },
        { id: '사내 채팅', label: '사내 채팅', icon: MessageSquare },
        { id: '게시판', label: '게시판', icon: Files },
        { id: '사원관리', label: '사원관리', icon: Users },
        { id: '문서관리', label: '문서관리', icon: FileText },
        { id: '일정관리', label: '일정관리', icon: Calendar },
    ];
    
    const mobileGridItems = [
      { label: '메일', icon: Mail, view: 'mail', count: unreadEmailsCount }, { label: '일정', icon: Calendar, view: '일정관리' }, { label: '전자결재', icon: FileCheck, view: '전자결재', count: pendingApprovalsCount }, { label: '게시판', icon: Files, view: '게시판' },
      { label: '사원관리', icon: Users, view: '사원관리' }, { label: '문서관리', icon: FileText, view: '문서관리' }, { label: '사내 채팅', icon: MessageSquare, view: '사내 채팅' }, { label: '근태', icon: User, view: '#' },
    ];

    const navigateMobile = (view: string) => {
        setMobileView(view);
        setMobileHistory(prev => [...prev, view]);
    };

    const goBackMobile = () => {
        if (mobileHistory.length > 1) {
            const newHistory = [...mobileHistory];
            newHistory.pop();
            setMobileView(newHistory[newHistory.length - 1]);
            setMobileHistory(newHistory);
        }
    };
    
    const MainView = () => {
        switch (activeMenu) {
            case '대시보드': return <DashboardView userProfile={userProfile} approvals={approvals} emails={emails} posts={posts} schedules={schedules} setActiveMenu={setActiveMenu} />;
            case '사내메일': return <MailView emails={emails} setEmails={setEmails} isMobile={false} onSendEmail={handleSendEmail}/>;
            case '전자결재': return <ApprovalView approvals={approvals} onSave={handleSaveApproval} currentUser={userProfile}/>;
            case '게시판': return <BoardView posts={posts} onSave={handleSavePost} onDelete={handleDeletePost} currentUser={userProfile}/>;
            case '사내 채팅': return <ChatView messages={chatMessages} setMessages={setChatMessages} currentUser={userProfile} onUpdate={handleUpdateChatMessage} onDelete={handleDeleteChatMessage}/>;
            case '일정관리': return <ScheduleView events={schedules} setEvents={setSchedules} currentUser={userProfile} />;
            case '사원관리': return <EmployeeView users={users} onSave={handleSaveUser} onDelete={handleDeleteUser}/>;
            case '문서관리': return <DocumentView documents={documents} onSave={handleSaveDocument} onDelete={handleDeleteDocument}/>;
            default: return <div className="p-8"><h1 className="text-2xl font-bold">{activeMenu}</h1><p>콘텐츠 준비 중입니다.</p></div>;
        }
    };

    const MobileSubView = () => {
        const viewParts = mobileView.split('-');
        const baseView = viewParts[0];

        switch (baseView) {
            case 'mail': return <MailView emails={emails} setEmails={setEmails} isMobile={true} mobileView={mobileView} navigateMobile={navigateMobile} onSendEmail={handleSendEmail} />;
            case '전자결재': return <ApprovalView approvals={approvals} onSave={handleSaveApproval} currentUser={userProfile} />;
            case '게시판': return <BoardView posts={posts} onSave={handleSavePost} onDelete={handleDeletePost} currentUser={userProfile} />;
            case '사내 채팅': return <ChatView messages={chatMessages} setMessages={setChatMessages} currentUser={userProfile} onUpdate={handleUpdateChatMessage} onDelete={handleDeleteChatMessage}/>;
            case '일정관리': return <ScheduleView events={schedules} setEvents={setSchedules} isMobile={true} currentUser={userProfile} />;
            case '사원관리': return <EmployeeView users={users} onSave={handleSaveUser} onDelete={handleDeleteUser} />;
            case '문서관리': return <DocumentView documents={documents} onSave={handleSaveDocument} onDelete={handleDeleteDocument} />;
            default: return <div className="p-4"><h1 className="text-xl font-bold">{mobileView}</h1><p>콘텐츠 준비 중입니다.</p></div>;
        }
    };

    if (isMobile) {
        return (
            <div className="flex flex-col h-screen bg-gray-100 font-sans">
                {mobileView === 'home' ? (
                    <>
                        <header className="bg-white p-4 flex justify-between items-center shadow">
                            <h1 className="text-lg font-bold text-orange-500">S&J희망나눔</h1>
                            <div className="flex items-center space-x-4">
                               <Power size={24} className="text-gray-600" />
                               <Users size={24} className="text-gray-600" />
                               <Mail size={24} className="text-gray-600" />
                            </div>
                        </header>
                        <main className="flex-grow p-4 grid grid-cols-4 gap-4">
                            {mobileGridItems.map(item => (
                                <button key={item.label} onClick={() => item.view !== '#' && navigateMobile(item.view)} className="flex flex-col items-center justify-center bg-white p-2 rounded-lg shadow space-y-2 relative">
                                    {item.count > 0 && <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{item.count > 99 ? '99+' : item.count}</span>}
                                    <item.icon size={32} className="text-gray-700" />
                                    <span className="text-xs text-center">{item.label}</span>
                                </button>
                            ))}
                        </main>
                        <footer className="bg-white shadow-t flex justify-around p-2">
                             <button onClick={() => navigateMobile('home')} className="flex flex-col items-center text-red-500">
                                <Home size={24} />
                                <span className="text-xs">홈</span>
                            </button>
                            <button className="flex flex-col items-center text-gray-600">
                                <Power size={24} />
                                <span className="text-xs">출근</span>
                            </button>
                            <button className="flex flex-col items-center text-gray-600">
                                <Power size={24} className="rotate-180" />
                                <span className="text-xs">퇴근</span>
                            </button>
                            <button className="flex flex-col items-center text-gray-600">
                                <MoreHorizontal size={24} />
                                <span className="text-xs">더보기</span>
                            </button>
                        </footer>
                    </>
                ) : (
                    <div className="flex flex-col h-full">
                       <header className="bg-white p-4 flex items-center shadow-md sticky top-0 z-10">
                            <button onClick={goBackMobile} className="mr-4"><ChevronLeft size={24} /></button>
                            <h2 className="text-lg font-bold flex-grow text-center">
                              {mobileView.startsWith('mail-') ? mailboxes[mobileView.split('-')[1]].label : mobileView}
                            </h2>
                            <button className="ml-4 invisible"><ChevronLeft size={24} /></button>
                        </header>
                       <main className="flex-grow overflow-y-auto bg-white">
                         <MobileSubView />
                       </main>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            {/* Desktop Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200 flex items-center space-x-3">
                    <div className="bg-blue-600 text-white p-3 rounded-lg">
                        <Files size={24} />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg text-gray-800">S&J희망나눔</h1>
                        <p className="text-xs text-gray-500">청소년 교육기관 ERP</p>
                    </div>
                </div>
                <nav className="flex-grow pt-4">
                    <ul>
                        {navItems.map(item => (
                            <li key={item.id} className="px-4 mb-1">
                                <button onClick={() => setActiveMenu(item.label)} className={`w-full flex items-center justify-between p-3 rounded-lg text-sm transition-all duration-200 ${activeMenu === item.label ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
                                    <div className="flex items-center">
                                        <item.icon size={20} className="mr-3" />
                                        <span className={activeMenu === item.label ? 'font-semibold' : ''}>{item.label}</span>
                                    </div>
                                    {item.count > 0 && (
                                        <span className={`text-xs font-bold rounded-full px-2 py-0.5 ${activeMenu === item.label ? 'bg-white text-blue-600' : 'bg-yellow-400 text-gray-800'}`}>
                                            {item.count}
                                        </span>
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div className="p-4 border-t border-gray-200">
                     <div className="bg-gray-100 p-3 rounded-lg flex items-center text-sm text-gray-700">
                        <Database size={20} className="mr-3 text-green-500" />
                        <span>DB 상태: <span className="font-semibold text-green-600">정상</span></span>
                    </div>
                     <button className="w-full flex items-center p-3 mt-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100">
                         <LogOut size={20} className="mr-3" />
                         <span>로그아웃</span>
                     </button>
                </div>
            </aside>
            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                <header className="bg-white border-b border-gray-200 flex items-center justify-end p-4 h-16">
                    <div className="flex items-center space-x-6">
                        <button className="relative text-gray-500 hover:text-gray-800">
                            <Bell size={24} />
                            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                        </button>
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">{userProfile.avatar}</div>
                            <div>
                                <p className="font-semibold text-sm text-gray-800">{userProfile.name}</p>
                                <p className="text-xs text-gray-500">{userProfile.team}, {userProfile.position}</p>
                            </div>
                            <ChevronDown size={16} className="text-gray-400" />
                        </div>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto bg-gray-50">
                    <MainView />
                </main>
            </div>
        </div>
    );
}

const mailboxes = {
    'inbox': { label: '받은메일함', icon: Inbox },
    'sent': { label: '보낸메일함', icon: Send },
    'archive': { label: '내게쓴메일함', icon: Archive },
    'draft': { label: '임시 보관함', icon: FileText },
    'spam': { label: '스팸메일함', icon: FileWarning },
    'trash': { label: '휴지통', icon: Trash },
};

// --- VIEWS ---

const DashboardCard = ({ icon: Icon, title, value, unit, color, onClick }: { icon: React.ElementType, title: string, value: number, unit: string, color: 'yellow' | 'blue' | 'green' | 'purple', onClick: () => void }) => {
    const colors = {
        yellow: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: 'text-yellow-500' },
        blue: { bg: 'bg-blue-100', text: 'text-blue-800', icon: 'text-blue-500' },
        green: { bg: 'bg-green-100', text: 'text-green-800', icon: 'text-green-500' },
        purple: { bg: 'bg-purple-100', text: 'text-purple-800', icon: 'text-purple-500' },
    };
    const selectedColor = colors[color];

    return (
        <div onClick={onClick} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer flex items-start">
            <div className={`p-3 rounded-full ${selectedColor.bg} mr-4`}>
                <Icon size={24} className={selectedColor.icon} />
            </div>
            <div>
                <p className="text-sm text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                    {value} <span className="text-lg font-medium">{unit}</span>
                </p>
            </div>
        </div>
    );
};

function DashboardView({ userProfile, approvals, emails, posts, schedules, setActiveMenu }: { userProfile: UserProfile, approvals: Approval[], emails: Email[], posts: Post[], schedules: ScheduleEvent[], setActiveMenu: (menu: string) => void }) {
    const pendingApprovalsCount = useMemo(() => approvals.filter(a => a.status === 'pending').length, [approvals]);
    const unreadEmailsCount = useMemo(() => emails.filter(e => e.mailbox === 'inbox' && e.unread).length, [emails]);

    const isSameDate = (d1: Date, d2: Date) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
    const todaysSchedules = useMemo(() => schedules.filter(s => isSameDate(s.start, new Date())).sort((a, b) => a.start.getTime() - b.start.getTime()), [schedules]);
    
    const recentApprovals = useMemo(() => [...approvals].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5), [approvals]);
    const recentPosts = useMemo(() => [...posts].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5), [posts]);
    
    const formatTime = (date: Date) => `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    
    return (
        <div className="p-6 lg:p-8">
            <h1 className="text-3xl font-bold text-gray-800">안녕하세요, {userProfile.name}님!</h1>
            <p className="text-gray-500 mt-1">오늘의 주요 현황을 확인하세요.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-8">
                <DashboardCard icon={FileCheck} title="결재 대기" value={pendingApprovalsCount} unit="건" color="yellow" onClick={() => setActiveMenu('전자결재')} />
                <DashboardCard icon={Mail} title="안 읽은 메일" value={unreadEmailsCount} unit="통" color="blue" onClick={() => setActiveMenu('사내메일')} />
                <DashboardCard icon={Calendar} title="오늘의 일정" value={todaysSchedules.length} unit="개" color="green" onClick={() => setActiveMenu('일정관리')} />
                <DashboardCard icon={Files} title="최신 게시물" value={posts.length} unit="개" color="purple" onClick={() => setActiveMenu('게시판')} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mt-8">
                <div className="xl:col-span-2 bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">오늘의 일정</h2>
                    {todaysSchedules.length > 0 ? (
                        <ul className="space-y-4">
                            {todaysSchedules.map(event => (
                                <li key={event.id} className="flex items-center space-x-4">
                                    <div className={`w-14 text-center px-2 py-1 rounded-md bg-${event.color}-100 text-${event.color}-800`}>
                                        <p className="font-bold text-sm">{formatTime(event.start)}</p>
                                    </div>
                                    <div className="flex-grow border-l-4 pl-4" style={{borderColor: `var(--color-${event.color}-500, ${event.color})`}}>
                                        <p className="font-semibold text-gray-700">{event.title}</p>
                                        <p className="text-sm text-gray-500">{event.type} / {event.owner}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500">오늘 예정된 일정이 없습니다.</p>
                    )}
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                     <h2 className="text-xl font-bold text-gray-800 mb-4">최신 게시물</h2>
                      {recentPosts.length > 0 ? (
                        <ul className="space-y-3">
                            {recentPosts.map(post => (
                                <li key={post.id} className="group cursor-pointer">
                                    <p className="font-semibold text-gray-700 group-hover:text-blue-600 truncate">{post.title}</p>
                                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                                        <span>{post.author}</span>
                                        <span>{post.date}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                         <p className="text-gray-500">최신 게시물이 없습니다.</p>
                    )}
                </div>
            </div>

            <div className="mt-8 bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold text-gray-800 mb-4">최근 결재 문서</h2>
                 {recentApprovals.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="text-left text-gray-500">
                                <tr>
                                    <th className="p-2 font-medium">문서 제목</th>
                                    <th className="p-2 font-medium">기안자</th>
                                    <th className="p-2 font-medium">상신일</th>
                                    <th className="p-2 font-medium text-center">상태</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentApprovals.map(item => (
                                    <tr key={item.id} className="border-t">
                                        <td className="p-2 text-gray-800 font-medium">{item.title}</td>
                                        <td className="p-2 text-gray-600">{item.requester}</td>
                                        <td className="p-2 text-gray-600">{item.date}</td>
                                        <td className="p-2 text-center">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : item.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {item.status === 'pending' ? '대기중' : item.status === 'approved' ? '승인' : '반려'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-gray-500">최근 결재 문서가 없습니다.</p>
                )}
            </div>
        </div>
    );
}

function MailView({ emails, setEmails, isMobile, mobileView, navigateMobile, onSendEmail }: { emails: Email[]; setEmails: React.Dispatch<React.SetStateAction<Email[]>>; isMobile: boolean; mobileView?: string; navigateMobile?: (view: string) => void; onSendEmail: (email: Partial<Email>) => void; }) {
    const [activeMailbox, setActiveMailbox] = useState<'inbox' | 'sent' | 'spam' | 'trash' | 'archive' | 'draft'>('inbox');
    const [selectedEmails, setSelectedEmails] = useState<Set<number>>(new Set());
    const [currentPage, setCurrentPage] = useState(1);
    const [isComposing, setIsComposing] = useState(false);
    const emailsPerPage = 10;

    const currentMailboxes = useMemo(() => ({
        'inbox': { label: '받은메일함', icon: Inbox, count: emails.filter(e => e.mailbox === 'inbox' && e.unread).length },
        'sent': { label: '보낸메일함', icon: Send, count: emails.filter(e => e.mailbox === 'sent').length },
        'archive': { label: '내게쓴메일함', icon: Archive, count: emails.filter(e => e.mailbox === 'archive' && e.unread).length },
        'draft': { label: '임시 보관함', icon: FileText, count: emails.filter(e => e.mailbox === 'draft').length },
        'spam': { label: '스팸메일함', icon: FileWarning, count: emails.filter(e => e.mailbox === 'spam').length },
        'trash': { label: '휴지통', icon: Trash, count: emails.filter(e => e.mailbox === 'trash').length },
    }), [emails]);
    
    const mailboxOrder: ('inbox' | 'sent' | 'archive' | 'draft' | 'spam' | 'trash')[] = ['inbox', 'sent', 'archive', 'draft', 'spam', 'trash'];

    const filteredEmails = useMemo(() => emails.filter(e => e.mailbox === activeMailbox).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [emails, activeMailbox]);
    const paginatedEmails = useMemo(() => filteredEmails.slice((currentPage - 1) * emailsPerPage, currentPage * emailsPerPage), [filteredEmails, currentPage]);
    const totalPages = Math.ceil(filteredEmails.length / emailsPerPage);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedEmails(new Set(paginatedEmails.map(email => email.id)));
        } else {
            setSelectedEmails(new Set());
        }
    };
    
    const handleSelectOne = (id: number) => {
        const newSelection = new Set(selectedEmails);
        if (newSelection.has(id)) {
            newSelection.delete(id);
        } else {
            newSelection.add(id);
        }
        setSelectedEmails(newSelection);
    };

    const moveSelectedEmails = (targetMailbox: 'inbox' | 'sent' | 'spam' | 'trash' | 'archive' | 'draft') => {
        const updatedEmails = emails.map(email => {
            if (selectedEmails.has(email.id)) {
                const isRestoring = (email.mailbox === 'spam' || email.mailbox === 'trash') && targetMailbox === 'inbox';
                return { ...email, mailbox: targetMailbox, unread: isRestoring ? true : email.unread };
            }
            return email;
        });
        setEmails(updatedEmails);
        setSelectedEmails(new Set());
    };

    const deleteSelectedEmailsPermanently = () => {
        const updatedEmails = emails.filter(email => !selectedEmails.has(email.id));
        setEmails(updatedEmails);
        setSelectedEmails(new Set());
    };

    const toggleImportance = (id: number) => {
        setEmails(emails.map(e => e.id === id ? {...e, important: !e.important} : e));
    };

    const handleComposeSubmit = (email: Partial<Email>) => {
        onSendEmail(email);
        setIsComposing(false);
    }

    if (isMobile) {
        if (mobileView === 'mail') {
            return (
                <div className="bg-white">
                    <ul>
                        {mailboxOrder.map((key) => {
                             const value = currentMailboxes[key];
                             if (!value) return null;
                             return (
                                <li key={key}>
                                    <button onClick={() => navigateMobile!(`mail-${key}`)} className="w-full flex justify-between items-center p-4 border-b">
                                        <div className="flex items-center">
                                            <value.icon size={20} className="mr-3 text-gray-600" />
                                            <span>{value.label}</span>
                                        </div>
                                        {value.count > 0 && <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">{value.count}</span>}
                                    </button>
                                </li>
                             )
                        })}
                    </ul>
                </div>
            );
        }
        const currentMailbox = mobileView?.split('-')[1] as keyof typeof mailboxes;
        return (
            <div>
                {emails.filter(e => e.mailbox === currentMailbox).map(email => (
                    <div key={email.id} className={`p-4 border-b flex ${email.unread ? 'bg-blue-50' : 'bg-white'}`}>
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 shrink-0" style={{visibility: email.unread ? 'visible': 'hidden'}}></div>
                        <div className="flex-grow">
                            <div className="flex justify-between items-center">
                                <span className={`font-semibold ${email.unread ? 'text-gray-800' : 'text-gray-500'}`}>{email.from}</span>
                                <span className="text-xs text-gray-400">{email.date.split(' ')[0]}</span>
                            </div>
                            <p className={`text-sm ${email.unread ? 'text-gray-700' : 'text-gray-500'} truncate`}>{email.subject}</p>
                        </div>
                        <button onClick={() => toggleImportance(email.id)}>
                            <Star size={20} className={`ml-2 ${email.important ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                        </button>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="flex h-full">
             {isComposing && <ComposeMailModal onClose={() => setIsComposing(false)} onSubmit={handleComposeSubmit} />}
            <div className="w-72 border-r bg-white p-4 flex flex-col">
                <h2 className="text-xl font-bold mb-4">메일</h2>
                <div className="space-y-1">
                    <button onClick={() => setIsComposing(true)} className="w-full bg-blue-600 text-white rounded-md py-2 text-sm font-semibold">메일쓰기</button>
                    <button className="w-full bg-gray-200 text-gray-700 rounded-md py-2 text-sm font-semibold">내게쓰기</button>
                </div>
                <div className="mt-6 flex-grow">
                    <ul className="space-y-1">
                        {mailboxOrder.map(key => {
                            const value = currentMailboxes[key];
                            if (!value) return null;
                            return (
                                <li key={key}>
                                    <button onClick={() => {setActiveMailbox(key); setCurrentPage(1); setSelectedEmails(new Set());}} className={`w-full text-left p-2 rounded-md text-sm flex justify-between items-center ${activeMailbox === key ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}>
                                        <div className="flex items-center">
                                            <value.icon size={16} className="mr-2" /> {value.label}
                                        </div>
                                        {value.count > 0 && <span className="text-xs bg-red-200 text-red-800 px-1.5 py-0.5 rounded-full">{value.count}</span>}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
            <div className="flex-1 flex flex-col">
                <div className="p-4 border-b bg-white">
                    <h2 className="text-2xl font-bold">
                        {currentMailboxes[activeMailbox].label}
                    </h2>
                    <div className="flex justify-between items-center mt-4">
                        <div className="flex items-center space-x-2">
                            {activeMailbox === 'trash' || activeMailbox === 'spam' ? (
                                <>
                                    <button onClick={() => moveSelectedEmails('inbox')} className="px-3 py-1.5 border rounded-md text-sm hover:bg-gray-100 disabled:opacity-50" disabled={selectedEmails.size === 0}>복원</button>
                                    <button onClick={() => deleteSelectedEmailsPermanently()} className="px-3 py-1.5 border rounded-md text-sm hover:bg-gray-100 bg-red-50 text-red-700 disabled:opacity-50" disabled={selectedEmails.size === 0}>완전 삭제</button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => moveSelectedEmails('trash')} className="px-3 py-1.5 border rounded-md text-sm hover:bg-gray-100 disabled:opacity-50" disabled={selectedEmails.size === 0}>삭제</button>
                                    <button onClick={() => moveSelectedEmails('spam')} className="px-3 py-1.5 border rounded-md text-sm hover:bg-gray-100 disabled:opacity-50" disabled={selectedEmails.size === 0}>스팸</button>
                                    <button onClick={() => moveSelectedEmails('archive')} className="px-3 py-1.5 border rounded-md text-sm hover:bg-gray-100 disabled:opacity-50" disabled={selectedEmails.size === 0}>내게쓴메일함으로 이동</button>
                                </>
                            )}
                             <button className="px-3 py-1.5 border rounded-md text-sm hover:bg-gray-100">답장</button>
                             <button className="px-3 py-1.5 border rounded-md text-sm hover:bg-gray-100">전달</button>
                        </div>
                         <div className="flex items-center border rounded-md">
                            <input type="text" placeholder="메일 검색" className="px-2 py-1.5 text-sm outline-none" />
                            <button className="p-1.5 border-l hover:bg-gray-100"><Search size={16} /></button>
                         </div>
                    </div>
                </div>
                <div className="flex-1 overflow-x-auto">
                    <table className="min-w-full text-sm text-left bg-white">
                        <thead className="border-b bg-gray-50 text-gray-500">
                            <tr>
                                <th className="p-3 w-12"><input type="checkbox" onChange={handleSelectAll} checked={selectedEmails.size > 0 && selectedEmails.size === paginatedEmails.length} /></th>
                                <th className="p-3 w-12"></th>
                                <th className="p-3 w-48">보낸사람/받는사람</th>
                                <th className="p-3">제목</th>
                                <th className="p-3 w-48">날짜</th>
                                <th className="p-3 w-24">크기</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedEmails.map(email => (
                                <tr key={email.id} className={`border-b hover:bg-gray-50 ${email.unread ? 'font-bold text-gray-800' : 'text-gray-600'}`}>
                                    <td className="p-3"><input type="checkbox" checked={selectedEmails.has(email.id)} onChange={() => handleSelectOne(email.id)} /></td>
                                    <td className="p-3">
                                      <button onClick={() => toggleImportance(email.id)}>
                                        <Star size={16} className={email.important ? 'text-yellow-400 fill-current' : 'text-gray-300 hover:text-yellow-400'}/>
                                      </button>
                                      {email.hasAttachment && <Paperclip size={16} className="ml-1 text-gray-400" />}
                                    </td>
                                    <td className="p-3">{activeMailbox === 'sent' ? email.to : email.from}</td>
                                    <td className="p-3">{email.subject}</td>
                                    <td className="p-3 text-gray-500 font-normal">{email.date}</td>
                                    <td className="p-3 text-gray-500 font-normal">{email.size}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {totalPages > 1 && (
                    <div className="p-4 border-t bg-white flex justify-center items-center space-x-2">
                        <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"><ChevronsLeft size={16} /></button>
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"><ChevronLeft size={16} /></button>
                        {[...Array(totalPages)].map((_, i) => (
                          <button key={i} onClick={() => setCurrentPage(i+1)} className={`px-3 py-1 rounded-md ${currentPage === i+1 ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}>{i+1}</button>
                        ))}
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"><ChevronRight size={16} /></button>
                        <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"><ChevronsRight size={16} /></button>
                    </div>
                )}
            </div>
        </div>
    );
}

function ComposeMailModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (email: Partial<Email>) => void; }) {
    const [to, setTo] = useState('');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');

    const handleSubmit = () => {
        onSubmit({ to, subject, body });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
                <div className="flex justify-between items-center mb-4 border-b pb-3">
                    <h2 className="text-xl font-bold">새 메일 작성</h2>
                    <button onClick={onClose}><X size={24} /></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">받는사람</label>
                        <input type="email" value={to} onChange={e => setTo(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="email@example.com"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">제목</label>
                        <input type="text" value={subject} onChange={e => setSubject(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">내용</label>
                        <textarea value={body} onChange={e => setBody(e.target.value)} rows={10} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"></textarea>
                    </div>
                </div>
                <div className="mt-6 flex justify-end space-x-2">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">취소</button>
                    <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"><Send size={16} className="mr-2"/>보내기</button>
                </div>
            </div>
        </div>
    )
}

function ApprovalModal({ onClose, onSave }: { onClose: () => void, onSave: (approval: Approval) => void }) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const handleSave = () => {
        if (!title) {
            alert('제목을 입력해주세요.');
            return;
        }
        onSave({ title, content } as Approval);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
                <h2 className="text-xl font-bold mb-4">새 결재 상신</h2>
                <div className="space-y-4">
                    <input type="text" placeholder="제목" value={title} onChange={e => setTitle(e.target.value)} className="w-full border rounded p-2"/>
                    <textarea placeholder="내용" value={content} onChange={e => setContent(e.target.value)} rows={5} className="w-full border rounded p-2"></textarea>
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">취소</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded">상신</button>
                </div>
            </div>
        </div>
    );
}

function ApprovalView({approvals, onSave, currentUser}: {approvals: Approval[], onSave: (approval: Approval) => void, currentUser: UserProfile}) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    return (
        <div className="p-8">
            {isModalOpen && <ApprovalModal onClose={() => setIsModalOpen(false)} onSave={onSave} />}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">전자결재</h1>
                <button onClick={() => setIsModalOpen(true)} className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    <PlusCircle size={20} className="mr-2" /> 새 결재 상신
                </button>
            </div>
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="p-4 text-left text-sm font-semibold text-gray-600">문서 제목</th>
                            <th className="p-4 text-left text-sm font-semibold text-gray-600">기안자</th>
                            <th className="p-4 text-left text-sm font-semibold text-gray-600">상신일</th>
                            <th className="p-4 text-left text-sm font-semibold text-gray-600">상태</th>
                        </tr>
                    </thead>
                    <tbody>
                        {approvals.map(item => (
                            <tr key={item.id} className="border-b">
                                <td className="p-4 text-gray-800">{item.title}</td>
                                <td className="p-4 text-gray-600">{item.requester}</td>
                                <td className="p-4 text-gray-600">{item.date}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : item.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {item.status === 'pending' ? '대기중' : item.status === 'approved' ? '승인' : '반려'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
function BoardPostModal({ post, onClose, onSave }: { post: Partial<Post> | null; onClose: () => void; onSave: (post: Post) => void; }) {
    const [currentPost, setCurrentPost] = useState(post || { title: '', content: '' });

    const handleSave = () => {
        if (!currentPost.title) {
            alert('제목을 입력해주세요.');
            return;
        }
        onSave(currentPost as Post);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
                <h2 className="text-xl font-bold mb-4">{currentPost.id ? '게시물 수정' : '새 게시물 작성'}</h2>
                <div className="space-y-4">
                    <input type="text" placeholder="제목" value={currentPost.title} onChange={e => setCurrentPost({ ...currentPost, title: e.target.value })} className="w-full border rounded p-2" />
                    <textarea placeholder="내용" value={currentPost.content} onChange={e => setCurrentPost({ ...currentPost, content: e.target.value })} rows={10} className="w-full border rounded p-2"></textarea>
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">취소</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded">저장</button>
                </div>
            </div>
        </div>
    );
}

function BoardView({ posts, onSave, onDelete, currentUser }: { posts: Post[]; onSave: (post: Post) => void; onDelete: (postId: number) => void; currentUser: UserProfile; }) {
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<Partial<Post> | null>(null);

    const handleEdit = (post: Post) => {
        setEditingPost(post);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setEditingPost(null);
        setIsModalOpen(true);
    };

    const handleSave = (post: Post) => {
        onSave(post);
        setSelectedPost(p => p && p.id === post.id ? post : p); // Update selected post if it was edited
    };

    if (selectedPost) {
        return (
            <div className="p-8">
                {isModalOpen && <BoardPostModal post={editingPost} onClose={() => setIsModalOpen(false)} onSave={handleSave} />}
                <button onClick={() => setSelectedPost(null)} className="flex items-center text-blue-600 mb-4"><ChevronLeft size={20} /> 목록으로</button>
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="border-b pb-4 mb-4">
                        <h1 className="text-3xl font-bold">{selectedPost.title}</h1>
                        <div className="text-sm text-gray-500 mt-2 flex justify-between">
                            <span>작성자: {selectedPost.author} | 작성일: {selectedPost.date} | 조회수: {selectedPost.views}</span>
                            {selectedPost.author === currentUser.name && (
                                <div className="space-x-2">
                                    <button onClick={() => handleEdit(selectedPost)} className="text-blue-600 hover:underline">수정</button>
                                    <button onClick={() => { onDelete(selectedPost.id); setSelectedPost(null); }} className="text-red-600 hover:underline">삭제</button>
                                </div>
                            )}
                        </div>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedPost.content}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            {isModalOpen && <BoardPostModal post={editingPost} onClose={() => setIsModalOpen(false)} onSave={handleSave} />}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">게시판</h1>
                <button onClick={handleCreate} className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    <PlusCircle size={20} className="mr-2" /> 글쓰기
                </button>
            </div>
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="p-4 text-left text-sm font-semibold text-gray-600">제목</th>
                            <th className="p-4 text-left text-sm font-semibold text-gray-600">작성자</th>
                            <th className="p-4 text-left text-sm font-semibold text-gray-600">작성일</th>
                            <th className="p-4 text-left text-sm font-semibold text-gray-600">조회수</th>
                        </tr>
                    </thead>
                    <tbody>
                        {posts.map(post => (
                            <tr key={post.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedPost(post)}>
                                <td className="p-4 text-gray-800">{post.title}</td>
                                <td className="p-4 text-gray-600">{post.author}</td>
                                <td className="p-4 text-gray-600">{post.date}</td>
                                <td className="p-4 text-gray-600">{post.views}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function ChatView({ messages, setMessages, currentUser, onUpdate, onDelete }: { messages: ChatMessage[]; setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>; currentUser: UserProfile; onUpdate: (id: number, text: string) => void; onDelete: (id: number) => void; }) {
    const [newMessage, setNewMessage] = useState('');
    const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth'});
    }, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() === '') return;
        
        const newMsg: ChatMessage = {
            id: Date.now(),
            user: { name: currentUser.name, team: currentUser.team, avatar: currentUser.avatar },
            text: newMessage,
            timestamp: `오후 ${new Date().getHours()}:${String(new Date().getMinutes()).padStart(2,'0')}`,
            isCurrentUser: true,
        };
        setMessages([...messages, newMsg]);
        setNewMessage('');
    }
    
    const handleEditSave = () => {
        if (editingMessage && editingMessage.text.trim()) {
            onUpdate(editingMessage.id, editingMessage.text);
        }
        setEditingMessage(null);
    }
    const handleEditCancel = () => {
        setEditingMessage(null);
    }

    return (
        <div className="p-4 h-full flex flex-col">
            <h1 className="text-2xl font-bold mb-4 border-b pb-4">사내 채팅</h1>
            <div className="flex-grow overflow-y-auto space-y-4 pr-4">
                {messages.map(msg => (
                    <div key={msg.id} className={`flex items-end gap-3 ${msg.isCurrentUser ? 'flex-row-reverse' : ''}`}>
                        {!msg.isCurrentUser && (
                            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center font-bold shrink-0">{msg.user.avatar}</div>
                        )}
                        <div className={`group relative max-w-xs md:max-w-md p-3 rounded-lg ${msg.isCurrentUser ? 'bg-blue-500 text-white rounded-br-none' : 'bg-white border rounded-bl-none'}`}>
                            {editingMessage?.id === msg.id ? (
                                <div>
                                    <input value={editingMessage.text} onChange={e => setEditingMessage({...editingMessage, text: e.target.value})} className="text-sm p-1 rounded bg-white text-black"/>
                                    <div className="text-right mt-1 space-x-2">
                                        <button onClick={handleEditCancel} className="text-xs text-gray-300">취소</button>
                                        <button onClick={handleEditSave} className="text-xs text-blue-200">저장</button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <p className="text-sm">{msg.text}</p>
                                    <span className={`text-xs mt-1 block ${msg.isCurrentUser ? 'text-blue-200' : 'text-gray-400'} text-right`}>{msg.timestamp}</span>
                                </>
                            )}
                             {msg.isCurrentUser && editingMessage?.id !== msg.id && (
                                <div className="absolute top-0 right-0 -translate-y-2 translate-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => setEditingMessage(msg)} className="p-1 bg-white rounded-full shadow"><Edit size={12} className="text-gray-600"/></button>
                                    <button onClick={() => onDelete(msg.id)} className="p-1 bg-white rounded-full shadow ml-1"><Trash2 size={12} className="text-red-600"/></button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="mt-4 flex border-t pt-4">
                <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="메시지를 입력하세요..." 
                    className="flex-grow border rounded-l-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button type="submit" className="bg-blue-500 text-white px-4 rounded-r-md hover:bg-blue-600">
                    <Send size={20} />
                </button>
            </form>
        </div>
    );
}

function ScheduleModal({ event, onClose, onSave, onDelete }: { event: Partial<ScheduleEvent>; onClose: () => void; onSave: (event: Partial<ScheduleEvent>) => void; onDelete: (id: number) => void; }) {
    const [currentEvent, setCurrentEvent] = useState(event);

    const handleSave = () => {
        if (!currentEvent.title) {
            alert('일정 제목을 입력해주세요.');
            return;
        }
        onSave(currentEvent);
    }
    
    const handleDelete = () => {
        if (currentEvent.id && window.confirm('이 일정을 삭제하시겠습니까?')) {
            onDelete(currentEvent.id);
        }
    }
    
    const toLocalISOString = (date: Date) => {
        const tzoffset = (new Date()).getTimezoneOffset() * 60000;
        const localISOTime = (new Date(date.getTime() - tzoffset)).toISOString().slice(0, 16);
        return localISOTime;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">{currentEvent.id ? '일정 수정' : '일정 추가'}</h2>
                    <button onClick={onClose}><X size={24} /></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">제목</label>
                        <input type="text" value={currentEvent.title || ''} onChange={e => setCurrentEvent({...currentEvent, title: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">종류</label>
                        <select value={currentEvent.type || '업무'} onChange={e => setCurrentEvent({...currentEvent, type: e.target.value as ScheduleEventType})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                            <option>업무</option>
                            <option>부서</option>
                            <option>회사</option>
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">시작</label>
                        <input type="datetime-local" value={currentEvent.start ? toLocalISOString(currentEvent.start) : ''} onChange={e => setCurrentEvent({...currentEvent, start: new Date(e.target.value)})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">종료</label>
                        <input type="datetime-local" value={currentEvent.end ? toLocalISOString(currentEvent.end) : ''} onChange={e => setCurrentEvent({...currentEvent, end: new Date(e.target.value)})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                    </div>
                </div>
                <div className="mt-6 flex justify-between">
                    <div>
                        {currentEvent.id && <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">삭제</button>}
                    </div>
                    <div className="space-x-2">
                         <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">취소</button>
                         <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">저장</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function ScheduleView({ events, setEvents, isMobile, currentUser }: { events: ScheduleEvent[], setEvents: React.Dispatch<React.SetStateAction<ScheduleEvent[]>>, isMobile?: boolean, currentUser: UserProfile }) {
    const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [visibleCalendars, setVisibleCalendars] = useState({ '업무': true, '부서': true, '회사': true });
    const [modalState, setModalState] = useState<{ isOpen: boolean, event: Partial<ScheduleEvent> | null }>({ isOpen: false, event: null });

    const filteredEvents = useMemo(() => {
        return events.filter(event => visibleCalendars[event.type]);
    }, [events, visibleCalendars]);

    const handleOpenModal = (event: Partial<ScheduleEvent> | null) => {
        setModalState({ isOpen: true, event });
    }

    const handleCloseModal = () => {
        setModalState({ isOpen: false, event: null });
    }

    const handleSaveEvent = (eventData: Partial<ScheduleEvent>) => {
        if (eventData.id) { // Update existing
            setEvents(events.map(e => e.id === eventData.id ? { ...e, ...eventData, color: getScheduleColor(eventData.type!) } as ScheduleEvent : e));
        } else { // Create new
            const newEvent: ScheduleEvent = {
                id: Date.now(),
                title: eventData.title || '새 일정',
                start: eventData.start || new Date(),
                end: eventData.end || new Date(),
                type: eventData.type || '업무',
                owner: currentUser.name,
                color: getScheduleColor(eventData.type || '업무'),
            };
            setEvents([...events, newEvent]);
        }
        handleCloseModal();
    }

    const handleDeleteEvent = (id: number) => {
        setEvents(events.filter(e => e.id !== id));
        handleCloseModal();
    }

    const handlePrev = () => {
        if (viewMode === 'month') setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
        else if (viewMode === 'week') setCurrentDate(d => new Date(d.setDate(d.getDate() - 7)));
        else setCurrentDate(d => new Date(d.setDate(d.getDate() - 1)));
    };
    const handleNext = () => {
        if (viewMode === 'month') setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));
        else if (viewMode === 'week') setCurrentDate(d => new Date(d.setDate(d.getDate() + 7)));
        else setCurrentDate(d => new Date(d.setDate(d.getDate() + 1)));
    };
    const handleToday = () => setCurrentDate(new Date());

    const CalendarHeader = () => {
        let title = '';
        if (viewMode === 'month') {
            title = `${currentDate.getFullYear()}년 ${currentDate.getMonth() + 1}월`;
        } else if (viewMode === 'week') {
            const startOfWeek = new Date(currentDate);
            startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(endOfWeek.getDate() + 6);
            title = `${startOfWeek.getFullYear()}년 ${startOfWeek.getMonth() + 1}월 ${startOfWeek.getDate()}일 - ${endOfWeek.getDate()}일`;
        } else {
             title = `${currentDate.getFullYear()}년 ${currentDate.getMonth() + 1}월 ${currentDate.getDate()}일`;
        }
        const legend = [
            { label: '업무 일정', color: 'blue' },
            { label: '부서 일정', color: 'green' },
            { label: '회사 일정', color: 'purple' },
            { label: '회사 공휴일', color: 'red' },
        ];
        return (
            <div className="p-4 bg-white border-b">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center space-x-2">
                        <button onClick={handlePrev} className="px-3 py-1.5 border rounded-md text-sm hover:bg-gray-100">이전</button>
                        <button onClick={handleNext} className="px-3 py-1.5 border rounded-md text-sm hover:bg-gray-100">다음</button>
                        <button onClick={handleToday} className="px-3 py-1.5 border rounded-md text-sm hover:bg-gray-100 bg-red-50 text-red-700">오늘</button>
                    </div>
                    <h2 className="text-xl font-bold text-center">{title}</h2>
                    <div className="flex items-center space-x-2">
                         <div className="flex items-center rounded-md border">
                            <button onClick={() => setViewMode('month')} className={`px-3 py-1.5 text-sm ${viewMode === 'month' ? 'bg-red-600 text-white' : 'hover:bg-gray-100'}`}>월간</button>
                            <button onClick={() => setViewMode('week')} className={`px-3 py-1.5 text-sm border-l ${viewMode === 'week' ? 'bg-red-600 text-white' : 'hover:bg-gray-100'}`}>주간</button>
                            <button onClick={() => setViewMode('day')} className={`px-3 py-1.5 text-sm border-l ${viewMode === 'day' ? 'bg-red-600 text-white' : 'hover:bg-gray-100'}`}>일간</button>
                        </div>
                    </div>
                </div>
                 <div className="pt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                    {legend.map(item => (
                        <div key={item.label} className="flex items-center">
                            <span className={`w-3 h-3 rounded-full mr-1.5 bg-${item.color}-500`}></span>
                            <span>{item.label}</span>
                        </div>
                    ))}
                     <div className="flex-grow flex items-center space-x-4 text-sm justify-end">
                        {Object.keys(visibleCalendars).map((cal) => (
                           <label key={cal} className="flex items-center space-x-2 cursor-pointer">
                             <input type="checkbox" checked={visibleCalendars[cal]} onChange={() => setVisibleCalendars(prev => ({...prev, [cal]: !prev[cal]}))} className="form-checkbox h-4 w-4 rounded text-blue-600"/>
                             <span>{cal}</span>
                           </label>
                        ))}
                    </div>
                </div>
            </div>
        )
    };
    
    const renderView = () => {
        switch (viewMode) {
            case 'month': return <MonthView date={currentDate} events={filteredEvents} onDayClick={(date) => handleOpenModal({ start: date, end: date })} onEventClick={(event) => handleOpenModal(event)} />;
            case 'week': return <WeekView date={currentDate} events={filteredEvents} onSlotClick={(date) => handleOpenModal({ start: date, end: new Date(date.getTime() + 60*60*1000) })} onEventClick={(event) => handleOpenModal(event)} />;
            case 'day': return <DayView date={currentDate} events={filteredEvents} onSlotClick={(date) => handleOpenModal({ start: date, end: new Date(date.getTime() + 60*60*1000) })} onEventClick={(event) => handleOpenModal(event)} />;
            default: return null;
        }
    };
    
    return <div className="h-full flex flex-col bg-white">
        <CalendarHeader />
        {renderView()}
        {modalState.isOpen && <ScheduleModal event={modalState.event!} onClose={handleCloseModal} onSave={handleSaveEvent} onDelete={handleDeleteEvent} />}
    </div>;
}

const MonthView = ({ date, events, onDayClick, onEventClick }: { date: Date, events: ScheduleEvent[], onDayClick: (date: Date) => void, onEventClick: (event: ScheduleEvent) => void }) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = Array.from({ length: firstDay + daysInMonth }, (_, i) => {
        if (i < firstDay) return null;
        return i - firstDay + 1;
    });

    const isSameDay = (d1: Date, d2: Date) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
    
    return (
        <div className="flex-grow grid grid-cols-7 border-t">
            {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                <div key={day} className="text-center font-bold p-2 border-b text-sm">{day}</div>
            ))}
            {days.map((day, index) => {
                 const dayDate = day ? new Date(year, month, day) : null;
                 const isSunday = index % 7 === 0;
                 const isSaturday = index % 7 === 6;
                 const isToday = dayDate ? isSameDay(dayDate, new Date()) : false;

                return (
                <div key={index} className={`border-r border-b h-24 md:h-36 p-1 text-xs md:text-sm overflow-y-auto relative cursor-pointer
                    ${isSunday ? 'bg-red-50' : ''} ${isSaturday ? 'bg-blue-50' : ''}`}
                    onClick={() => dayDate && onDayClick(dayDate)}
                >
                    {day && <span className={`p-1 rounded-full ${isToday ? 'bg-red-500 text-white' : ''}`}>{day}</span>}
                    <div className="mt-1 space-y-1">
                        {dayDate && events.filter(e => isSameDay(e.start, dayDate)).map(e => (
                            <div key={e.id} onClick={(ev) => { ev.stopPropagation(); onEventClick(e); }} className={`p-1 rounded text-white bg-${e.color}-500 text-[10px] md:text-xs truncate`}>{e.title}</div>
                        ))}
                    </div>
                </div>
            )})}
        </div>
    );
};

const WeekView = ({ date, events, onSlotClick, onEventClick }: { date: Date, events: ScheduleEvent[], onSlotClick: (date: Date) => void, onEventClick: (event: ScheduleEvent) => void }) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    const days = Array.from({ length: 7 }, (_, i) => new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + i));
    const hours = Array.from({ length: 12 }, (_, i) => 8 + i); // 8 AM to 7 PM

    const isSameDay = (d1: Date, d2: Date) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
    
    return (
        <div className="flex-grow flex flex-col overflow-auto">
            <div className="flex sticky top-0 bg-white z-10 border-b">
                <div className="w-16 border-r"></div>
                {days.map(day => {
                    const isToday = isSameDay(day, new Date());
                    return <div key={day.toISOString()} className={`flex-1 text-center p-2 font-bold text-sm ${isToday ? 'text-red-500' : ''}`}>{`${day.getDate()}일 (${['일', '월', '화', '수', '목', '금', '토'][day.getDay()]})`}</div>
                })}
            </div>
            <div className="flex flex-grow">
                <div className="w-16">
                    {hours.map(hour => <div key={hour} className="h-20 text-right pr-2 text-xs text-gray-500 border-r pt-1">{`${hour}:00`}</div>)}
                </div>
                <div className="flex-1 grid grid-cols-7">
                    {days.map(day => (
                        <div key={day.toISOString()} className="border-r relative">
                            {hours.map(hour => <div key={hour} className="h-20 border-b cursor-pointer" onClick={() => onSlotClick(new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour))}></div>)}
                            {events.filter(e => isSameDay(e.start, day)).map(e => {
                                const top = (e.start.getHours() - 8 + e.start.getMinutes() / 60) * 80; // 80px per hour
                                const height = Math.max(20, (e.end.getTime() - e.start.getTime()) / (1000 * 60 * 60) * 80);
                                return (
                                <div key={e.id} style={{top: `${top}px`, height: `${height}px`}} onClick={(ev) => { ev.stopPropagation(); onEventClick(e); }} className={`absolute left-1 right-1 p-1 rounded text-white bg-${e.color}-500 text-[10px] md:text-xs z-10 overflow-hidden cursor-pointer`}>
                                    <p className="font-bold">{e.title}</p>
                                    <p>{`${e.start.getHours()}:${String(e.start.getMinutes()).padStart(2, '0')} - ${e.end.getHours()}:${String(e.end.getMinutes()).padStart(2, '0')}`}</p>
                                </div>
                                )
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const DayView = ({ date, events, onSlotClick, onEventClick }: { date: Date, events: ScheduleEvent[], onSlotClick: (date: Date) => void, onEventClick: (event: ScheduleEvent) => void }) => {
    const day = date;
    const hours = Array.from({ length: 12 }, (_, i) => 8 + i); // 8 AM to 7 PM
    const isSameDay = (d1: Date, d2: Date) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
    
    return (
        <div className="flex-grow flex flex-col overflow-auto">
            <div className="flex sticky top-0 bg-white z-10 border-b">
                <div className="w-16 border-r"></div>
                <div className="flex-1 text-center p-2 font-bold text-sm">{`${day.getDate()}일 (${['일', '월', '화', '수', '목', '금', '토'][day.getDay()]})`}</div>
            </div>
            <div className="flex flex-grow">
                <div className="w-16">
                    {hours.map(hour => <div key={hour} className="h-20 text-right pr-2 text-xs text-gray-500 border-r pt-1">{`${hour}:00`}</div>)}
                </div>
                <div className="flex-1 relative border-r">
                     {hours.map(hour => <div key={hour} className="h-20 border-b cursor-pointer" onClick={() => onSlotClick(new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour))}></div>)}
                     {events.filter(e => isSameDay(e.start, day)).map(e => {
                        const top = (e.start.getHours() - 8 + e.start.getMinutes() / 60) * 80;
                        const height = Math.max(20, (e.end.getTime() - e.start.getTime()) / (1000 * 60 * 60) * 80);
                        return (
                        <div key={e.id} style={{top: `${top}px`, height: `${height}px`}} onClick={(ev) => { ev.stopPropagation(); onEventClick(e); }} className={`absolute left-1 right-1 p-1 rounded text-white bg-${e.color}-500 text-xs z-10 overflow-hidden cursor-pointer`}>
                            <p className="font-bold">{e.title}</p>
                            <p>{`${e.start.getHours()}:${String(e.start.getMinutes()).padStart(2, '0')} - ${e.end.getHours()}:${String(e.end.getMinutes()).padStart(2, '0')}`}</p>
                        </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};

function UserModal({ user, onClose, onSave }: { user: Partial<UserProfile> | null; onClose: () => void; onSave: (user: UserProfile) => void; }) {
    const [currentUser, setCurrentUser] = useState(user || { name: '', team: '', position: '', email: '', phone: '' });

    const handleSave = () => {
        if (!currentUser.name) return alert('이름을 입력해주세요.');
        onSave(currentUser as UserProfile);
        onClose();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCurrentUser(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
                <h2 className="text-xl font-bold mb-4">{currentUser.id ? '사원 정보 수정' : '신규 사원 등록'}</h2>
                <div className="grid grid-cols-2 gap-4">
                    <input name="name" value={currentUser.name} onChange={handleChange} placeholder="이름" className="border p-2 rounded col-span-2"/>
                    <input name="team" value={currentUser.team} onChange={handleChange} placeholder="부서" className="border p-2 rounded"/>
                    <input name="position" value={currentUser.position} onChange={handleChange} placeholder="직책" className="border p-2 rounded"/>
                    <input name="email" value={currentUser.email} onChange={handleChange} placeholder="이메일" className="border p-2 rounded col-span-2"/>
                    <input name="phone" value={currentUser.phone} onChange={handleChange} placeholder="연락처" className="border p-2 rounded col-span-2"/>
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">취소</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded">저장</button>
                </div>
            </div>
        </div>
    );
}

function EmployeeView({users, onSave, onDelete}: {users: UserProfile[], onSave: (user: UserProfile) => void, onDelete: (userId: number) => void}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<Partial<UserProfile> | null>(null);

    const filteredUsers = useMemo(() => users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.team.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.position.toLowerCase().includes(searchTerm.toLowerCase())
    ), [users, searchTerm]);
    
    const handleCreate = () => {
        setEditingUser(null);
        setIsModalOpen(true);
    };

    const handleEdit = (user: UserProfile) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    return (
        <div className="p-8">
            {isModalOpen && <UserModal user={editingUser} onClose={() => setIsModalOpen(false)} onSave={onSave} />}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">사원관리</h1>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center border rounded-md">
                        <input type="text" placeholder="사원 검색" className="px-2 py-1.5 text-sm outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        <button className="p-1.5 border-l hover:bg-gray-100"><Search size={16} /></button>
                    </div>
                    <button onClick={handleCreate} className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                        <PlusCircle size={20} className="mr-2" /> 신규 사원 등록
                    </button>
                </div>
            </div>
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="p-4 text-left text-sm font-semibold text-gray-600">이름</th>
                            <th className="p-4 text-left text-sm font-semibold text-gray-600">부서</th>
                            <th className="p-4 text-left text-sm font-semibold text-gray-600">직책</th>
                            <th className="p-4 text-left text-sm font-semibold text-gray-600">이메일</th>
                            <th className="p-4 text-left text-sm font-semibold text-gray-600">연락처</th>
                            <th className="p-4 text-left text-sm font-semibold text-gray-600">관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id} className="border-b">
                                <td className="p-4 text-gray-800 flex items-center">
                                     <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold mr-3">{user.avatar}</div>
                                     {user.name}
                                </td>
                                <td className="p-4 text-gray-600">{user.team}</td>
                                <td className="p-4 text-gray-600">{user.position}</td>
                                <td className="p-4 text-gray-600">{user.email}</td>
                                <td className="p-4 text-gray-600">{user.phone}</td>
                                <td className="p-4 text-gray-600 space-x-2">
                                    <button onClick={() => handleEdit(user)} className="text-blue-500 hover:underline">수정</button>
                                    <button onClick={() => onDelete(user.id)} className="text-red-500 hover:underline">삭제</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

function DocumentActionModal({ doc, action, onClose, onSave, parentId }: { doc: Partial<Document> | null; action: 'create' | 'rename'; onClose: () => void; onSave: (doc: Partial<Document>, parentId: number|null) => void, parentId: number | null }) {
    const [name, setName] = useState(action === 'rename' ? doc?.name || '' : '');
    const [type, setType] = useState<'folder' | 'txt'>('folder');
    
    const handleSave = () => {
        if (!name) return alert('이름을 입력해주세요.');
        if (action === 'create') {
            onSave({ name, type }, parentId);
        } else {
            onSave({ ...doc, name }, parentId);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">
                    {action === 'create' ? '새로 만들기' : '이름 바꾸기'}
                </h2>
                {action === 'create' && (
                    <select value={type} onChange={e => setType(e.target.value as any)} className="w-full border p-2 rounded mb-2">
                        <option value="folder">폴더</option>
                        <option value="txt">텍스트 파일</option>
                    </select>
                )}
                <input value={name} onChange={e => setName(e.target.value)} placeholder="이름" className="w-full border p-2 rounded"/>
                <div className="mt-4 flex justify-end space-x-2">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">취소</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded">저장</button>
                </div>
            </div>
        </div>
    );
}


function DocumentView({documents, onSave, onDelete}: {documents: Document[], onSave: (doc: Partial<Document>, parentId: number|null) => void, onDelete: (docId: number) => void}) {
    const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
    const [modalState, setModalState] = useState<{ isOpen: boolean, action: 'create'|'rename', doc: Partial<Document> | null }>({isOpen: false, action: 'create', doc: null});

    const folders = useMemo(() => documents.filter(d => d.type === 'folder' && d.parentId === null), [documents]);
    const currentItems = useMemo(() => documents.filter(d => d.parentId === currentFolderId), [documents, currentFolderId]);
    
    const getFileIcon = (type: Document['type']) => {
        switch(type) {
            case 'folder': return <Folder className="text-yellow-500" />;
            case 'pdf': return <FileIcon className="text-red-500" />;
            case 'docx': return <FileIcon className="text-blue-500" />;
            case 'txt': return <FileType className="text-gray-500" />;
            default: return <FileIcon className="text-gray-400" />;
        }
    };
    
    const breadcrumbs = useMemo(() => {
        const path = [];
        let folderId = currentFolderId;
        while (folderId !== null) {
            const folder = documents.find(d => d.id === folderId);
            if (folder) {
                path.unshift(folder);
                folderId = folder.parentId;
            } else {
                break;
            }
        }
        return path;
    }, [currentFolderId, documents]);

    return (
        <div className="flex h-full">
            {modalState.isOpen && <DocumentActionModal action={modalState.action} doc={modalState.doc} onClose={() => setModalState({isOpen: false, action: 'create', doc: null})} onSave={onSave} parentId={currentFolderId} />}
            <div className="w-72 border-r bg-white p-4 flex flex-col">
                <h2 className="text-xl font-bold mb-4">문서함</h2>
                <ul className="space-y-1">
                    {folders.map(folder => (
                        <li key={folder.id}>
                            <button onClick={() => setCurrentFolderId(folder.id)} className={`w-full text-left p-2 rounded-md text-sm flex items-center ${currentFolderId === folder.id ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}>
                                <Folder size={16} className="mr-2 text-yellow-600" /> {folder.name}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="flex-1 flex flex-col">
                <div className="p-4 border-b bg-white">
                    <div className="flex justify-between items-center">
                         <div className="text-sm text-gray-500">
                             <button onClick={() => setCurrentFolderId(null)} className="hover:underline">문서관리</button>
                             {breadcrumbs.map(b => (
                                <span key={b.id}>
                                    <ChevronRight size={14} className="inline mx-1" />
                                    <button onClick={() => setCurrentFolderId(b.id)} className="hover:underline">{b.name}</button>
                                </span>
                             ))}
                         </div>
                         <div className="flex items-center space-x-2">
                            <button onClick={() => setModalState({isOpen: true, action: 'create', doc: null})} className="flex items-center bg-blue-500 text-white px-3 py-1.5 rounded-md text-sm hover:bg-blue-600">
                                <PlusCircle size={16} className="mr-1"/> 새로 만들기
                            </button>
                            <div className="flex items-center border rounded-md">
                                <input type="text" placeholder="문서 검색" className="px-2 py-1.5 text-sm outline-none" />
                                <button className="p-1.5 border-l hover:bg-gray-100"><Search size={16} /></button>
                            </div>
                         </div>
                    </div>
                </div>
                 <div className="flex-1 overflow-x-auto">
                    <table className="min-w-full text-sm text-left bg-white">
                        <thead className="border-b bg-gray-50 text-gray-500">
                            <tr>
                                <th className="p-3 w-12"></th>
                                <th className="p-3">이름</th>
                                <th className="p-3 w-48">소유자</th>
                                <th className="p-3 w-48">수정한 날짜</th>
                                <th className="p-3 w-24">파일 크기</th>
                                <th className="p-3 w-32">관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.map(item => (
                                <tr key={item.id} className="border-b hover:bg-gray-50 cursor-pointer">
                                    <td className="p-3" onDoubleClick={() => item.type === 'folder' && setCurrentFolderId(item.id)}>{getFileIcon(item.type)}</td>
                                    <td className="p-3 font-medium text-gray-800" onDoubleClick={() => item.type === 'folder' && setCurrentFolderId(item.id)}>{item.name}</td>
                                    <td className="p-3 text-gray-600" onDoubleClick={() => item.type === 'folder' && setCurrentFolderId(item.id)}>{item.owner}</td>
                                    <td className="p-3 text-gray-600" onDoubleClick={() => item.type === 'folder' && setCurrentFolderId(item.id)}>{item.modifiedDate}</td>
                                    <td className="p-3 text-gray-600" onDoubleClick={() => item.type === 'folder' && setCurrentFolderId(item.id)}>{item.size || '--'}</td>
                                    <td className="p-3 text-gray-600 space-x-2">
                                        <button onClick={() => setModalState({isOpen: true, action: 'rename', doc: item})} className="text-blue-500 hover:underline">이름변경</button>
                                        <button onClick={() => onDelete(item.id)} className="text-red-500 hover:underline">삭제</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}