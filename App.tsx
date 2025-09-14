import React, { useState, useEffect, useCallback } from 'react';
import { 
  Mail, FileText, Users, CreditCard, Bell, Settings, LogOut, Search, Plus, Calendar, 
  Home, Eye, Building2, GraduationCap, RefreshCw, Database, Star, XCircle, Trash2
} from 'lucide-react';

// --- TYPE DEFINITIONS ---
type ApprovalStatus = 'pending' | 'approved' | 'rejected';

interface User {
  id: number;
  name: string;
  position: string;
  department: string;
}

interface Approval {
  id: number;
  title: string;
  requester: string;
  date: string;
  status: ApprovalStatus;
  amount: string;
  content: string;
}

interface Employee {
  id: number;
  name: string;
  position: string;
  department: string;
  status: string;
  email: string;
}

interface Document {
  id: number;
  title: string;
  date: string;
  author: string;
  size: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  date: string;
  views: number;
  category: string;
}

interface Message {
  id: number;
  subject: string;
  content: string;
  senderName: string;
  date: string;
  read: boolean;
  important: boolean;
}

interface Event {
  id: number;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
}

interface NewPost {
  title: string;
  content: string;
  category: string;
}

// --- CONSTANTS ---
const SEED_DATA = {
  employees: [
    { id: 1, name: '이영희', position: '대표이사', department: '경영진', status: '재직', email: 'yhlee@sjhope.org' },
    { id: 2, name: '박철수', position: '교육부장', department: '교육팀', status: '재직', email: 'cspark@sjhope.org' },
    { id: 3, name: '김민정', position: '상담사', department: '상담팀', status: '재직', email: 'mjkim@sjhope.org' },
    { id: 4, name: '정수현', position: '행정담당', department: '총무팀', status: '재직', email: 'shjeong@sjhope.org' },
    { id: 5, name: '김민수', position: '교육팀장', department: '청소년교육팀', status: '재직', email: 'mskim@sjhope.org' }
  ],
  approvals: [
    { id: 4, title: '워크샵 참가비 신청', requester: '김민수', date: '2025-08-31', status: 'rejected', amount: '80만원', content: '기관 전체 워크샵 참가를 위한 참가비 지원 신청입니다. 반려 사유: 예산 초과.' },
    { id: 3, title: '연차 신청서', requester: '정수현', date: '2025-09-01', status: 'pending', amount: '-', content: '개인 사유로 2025년 9월 10일 연차 사용을 신청합니다.' },
    { id: 2, title: '교육 자료 구입 요청', requester: '김민정', date: '2025-09-02', status: 'approved', amount: '150만원', content: '신규 상담 프로그램 도입에 따른 전문 서적 및 교구 구입 요청 건입니다. 목록은 별도 첨부했습니다.' },
    { id: 1, title: '청소년 캠프 예산 신청', requester: '박철수', date: '2025-09-03', status: 'pending', amount: '500만원', content: '2025년 하반기 청소년 리더십 캠프 진행을 위한 예산 신청입니다. 세부 내역은 첨부파일을 참고해주시기 바랍니다.' }
  ],
  documents: [
    { id: 1, title: '2025 청소년 교육계획서.pdf', date: '2025-09-03', author: '박철수', size: '2.1MB' },
    { id: 2, title: '상담 매뉴얼.docx', date: '2025-09-02', author: '김민정', size: '1.8MB' },
    { id: 3, title: '기관 운영규정.pdf', date: '2025-09-01', author: '이영희', size: '3.2MB' }
  ],
  posts: [
    { id: 1, title: '9월 청소년 교육 프로그램 안내', author: '박철수', date: '2025-09-03', views: 45, category: 'notice', content: '안녕하세요, 교육팀 박철수입니다.\n\n9월에 진행될 청소년 교육 프로그램을 아래와 같이 안내드립니다.\n\n- 프로그램명: 코딩 꿈나무 교실\n- 대상: 초등학생 4-6학년\n- 기간: 2025년 9월 15일 ~ 10월 20일 (매주 월요일)\n\n자세한 내용은 첨부된 파일을 참고해주시기 바랍니다.\n많은 관심과 참여 부탁드립니다.' },
    { id: 2, title: '기관 워크샵 개최 안내', author: '이영희', date: '2025-09-02', views: 67, category: 'notice', content: '전 직원 워크샵이 9월 마지막 주에 개최될 예정입니다.\n\n- 일시: 2025년 9월 26일(금) ~ 9월 27일(토)\n- 장소: 강원도 평창 알펜시아 리조트\n\n일정 및 장소에 대한 세부 사항은 추후 다시 공지하겠습니다.' },
    { id: 3, title: '상담실 이용 수칙 업데이트', author: '김민정', date: '2025-09-01', views: 23, category: 'general', content: '상담실 내부 공사 및 환경 개선으로 인해 이용 수칙이 일부 변경되었습니다.\n\n주요 변경 사항:\n1. 이용 시간 변경 (오전 9시 ~ 오후 6시)\n2. 음식물 반입 전면 금지\n\n모든 직원분들께서는 변경된 내용을 숙지해주시기 바랍니다.' }
  ],
  messages: [
    { id: 1, subject: '9월 이사회 회의 준비 관련', content: '다음 주 화요일 이사회 회의 준비사항에 대해 논의하고 싶습니다. 관련 자료 검토 후 회신 부탁드립니다.', senderName: '이영희', date: '2025-09-03T14:30:00', read: false, important: true },
    { id: 2, subject: '청소년 캠프 프로그램 검토 완료', content: '요청하신 캠프 프로그램 검토가 완료되었습니다. 결재 라인에 상신하였으니 확인 바랍니다.', senderName: '박철수', date: '2025-09-03T11:15:00', read: false, important: false },
    { id: 3, subject: '상담 프로그램 업데이트 안내', content: '상담팀에서 새로운 프로그램을 도입하게 되어 안내드립니다. 자세한 내용은 첨부된 파일을 확인해주세요.', senderName: '김민정', date: '2025-09-02T16:45:00', read: true, important: false }
  ],
  events: [
    { id: 1, title: '교육팀 주간회의', date: '2025-09-14', startTime: '10:00', endTime: '11:00', location: '회의실 A' },
    { id: 2, title: '청소년 상담 세션', date: '2025-09-14', startTime: '14:00', endTime: '16:00', location: '상담실 1' },
    { id: 3, title: '월례 보고서 작성', date: '2025-09-15', startTime: '16:30', endTime: '17:30', location: '사무실' }
  ]
};

const MENU_ITEMS = [
  { id: 'dashboard', name: '대시보드', icon: Home },
  { id: 'approval', name: '전자결재', icon: CreditCard },
  { id: 'mail', name: '사내메일', icon: Mail },
  { id: 'board', name: '게시판', icon: FileText },
  { id: 'employees', name: '사원관리', icon: Users },
  { id: 'documents', name: '문서관리', icon: FileText },
  { id: 'calendar', name: '일정관리', icon: Calendar }
];

// --- HELPER COMPONENTS ---

const Dashboard: React.FC<{
  user: User;
  stats: { pendingApprovals: number; unreadMessages: number; totalEmployees: number; totalPrograms: number };
  approvals: Approval[];
  posts: Post[];
  lastSync: Date | null;
}> = ({ user, stats, approvals, posts, lastSync }) => (
  <div className="space-y-6 animate-fadeIn">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">안녕하세요, {user.name}님!</h2>
        <p className="text-gray-600 mt-1">사단법인 S&J희망나눔 ERP 시스템</p>
        {lastSync && (
          <p className="text-xs text-gray-400 mt-1">
            마지막 동기화: {lastSync.toLocaleTimeString('ko-KR')}
          </p>
        )}
      </div>
      <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-lg">
        <Building2 className="h-5 w-5 text-blue-600" />
        <span className="text-blue-800 font-medium">청소년교육기관</span>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100">대기 중인 결재</p>
            <p className="text-3xl font-bold mt-2">{stats.pendingApprovals}건</p>
          </div>
          <CreditCard className="h-8 w-8 text-blue-200" />
        </div>
      </div>
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100">읽지 않은 메일</p>
            <p className="text-3xl font-bold mt-2">{stats.unreadMessages}건</p>
          </div>
          <Mail className="h-8 w-8 text-green-200" />
        </div>
      </div>
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-100">전체 직원</p>
            <p className="text-3xl font-bold mt-2">{stats.totalEmployees}명</p>
          </div>
          <Users className="h-8 w-8 text-purple-200" />
        </div>
      </div>
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-orange-100">교육 프로그램</p>
            <p className="text-3xl font-bold mt-2">{stats.totalPrograms}개</p>
          </div>
          <GraduationCap className="h-8 w-8 text-orange-200" />
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4 flex items-center"><CreditCard className="h-5 w-5 mr-2 text-blue-600" />최근 결재 현황</h3>
        <div className="space-y-3">
          {approvals.slice(0, 3).map(approval => (
            <div key={approval.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{approval.title}</p>
                <p className="text-sm text-gray-600">{approval.requester}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                approval.status === 'approved' ? 'bg-green-100 text-green-800' :
                approval.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {approval.status === 'approved' ? '승인' : approval.status === 'pending' ? '대기' : '반려'}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4 flex items-center"><FileText className="h-5 w-5 mr-2 text-green-600" />최근 게시글</h3>
        <div className="space-y-3">
          {posts.slice(0, 3).map(post => (
            <div key={post.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{post.title}</p>
                <p className="text-sm text-gray-600">{post.author} • {post.date}</p>
              </div>
              <div className="flex items-center text-sm text-gray-500"><Eye className="h-4 w-4 mr-1" />{post.views}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const ApprovalView: React.FC<{
  approvals: Approval[];
  handleApprovalStatusChange: (id: number, status: ApprovalStatus) => void;
  onNewRequestClick: () => void;
  onApprovalClick: (approval: Approval) => void;
}> = ({ approvals, handleApprovalStatusChange, onNewRequestClick, onApprovalClick }) => (
  <div className="space-y-6 animate-fadeIn">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold text-gray-900">전자결재</h2>
      <button onClick={onNewRequestClick} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors">
        <Plus className="h-4 w-4 mr-2" /> 새 결재 요청
      </button>
    </div>
    <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
      <table className="w-full min-w-max">
        <thead>
          <tr className="border-b text-left text-sm text-gray-600">
            <th className="p-4 font-medium">제목</th>
            <th className="p-4 font-medium">신청자</th>
            <th className="p-4 font-medium">금액</th>
            <th className="p-4 font-medium">날짜</th>
            <th className="p-4 font-medium">상태</th>
            <th className="p-4 font-medium">액션</th>
          </tr>
        </thead>
        <tbody>
          {approvals.map(approval => (
            <tr key={approval.id} className="border-b hover:bg-gray-50">
              <td className="p-4 font-medium text-gray-900">
                <span onClick={() => onApprovalClick(approval)} className="cursor-pointer hover:underline hover:text-blue-600">
                  {approval.title}
                </span>
              </td>
              <td className="p-4 text-gray-600">{approval.requester}</td>
              <td className="p-4 text-gray-600">{approval.amount}</td>
              <td className="p-4 text-gray-600">{approval.date}</td>
              <td className="p-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  approval.status === 'approved' ? 'bg-green-100 text-green-800' :
                  approval.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {approval.status === 'approved' ? '승인' : approval.status === 'pending' ? '대기' : '반려'}
                </span>
              </td>
              <td className="p-4">
                {approval.status === 'pending' && (
                  <div className="flex space-x-2">
                    <button onClick={() => handleApprovalStatusChange(approval.id, 'approved')} className="text-white bg-green-500 hover:bg-green-600 text-xs px-3 py-1 rounded transition-colors">승인</button>
                    <button onClick={() => handleApprovalStatusChange(approval.id, 'rejected')} className="text-white bg-red-500 hover:bg-red-600 text-xs px-3 py-1 rounded transition-colors">반려</button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const MailView: React.FC<{
    messages: Message[];
    onMessageClick: (message: Message) => void;
    onNewMailClick: () => void;
}> = ({ messages, onMessageClick, onNewMailClick }) => {
    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">사내 메일</h2>
                <button onClick={onNewMailClick} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors">
                    <Plus className="h-4 w-4 mr-2" />메일 작성
                </button>
            </div>
            <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
                <table className="w-full min-w-max">
                    <thead>
                        <tr className="border-b text-left text-sm text-gray-600">
                            <th className="p-4 font-medium w-12"></th>
                            <th className="p-4 font-medium w-32">보낸이</th>
                            <th className="p-4 font-medium">제목</th>
                            <th className="p-4 font-medium w-40">받은 시간</th>
                        </tr>
                    </thead>
                    <tbody>
                        {messages.map(message => (
                            <tr key={message.id} onClick={() => onMessageClick(message)} className={`border-b hover:bg-gray-50 cursor-pointer ${!message.read ? 'bg-blue-50' : ''}`}>
                                <td className="p-4">
                                    <div className="flex items-center space-x-3">
                                        {!message.read && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" title="읽지 않은 메일"></div>}
                                        {message.important && <Star className="h-4 w-4 text-yellow-500 fill-current" title="중요 메일" />}
                                    </div>
                                </td>
                                <td className={`p-4 ${!message.read ? 'font-bold text-gray-800' : 'text-gray-600'}`}>{message.senderName}</td>
                                <td className={`p-4 font-medium ${!message.read ? 'text-gray-900' : 'text-gray-700'}`}>{message.subject}</td>
                                <td className={`p-4 text-sm ${!message.read ? 'text-gray-700' : 'text-gray-500'}`}>{new Date(message.date).toLocaleString('ko-KR')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const BoardView: React.FC<{
  posts: Post[];
  user: User;
  handleCreatePost: (post: NewPost) => void;
  onPostClick: (post: Post) => void;
}> = ({ posts, user, handleCreatePost, onPostClick }) => {
  const [showModal, setShowModal] = useState(false);
  const [newPost, setNewPost] = useState<NewPost>({ title: '', content: '', category: 'general' });

  const createPost = () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }
    handleCreatePost(newPost);
    setNewPost({ title: '', content: '', category: 'general' });
    setShowModal(false);
    alert('게시글이 성공적으로 작성되었습니다.');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">사내 게시판</h2>
        <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors"><Plus className="h-4 w-4 mr-2" />글 작성</button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
        <table className="w-full min-w-max">
          <thead>
            <tr className="border-b text-left text-sm text-gray-600">
              <th className="p-4 font-medium">제목</th><th className="p-4 font-medium">작성자</th><th className="p-4 font-medium">작성일</th><th className="p-4 font-medium">조회수</th>
            </tr>
          </thead>
          <tbody>
            {posts.map(post => (
              <tr key={post.id} onClick={() => onPostClick(post)} className="border-b hover:bg-gray-50 cursor-pointer">
                <td className="p-4 font-medium text-gray-900">{post.title}</td><td className="p-4 text-gray-600">{post.author}</td><td className="p-4 text-gray-600">{post.date}</td><td className="p-4 text-gray-600">{post.views}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-2xl mx-4 animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">새 게시글 작성</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><XCircle className="h-6 w-6" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">제목</label>
                <input type="text" value={newPost.title} onChange={(e) => setNewPost({ ...newPost, title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="게시글 제목을 입력하세요" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">내용</label>
                <textarea value={newPost.content} onChange={(e) => setNewPost({ ...newPost, content: e.target.value })} rows={8} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="게시글 내용을 입력하세요" />
              </div>
            </div>
            <div className="flex space-x-3 mt-6 justify-end">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">취소</button>
              <button onClick={createPost} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">작성완료</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const EmployeesView: React.FC<{ 
  employees: Employee[]; 
  onNewEmployeeClick: () => void;
  onEmployeeClick: (employee: Employee) => void;
  onDeleteEmployee: (employeeId: number) => void;
}> = ({ employees, onNewEmployeeClick, onEmployeeClick, onDeleteEmployee }) => (
    <div className="space-y-6 animate-fadeIn">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">사원 관리</h2>
            <button onClick={onNewEmployeeClick} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors">
                <Plus className="h-4 w-4 mr-2" />사원 등록
            </button>
        </div>
        <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
            <table className="w-full min-w-max">
                <thead>
                    <tr className="border-b text-left text-sm text-gray-600">
                        <th className="p-4 font-medium">이름</th>
                        <th className="p-4 font-medium">직책</th>
                        <th className="p-4 font-medium">부서</th>
                        <th className="p-4 font-medium">이메일</th>
                        <th className="p-4 font-medium">상태</th>
                        <th className="p-4 font-medium">액션</th>
                    </tr>
                </thead>
                <tbody>
                    {employees.map(employee => (
                        <tr key={employee.id} className="border-b hover:bg-gray-50">
                            <td className="p-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">{employee.name[0]}</div>
                                    <span onClick={() => onEmployeeClick(employee)} className="font-medium text-gray-900 cursor-pointer hover:underline hover:text-blue-600">
                                      {employee.name}
                                    </span>
                                </div>
                            </td>
                            <td className="p-4 text-gray-600">{employee.position}</td>
                            <td className="p-4 text-gray-600">{employee.department}</td>
                            <td className="p-4 text-gray-600">{employee.email}</td>
                            <td className="p-4">
                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">{employee.status}</span>
                            </td>
                            <td className="p-4">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteEmployee(employee.id);
                                  }}
                                  className="text-red-500 hover:text-red-700 font-medium px-3 py-1 rounded-md hover:bg-red-50 transition-colors"
                                >
                                  삭제
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const DocumentsView: React.FC<{ documents: Document[] }> = ({ documents }) => (
    <div className="space-y-6 animate-fadeIn">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">문서 관리</h2>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors"><Plus className="h-4 w-4 mr-2" />문서 업로드</button>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="space-y-3">
                {documents.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <FileText className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">{doc.title}</p>
                                <p className="text-sm text-gray-600">{doc.author} &bull; {doc.date} &bull; {doc.size}</p>
                            </div>
                        </div>
                        <button className="p-2 text-gray-400 hover:text-gray-600"><Eye className="h-5 w-5" /></button>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const CalendarView: React.FC<{ events: Event[] }> = ({ events }) => {
    const today = new Date('2025-09-14'); // Fixed date for consistent display
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const generateCalendarDays = () => {
        return Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
            const isToday = day === today.getDate();
            const dayEvents = events.filter(e => new Date(e.date).getDate() === day && new Date(e.date).getMonth() === currentMonth);
            return (
                <div key={day} className={`aspect-square p-2 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${isToday ? 'bg-blue-600 text-white font-bold' : 'bg-white'}`}>
                    <div className="text-sm">{day}</div>
                    {dayEvents.length > 0 && (
                        <div className="mt-1 space-y-1">
                            {dayEvents.slice(0, 2).map(event => (
                                <div key={event.id} className={`text-xs ${isToday ? 'bg-white text-blue-800' : 'bg-blue-100 text-blue-800'} rounded px-1 py-0.5 truncate`}>{event.title}</div>
                            ))}
                        </div>
                    )}
                </div>
            );
        });
    };
    
    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">일정 관리</h2>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors"><Plus className="h-4 w-4 mr-2" />일정 추가</button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border p-6">
                    <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-semibold">{currentYear}년 {currentMonth + 1}월</h3></div>
                    <div className="grid grid-cols-7 gap-2 mb-2 text-center text-sm text-gray-600 font-medium">
                        {['일', '월', '화', '수', '목', '금', '토'].map(d => <div key={d}>{d}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-2">{generateCalendarDays()}</div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <h3 className="text-lg font-semibold mb-4">오늘의 일정 ({today.toLocaleDateString('ko-KR')})</h3>
                    <div className="space-y-3">
                        {events.filter(e => e.date === '2025-09-14').map(event => (
                            <div key={event.id} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900">{event.title}</p>
                                    <p className="text-sm text-gray-600">{event.startTime} - {event.endTime} &bull; {event.location}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ApprovalDetailModal: React.FC<{ approval: Approval; onClose: () => void; }> = ({ approval, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
    <div className="bg-white rounded-xl p-8 w-full max-w-2xl mx-4 transform transition-all">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h3 className="text-xl font-semibold text-gray-900">결재 문서 상세</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XCircle className="h-6 w-6" /></button>
      </div>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-500">제목</label>
          <p className="mt-1 text-lg font-semibold text-gray-800">{approval.title}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="text-sm font-medium text-gray-500">신청자</label><p className="mt-1 text-gray-800">{approval.requester}</p></div>
          <div><label className="text-sm font-medium text-gray-500">신청일</label><p className="mt-1 text-gray-800">{approval.date}</p></div>
          <div><label className="text-sm font-medium text-gray-500">금액</label><p className="mt-1 text-gray-800">{approval.amount}</p></div>
          <div>
            <label className="text-sm font-medium text-gray-500">상태</label>
            <p className="mt-1">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${ approval.status === 'approved' ? 'bg-green-100 text-green-800' : approval.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800' }`}>
                  {approval.status === 'approved' ? '승인' : approval.status === 'pending' ? '대기' : '반려'}
              </span>
            </p>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">내용</label>
          <div className="mt-1 p-3 bg-gray-50 rounded-lg border min-h-[100px] max-h-48 overflow-y-auto">
            <p className="text-gray-800 whitespace-pre-wrap">{approval.content}</p>
          </div>
        </div>
      </div>
      <div className="flex justify-end mt-6"><button onClick={onClose} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">닫기</button></div>
    </div>
  </div>
);

const NewApprovalModal: React.FC<{ onClose: () => void; onSubmit: (data: { title: string; amount: string; content: string }) => void; }> = ({ onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }
    onSubmit({ title, amount: amount || '-', content });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white rounded-xl p-8 w-full max-w-2xl mx-4 transform transition-all">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h3 className="text-xl font-semibold">새 결재 요청</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XCircle className="h-6 w-6" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">제목</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="결재 제목을 입력하세요" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">금액 (선택)</label>
            <input type="text" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="예: 500만원" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">내용</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={8} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="결재 요청 내용을 상세히 입력하세요" />
          </div>
        </div>
        <div className="flex space-x-3 mt-6 justify-end">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">취소</button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">요청</button>
        </div>
      </div>
    </div>
  );
};

const NewMailModal: React.FC<{
  onClose: () => void;
  onSubmit: (data: { recipient: string; subject: string; content: string }) => void;
  employees: Employee[];
  currentUser: User;
}> = ({ onClose, onSubmit, employees, currentUser }) => {
  const possibleRecipients = employees.filter(e => e.id !== currentUser.id);
  const [recipient, setRecipient] = useState(possibleRecipients[0]?.name || '');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = () => {
    if (!recipient || !subject.trim() || !content.trim()) {
      alert('받는 사람, 제목, 내용을 모두 입력해주세요.');
      return;
    }
    onSubmit({ recipient, subject, content });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white rounded-xl p-8 w-full max-w-2xl mx-4 transform transition-all">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h3 className="text-xl font-semibold">새 메일 작성</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XCircle className="h-6 w-6" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">받는 사람</label>
            <select value={recipient} onChange={(e) => setRecipient(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white">
              {possibleRecipients.map(e => <option key={e.id} value={e.name}>{e.name} ({e.department})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">제목</label>
            <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="메일 제목을 입력하세요" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">내용</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={8} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="메일 내용을 입력하세요" />
          </div>
        </div>
        <div className="flex space-x-3 mt-6 justify-end">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">취소</button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">보내기</button>
        </div>
      </div>
    </div>
  );
};

const MailDetailModal: React.FC<{ message: Message; onClose: () => void; }> = ({ message, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
    <div className="bg-white rounded-xl p-8 w-full max-w-3xl mx-4 transform transition-all">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h3 className="text-xl font-semibold text-gray-900 truncate">{message.subject}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XCircle className="h-6 w-6" /></button>
      </div>
      <div className="space-y-4">
        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
            <div>
                <label className="text-sm font-medium text-gray-500">보낸 사람</label>
                <p className="text-gray-800">{message.senderName}</p>
            </div>
            <div>
                <label className="text-sm font-medium text-gray-500">받은 시간</label>
                <p className="text-gray-800">{new Date(message.date).toLocaleString('ko-KR')}</p>
            </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">내용</label>
          <div className="mt-1 p-4 bg-gray-50 rounded-lg border min-h-[200px] max-h-80 overflow-y-auto">
            <p className="text-gray-800 whitespace-pre-wrap">{message.content}</p>
          </div>
        </div>
      </div>
      <div className="flex justify-end mt-6">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">닫기</button>
      </div>
    </div>
  </div>
);

const PostDetailModal: React.FC<{ post: Post; onClose: () => void; }> = ({ post, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
        <div className="bg-white rounded-xl p-8 w-full max-w-3xl mx-4 transform transition-all">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h3 className="text-xl font-semibold text-gray-900">{post.title}</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XCircle className="h-6 w-6" /></button>
            </div>
            <div className="space-y-4">
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg text-sm">
                    <div><span className="font-medium text-gray-500">작성자: </span><span className="text-gray-800">{post.author}</span></div>
                    <div><span className="font-medium text-gray-500">작성일: </span><span className="text-gray-800">{post.date}</span></div>
                    <div><span className="font-medium text-gray-500">조회수: </span><span className="text-gray-800">{post.views}</span></div>
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-500">내용</label>
                    <div className="mt-1 p-4 bg-gray-50 rounded-lg border min-h-[200px] max-h-80 overflow-y-auto">
                        <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
                    </div>
                </div>
            </div>
            <div className="flex justify-end mt-6">
                <button onClick={onClose} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">닫기</button>
            </div>
        </div>
    </div>
);

const NewEmployeeModal: React.FC<{
  onClose: () => void;
  onSubmit: (data: { name: string; position: string; department: string; email: string }) => void;
}> = ({ onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [department, setDepartment] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = () => {
    if (!name.trim() || !position.trim() || !department.trim() || !email.trim()) {
      alert('모든 필드를 입력해주세요.');
      return;
    }
    if (!email.includes('@')) {
      alert('유효한 이메일 주소를 입력해주세요.');
      return;
    }
    onSubmit({ name, position, department, email });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white rounded-xl p-8 w-full max-w-2xl mx-4 transform transition-all">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h3 className="text-xl font-semibold">새 사원 등록</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XCircle className="h-6 w-6" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">이름</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="사원 이름을 입력하세요" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">직책</label>
            <input type="text" value={position} onChange={(e) => setPosition(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="예: 교육팀장, 상담사" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">부서</label>
            <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="예: 청소년교육팀, 상담팀" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="예: name@sjhope.org" />
          </div>
        </div>
        <div className="flex space-x-3 mt-6 justify-end">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">취소</button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">등록</button>
        </div>
      </div>
    </div>
  );
};

const EditEmployeeModal: React.FC<{
  employee: Employee;
  onClose: () => void;
  onUpdate: (data: Employee) => void;
}> = ({ employee, onClose, onUpdate }) => {
  const [name, setName] = useState(employee.name);
  const [position, setPosition] = useState(employee.position);
  const [department, setDepartment] = useState(employee.department);
  const [email, setEmail] = useState(employee.email);

  useEffect(() => {
    setName(employee.name);
    setPosition(employee.position);
    setDepartment(employee.department);
    setEmail(employee.email);
  }, [employee]);

  const handleUpdate = () => {
    if (!name.trim() || !position.trim() || !department.trim() || !email.trim()) {
      alert('모든 필드를 입력해주세요.'); return;
    }
    if (!email.includes('@')) {
      alert('유효한 이메일 주소를 입력해주세요.'); return;
    }
    onUpdate({ ...employee, name, position, department, email });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white rounded-xl p-8 w-full max-w-2xl mx-4 transform transition-all">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h3 className="text-xl font-semibold">사원 정보 수정</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XCircle className="h-6 w-6" /></button>
        </div>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-2">이름</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-2">직책</label><input type="text" value={position} onChange={(e) => setPosition(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-2">부서</label><input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-2">이메일</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" /></div>
        </div>
        <div className="flex justify-end mt-8">
          <div className="flex space-x-3">
            <button onClick={onClose} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">취소</button>
            <button onClick={handleUpdate} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">수정하기</button>
          </div>
        </div>
      </div>
    </div>
  );
};


// --- MAIN APP COMPONENT ---

const ERPSystem: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [user] = useState<User>({ id: 5, name: '김민수', position: '교육팀장', department: '청소년교육팀' });
  
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const [showNewApprovalModal, setShowNewApprovalModal] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);
  const [showNewMailModal, setShowNewMailModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showNewEmployeeModal, setShowNewEmployeeModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    const initializeData = () => {
      setIsLoading(true);
      try {
        const existingData = localStorage.getItem('erp_employees');
        if (!existingData) {
          Object.entries(SEED_DATA).forEach(([key, data]) => {
            localStorage.setItem(`erp_${key}`, JSON.stringify(data));
          });
        }
        setApprovals(JSON.parse(localStorage.getItem('erp_approvals') || '[]').sort((a: Approval, b: Approval) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setEmployees(JSON.parse(localStorage.getItem('erp_employees') || '[]'));
        setDocuments(JSON.parse(localStorage.getItem('erp_documents') || '[]'));
        setPosts(JSON.parse(localStorage.getItem('erp_posts') || '[]').sort((a: Post, b: Post) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setMessages(JSON.parse(localStorage.getItem('erp_messages') || '[]').sort((a: Message, b: Message) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setEvents(JSON.parse(localStorage.getItem('erp_events') || '[]'));
        setLastSync(new Date());
      } catch (error) {
        console.error('Data initialization failed:', error);
      } finally {
        setTimeout(() => setIsLoading(false), 500);
      }
    };
    initializeData();
  }, []);
  
  const handleApprovalStatusChange = useCallback((approvalId: number, newStatus: ApprovalStatus) => {
    const updated = approvals.map(a => a.id === approvalId ? { ...a, status: newStatus } : a);
    setApprovals(updated);
    localStorage.setItem('erp_approvals', JSON.stringify(updated));
    alert(`결재가 ${newStatus === 'approved' ? '승인' : '반려'}되었습니다.`);
  }, [approvals]);

  const handleCreatePost = useCallback((newPost: NewPost) => {
    const post: Post = {
      id: Math.max(0, ...posts.map(p => p.id)) + 1, ...newPost, author: user.name, date: new Date().toISOString().split('T')[0], views: 0
    };
    const updated = [post, ...posts];
    setPosts(updated);
    localStorage.setItem('erp_posts', JSON.stringify(updated));
  }, [posts, user.name]);
  
  const handleViewPost = useCallback((postToView: Post) => {
    const updatedPosts = posts.map(p => 
      p.id === postToView.id ? { ...p, views: p.views + 1 } : p
    );
    setPosts(updatedPosts);
    localStorage.setItem('erp_posts', JSON.stringify(updatedPosts));
    // Set the selected post with the updated view count for the modal
    setSelectedPost({ ...postToView, views: postToView.views + 1 });
  }, [posts]);

  const handleMarkMessageAsRead = useCallback((messageId: number) => {
    const updated = messages.map(m => m.id === messageId ? { ...m, read: true } : m);
    setMessages(updated);
    localStorage.setItem('erp_messages', JSON.stringify(updated));
  }, [messages]);

  const handleViewMessage = (message: Message) => {
      if (!message.read) {
          handleMarkMessageAsRead(message.id);
      }
      setSelectedMessage(message);
  };

  const handleCreateApproval = useCallback((newApprovalData: { title: string; amount: string; content: string; }) => {
    const newApproval: Approval = {
        id: Math.max(0, ...approvals.map(a => a.id)) + 1,
        ...newApprovalData,
        requester: user.name,
        date: new Date().toISOString().split('T')[0],
        status: 'pending',
    };
    const updated = [newApproval, ...approvals];
    setApprovals(updated);
    localStorage.setItem('erp_approvals', JSON.stringify(updated));
    setShowNewApprovalModal(false);
    alert('결재 요청이 상신되었습니다.');
  }, [approvals, user.name]);

  const handleSendMail = useCallback((mailData: { recipient: string; subject: string; content: string; }) => {
    const newMessage: Message = {
        id: Math.max(0, ...messages.map(m => m.id)) + 1,
        subject: mailData.subject,
        content: mailData.content,
        senderName: user.name,
        date: new Date().toISOString(),
        read: false, 
        important: false,
    };
    const updated = [newMessage, ...messages];
    setMessages(updated);
    localStorage.setItem('erp_messages', JSON.stringify(updated));
    setShowNewMailModal(false);
    alert(`${mailData.recipient}님에게 메일을 성공적으로 보냈습니다.`);
  }, [messages, user.name]);
  
  const handleCreateEmployee = useCallback((newEmployeeData: { name: string; position: string; department: string; email: string; }) => {
    const newEmployee: Employee = {
      id: Math.max(0, ...employees.map(e => e.id)) + 1,
      ...newEmployeeData,
      status: '재직',
    };
    const updated = [newEmployee, ...employees];
    setEmployees(updated);
    localStorage.setItem('erp_employees', JSON.stringify(updated));
    setShowNewEmployeeModal(false);
    alert(`${newEmployee.name}님이 사원으로 등록되었습니다.`);
  }, [employees]);

  const handleUpdateEmployee = useCallback((updatedEmployee: Employee) => {
    const updated = employees.map(e => e.id === updatedEmployee.id ? updatedEmployee : e);
    setEmployees(updated);
    localStorage.setItem('erp_employees', JSON.stringify(updated));
    setSelectedEmployee(null);
    alert(`${updatedEmployee.name}님의 정보가 수정되었습니다.`);
  }, [employees]);

  const handleDeleteEmployee = useCallback((employeeId: number) => {
    const employeeToDelete = employees.find(e => e.id === employeeId);
    if (employeeToDelete && window.confirm(`${employeeToDelete.name}님의 정보를 정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
      const updated = employees.filter(e => e.id !== employeeId);
      setEmployees(updated);
      localStorage.setItem('erp_employees', JSON.stringify(updated));
      alert(`사원 정보가 삭제되었습니다.`);
    }
  }, [employees]);


  const stats = {
    pendingApprovals: approvals.filter(a => a.status === 'pending').length,
    unreadMessages: messages.filter(m => !m.read).length,
    totalEmployees: employees.length,
    totalPrograms: 8
  };

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard': return <Dashboard user={user} stats={stats} approvals={approvals} posts={posts} lastSync={lastSync} />;
      case 'approval': return <ApprovalView approvals={approvals} handleApprovalStatusChange={handleApprovalStatusChange} onNewRequestClick={() => setShowNewApprovalModal(true)} onApprovalClick={setSelectedApproval} />;
      case 'mail': return <MailView messages={messages} onMessageClick={handleViewMessage} onNewMailClick={() => setShowNewMailModal(true)} />;
      case 'board': return <BoardView posts={posts} user={user} handleCreatePost={handleCreatePost} onPostClick={handleViewPost} />;
      case 'employees': return <EmployeesView employees={employees} onNewEmployeeClick={() => setShowNewEmployeeModal(true)} onEmployeeClick={setSelectedEmployee} onDeleteEmployee={handleDeleteEmployee} />;
      case 'documents': return <DocumentsView documents={documents} />;
      case 'calendar': return <CalendarView events={events} />;
      default: return <Dashboard user={user} stats={stats} approvals={approvals} posts={posts} lastSync={lastSync} />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">시스템을 초기화하고 있습니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <header className="bg-white shadow-sm border-b px-6 py-3 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">S&J희망나눔</h1>
              <p className="text-xs text-gray-500">청소년 교육기관 ERP</p>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="relative hidden md:block">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="전체 검색..." className="pl-10 pr-4 py-2 w-64 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition" />
            </div>
            <button className="relative p-2 text-gray-500 hover:text-gray-700">
              <Bell className="h-5 w-5" />
              {stats.unreadMessages > 0 && <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">{stats.unreadMessages}</span>}
            </button>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.position}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">{user.name[0]}</div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="w-64 bg-white shadow-sm h-[calc(100vh-64px)] sticky top-[64px] p-4 flex flex-col justify-between">
          <nav>
            <ul className="space-y-2">
              {MENU_ITEMS.map(item => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button onClick={() => setActiveMenu(item.id)} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${ activeMenu === item.id ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100' }`}>
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.name}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div>
            <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm flex items-center space-x-2"><Database className="h-4 w-4 text-gray-500" /><span className="text-gray-600">DB 상태:</span><span className="font-medium text-green-600">정상</span></div>
            <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"><LogOut className="h-5 w-5" /><span>로그아웃</span></button>
          </div>
        </aside>
        <main className="flex-1 p-8 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
      {showNewApprovalModal && <NewApprovalModal onClose={() => setShowNewApprovalModal(false)} onSubmit={handleCreateApproval} />}
      {selectedApproval && <ApprovalDetailModal approval={selectedApproval} onClose={() => setSelectedApproval(null)} />}
      {showNewMailModal && <NewMailModal onClose={() => setShowNewMailModal(false)} onSubmit={handleSendMail} employees={employees} currentUser={user} />}
      {selectedMessage && <MailDetailModal message={selectedMessage} onClose={() => setSelectedMessage(null)} />}
      {selectedPost && <PostDetailModal post={selectedPost} onClose={() => setSelectedPost(null)} />}
      {showNewEmployeeModal && <NewEmployeeModal onClose={() => setShowNewEmployeeModal(false)} onSubmit={handleCreateEmployee} />}
      {selectedEmployee && <EditEmployeeModal employee={selectedEmployee} onClose={() => setSelectedEmployee(null)} onUpdate={handleUpdateEmployee} />}
    </div>
  );
};

export default ERPSystem;
