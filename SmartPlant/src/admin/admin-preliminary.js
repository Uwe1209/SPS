import React, { useState, useEffect, useRef } from 'react';

// --- Icon Components (using web-compatible SVG) ---
const HomeIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <path d="M9 22V12h6v10"></path>
  </svg>
);

const UserIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const FeedbackIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

const SearchIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <path d="M21 21l-4.35-4.35"></path>
    </svg>
);

const StarIcon = ({ className, filled = false }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill={filled ? "#A59480" : 'none'} stroke="#A59480" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
    </svg>
);

const BackIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5"></path>
        <path d="M12 19l-7-7 7-7"></path>
    </svg>
);

const MailIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
        <path d="M22 6l-10 7L2 6"></path>
    </svg>
);

const TrashIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18"></path>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
);

const EditIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
);

const PlusIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);

// --- Reusable Components ---
const SearchBar = ({ value, onChange }) => (
    <div className="flex items-center bg-white rounded-xl px-4 my-4 mx-1 shadow-sm">
        <SearchIcon className="text-[#75685a] mr-3" />
        <input
            type="text"
            placeholder="Search"
            className="w-full h-12 text-base bg-transparent text-[#3C3633] placeholder-[#75685a] focus:outline-none"
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
    </div>
);


// --- Data ---
const allUsers = [
    { id: 1, name: 'Gibson', status: 'active', favourite: true, color: 'bg-red-300', details: { age: 32, gender: 'Male', contact: '555-0101', address: '123 Apple St', email: 'gibson@example.com', plantId: 10, role: 'Expert' } },
    { id: 2, name: 'Esther', status: 'active', favourite: false, color: 'bg-green-700', details: { age: 28, gender: 'Female', contact: '555-0102', address: '456 Oak Ave', email: 'esther@example.com', plantId: 12, role: 'User' } },
    { id: 3, name: 'Nothing', status: 'deactive', favourite: false, color: 'bg-lime-400', details: { age: 45, gender: 'Other', contact: '555-0103', address: '789 Pine Ln', email: 'nothing@example.com', plantId: 5, role: 'User' } },
    { id: 4, name: 'Eric Wee', status: 'active', favourite: true, color: 'bg-yellow-200', details: { age: 25, gender: 'Male', contact: '555-0104', address: '321 Birch Rd', email: 'eric.w@example.com', plantId: 8, role: 'Expert' } },
    { id: 5, name: 'Gibson Lee', status: 'deactive', favourite: false, color: 'bg-green-700', details: { age: 32, gender: 'Male', contact: '555-0105', address: '654 Maple Ct', email: 'gibson.l@example.com', plantId: 15, role: 'User' } },
    { id: 6, name: 'Eric', status: 'active', favourite: false, color: 'bg-gray-400', details: { age: 29, gender: 'Male', contact: '555-0106', address: '987 Cedar Blvd', email: 'eric@example.com', plantId: 7, role: 'User' } },
    { id: 7, name: 'Samantha', status: 'active', favourite: true, color: 'bg-purple-400', details: { age: 35, gender: 'Female', contact: '555-0107', address: '111 Rosewood Dr', email: 'samantha@example.com', plantId: 22, role: 'Expert' } },
    { id: 8, name: 'Ben Carter', status: 'deactive', favourite: false, color: 'bg-blue-400', details: { age: 41, gender: 'Male', contact: '555-0108', address: '222 Willow Way', email: 'ben.c@example.com', plantId: 3, role: 'User' } },
    { id: 9, name: 'Olivia', status: 'active', favourite: false, color: 'bg-pink-300', details: { age: 22, gender: 'Female', contact: '555-0109', address: '333 Daisy Pl', email: 'olivia@example.com', plantId: 18, role: 'User' } },
];

const allMails = [
    { id: 1, from: 'Feedback', to: 'me', subject: 'Regarding the new UI', body: 'The new user interface is fantastic! Very intuitive and easy to navigate.', date: 'Tuesday', status: 'unread', flagged: true, timeGroup: 'Yesterday' },
    { id: 2, from: 'Service Report', to: 'not-me', subject: 'Weekly System Performance', body: 'Please find the attached weekly performance report. Overall system health is at 99.8%.', date: 'Tuesday', status: 'read', flagged: true, timeGroup: 'Yesterday' },
    { id: 3, from: 'System Alert', to: 'me', subject: 'New login detected', body: 'A new device has logged into your account. If this was not you, please secure your account immediately.', date: '07/05/2025', status: 'read', flagged: false, timeGroup: 'This Week' },
];

const allFeedbacks = [
    { id: 1, subject: 'UI Suggestion', body: 'The dashboard looks great, but maybe the colors could be a bit brighter.', time: 'Yesterday', replies: [] },
    { id: 2, subject: 'Feature Request', body: 'Can we add a dark mode? It would be easier on the eyes at night.', time: '2 days ago', replies: [{ text: "That's a great idea! We'll look into it for a future update.", time: 'Yesterday'}]}
];


// --- Screens ---

const DashboardScreen = ({ navigate }) => (
    <div className="p-4 overflow-y-auto">
        <header className="flex items-center mb-6">
            <img src="https://placehold.co/48x48/c8b6a6/FFF?text=B" alt="User Avatar" className="w-12 h-12 rounded-full mr-4"/>
            <div>
                <p className="text-base text-[#75685a]">Good Morning</p>
                <p className="text-xl font-bold text-[#3C3633]">Bryan</p>
            </div>
        </header>

        <div className="space-y-4">
             <div onClick={() => navigate('AccountManagement')} className="bg-white p-4 rounded-2xl shadow-sm flex items-center cursor-pointer hover:shadow-lg transition-shadow">
                <div className="p-3 bg-red-100 rounded-lg mr-4"><UserIcon className="w-6 h-6 text-red-500" /></div>
                <div className="flex-grow">
                    <p className="font-bold text-[#3C3633]">Accounts</p>
                    <p className="text-sm text-[#75685a]">99 users</p>
                </div>
                <p className="text-2xl font-bold text-[#3C3633]">99</p>
            </div>
             <div onClick={() => navigate('MailManagement')} className="bg-white p-4 rounded-2xl shadow-sm flex items-center cursor-pointer hover:shadow-lg transition-shadow">
                <div className="p-3 bg-blue-100 rounded-lg mr-4"><MailIcon className="w-6 h-6 text-blue-500" /></div>
                <div className="flex-grow">
                    <p className="font-bold text-[#3C3633]">Mailbox</p>
                    <p className="text-sm text-[#75685a]">2 unread</p>
                </div>
                <p className="text-2xl font-bold text-[#3C3633]">02</p>
            </div>
            <div onClick={() => navigate('FeedbackManagement')} className="bg-white p-4 rounded-2xl shadow-sm flex items-center cursor-pointer hover:shadow-lg transition-shadow">
                <div className="p-3 bg-green-100 rounded-lg mr-4"><FeedbackIcon className="w-6 h-6 text-green-500" /></div>
                <div className="flex-grow">
                    <p className="font-bold text-[#3C3633]">Feedback</p>
                    <p className="text-sm text-[#75685a]">2 pending</p>
                </div>
                <p className="text-2xl font-bold text-[#3C3633]">02</p>
            </div>
        </div>

        <div className="mt-6 bg-white p-4 rounded-2xl shadow-sm">
            <h2 className="text-lg font-bold text-[#3C3633] mb-4">Plant Rarity Distribution</h2>
            <div className="space-y-4">
                <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="font-semibold text-gray-600">Common</span>
                        <span className="text-gray-500">1250 / 1550</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-[#A59480] h-2.5 rounded-full" style={{ width: '80.6%' }}></div>
                    </div>
                </div>
                <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="font-semibold text-gray-600">Rare</span>
                        <span className="text-gray-500">250 / 1550</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-[#C8B6A6] h-2.5 rounded-full" style={{ width: '16.1%' }}></div>
                    </div>
                </div>
                <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="font-semibold text-gray-600">Endangered</span>
                        <span className="text-gray-500">50 / 1550</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-red-400 h-2.5 rounded-full" style={{ width: '3.2%' }}></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const AccountManagementScreen = ({ navigate, allUsers }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('all');

    const filteredUsers = allUsers.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase());
        if (!matchesSearch) return false;
        
        if (filter === 'all') {
            return true;
        }
        if (filter === 'favourite') {
            return user.favourite;
        }
        return user.status === filter;
    });

    return (
        <div className="p-4 flex flex-col h-full">
            <header className="flex items-center justify-between py-2">
                <button onClick={() => navigate('Dashboard')}><BackIcon className="text-[#3C3633]" /></button>
                <h1 className="text-xl font-bold text-[#3C3633]">Account Management</h1>
                <button onClick={() => navigate('AddUser')}><PlusIcon className="text-[#3C3633]" /></button>
            </header>
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
            <div className="flex justify-around items-center my-2 space-x-2">
                <button onClick={() => setFilter('all')} className={`flex-1 px-2 py-2 rounded-lg font-semibold text-sm ${filter === 'all' ? 'bg-[#A59480] text-white' : 'bg-white text-[#75685a]'}`}>All</button>
                <button onClick={() => setFilter('active')} className={`flex-1 px-2 py-2 rounded-lg font-semibold text-sm ${filter === 'active' ? 'bg-[#A59480] text-white' : 'bg-white text-[#75685a]'}`}>Active</button>
                <button onClick={() => setFilter('deactive')} className={`flex-1 px-2 py-2 rounded-lg font-semibold text-sm ${filter === 'deactive' ? 'bg-[#A59480] text-white' : 'bg-white text-[#75685a]'}`}>Deactive</button>
                <button onClick={() => setFilter('favourite')} className={`flex-1 px-2 py-2 rounded-lg font-semibold text-sm ${filter === 'favourite' ? 'bg-[#A59480] text-white' : 'bg-white text-[#75685a]'}`}>Favourite</button>
            </div>
            <div className="flex-grow overflow-y-auto grid grid-cols-2 gap-4 mt-4">
                {filteredUsers.length > 0 ? filteredUsers.map(user => (
                    <button key={user.id} onClick={() => navigate('UserProfile', user)} className={`aspect-square rounded-2xl flex items-end p-4 text-white font-bold ${user.color}`}>
                        {user.name}
                    </button>
                )) : <p className="col-span-2 text-center text-gray-500 mt-8">No accounts found.</p>}
            </div>
        </div>
    );
};

const UserProfileScreen = ({ navigate, user, onDelete }) => {
    if (!user) return <div className="p-4">User not found. <button onClick={() => navigate('AccountManagement')}>Go Back</button></div>;
    
    return (
        <div className="flex flex-col h-full bg-gray-50">
            <header className="flex items-center justify-between p-4">
                <button onClick={() => navigate('AccountManagement')}><BackIcon className="text-[#3C3633]" /></button>
                <h1 className="text-xl font-bold text-[#3C3633]">User Profile</h1>
                <div className="flex items-center space-x-2">
                  <button className="p-2 rounded-full hover:bg-gray-200"><EditIcon className="text-gray-700" /></button>
                  <button onClick={() => onDelete(user.id)} className="p-2 rounded-full hover:bg-gray-200"><TrashIcon className="text-red-500" /></button>
                </div>
            </header>
            
            <main className="flex-grow overflow-y-auto p-4 pt-0 pb-8">
                <div className="flex flex-col items-center pt-4">
                     <div className={`w-24 h-24 rounded-full shadow-lg overflow-hidden flex items-center justify-center text-white text-4xl font-bold ${user.color}`}>
                         {user.name.charAt(0)}
                    </div>
                    <h1 className="text-2xl font-bold text-[#3C3633] mt-4">{user.name}</h1>
                    <p className="text-base text-[#75685a]">{user.details.role}</p>
                    <div className="flex items-center space-x-2 mt-1">
                        <span className={`h-2.5 w-2.5 rounded-full ${user.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                        <span className="text-sm capitalize text-gray-600">{user.status}</span>
                    </div>
                </div>

                <div className="mt-8 bg-white p-4 rounded-2xl shadow-sm">
                    <h2 className="text-lg font-bold text-[#3C3633] mb-4">Personal Information</h2>
                    <div className="grid grid-cols-1 gap-y-3 text-sm text-[#3C3633]">
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-gray-500">Email</span>
                            <span>{user.details.email}</span>
                        </div>
                        <hr/>
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-gray-500">Contact</span>
                            <span>{user.details.contact}</span>
                        </div>
                        <hr/>
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-gray-500">Address</span>
                            <span>{user.details.address}</span>
                        </div>
                        <hr/>
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-gray-500">Gender</span>
                            <span>{user.details.gender}</span>
                        </div>
                        <hr/>
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-gray-500">Age</span>
                            <span>{user.details.age}</span>
                        </div>
                    </div>
                </div>
                
                <div className="mt-6 bg-white p-4 rounded-2xl shadow-sm">
                    <h2 className="text-lg font-bold text-[#3C3633] mb-4">Activity</h2>
                    <div className="flex justify-around text-center">
                        <div>
                            <p className="text-2xl font-bold text-[#A59480]">{user.details.plantId}</p>
                            <p className="text-sm text-gray-500">Plants ID'd</p>
                        </div>
                         <div>
                            <p className="text-2xl font-bold text-[#A59480]">12</p>
                            <p className="text-sm text-gray-500">Reports</p>
                        </div>
                         <div>
                            <p className="text-2xl font-bold text-[#A59480]">5</p>
                            <p className="text-sm text-gray-500">Feedbacks</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

const AddUserScreen = ({ navigate, onAddUser }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('User');
    const [status, setStatus] = useState('active');

    const handleSave = () => {
        if (!name || !email) {
            alert("Please fill in all fields.");
            return;
        }
        const newUser = {
            name,
            status,
            details: { email, role, age: 0, gender: 'N/A', contact: 'N/A', address: 'N/A', plantId: 0 }
        };
        onAddUser(newUser);
    }

    return (
        <div className="p-4 flex flex-col h-full bg-gray-50">
            <header className="flex items-center justify-between py-2">
                <button onClick={() => navigate('AccountManagement')}><BackIcon className="text-[#3C3633]" /></button>
                <h1 className="text-xl font-bold text-[#3C3633]">Add New User</h1>
                <div className="w-6"></div>
            </header>
            <div className="flex-grow overflow-y-auto mt-4 space-y-6 bg-white p-4 rounded-2xl shadow-sm">
                <div>
                    <label className="text-sm font-semibold text-gray-600">Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full mt-1 p-3 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A59480]"/>
                </div>
                 <div>
                    <label className="text-sm font-semibold text-gray-600">Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full mt-1 p-3 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A59480]"/>
                </div>
                 <div>
                    <label className="text-sm font-semibold text-gray-600">Role</label>
                    <select value={role} onChange={e => setRole(e.target.value)} className="w-full mt-1 p-3 bg-gray-100 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#A59480]">
                        <option>User</option>
                        <option>Expert</option>
                    </select>
                </div>
                <div>
                    <label className="text-sm font-semibold text-gray-600">Status</label>
                    <div className="flex space-x-4 mt-2">
                        <label className="flex items-center"><input type="radio" name="status" value="active" checked={status === 'active'} onChange={e => setStatus(e.target.value)} className="mr-2 accent-[#A59480]"/> Active</label>
                        <label className="flex items-center"><input type="radio" name="status" value="deactive" checked={status === 'deactive'} onChange={e => setStatus(e.target.value)} className="mr-2 accent-[#A59480]"/> Deactive</label>
                    </div>
                </div>
            </div>
            <button onClick={handleSave} className="w-full bg-[#A59480] p-4 rounded-xl text-center text-white font-bold text-base mt-4">Save User</button>
        </div>
    );
}

const MailManagementScreen = ({ navigate, allMails, onToggleFavourite }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('all');

    const filteredMails = allMails.filter(mail => {
        const matchesSearch = mail.subject.toLowerCase().includes(searchQuery.toLowerCase()) || mail.from.toLowerCase().includes(searchQuery.toLowerCase());
        if (!matchesSearch) return false;
        if (filter === 'unread') return mail.status === 'unread';
        if (filter === 'favourite') return mail.flagged;
        return true;
    });

    const groupedMails = filteredMails.reduce((acc, mail) => {
        (acc[mail.timeGroup] = acc[mail.timeGroup] || []).push(mail);
        return acc;
    }, {});

    return (
        <div className="p-4 flex flex-col h-full">
            <header className="flex items-center justify-between py-2">
                <button onClick={() => navigate('Dashboard')}><BackIcon className="text-[#3C3633]" /></button>
                <h1 className="text-xl font-bold text-[#3C3633]">Mail Management</h1>
                <div className="w-6"></div>
            </header>
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
            <div className="flex justify-around items-center my-2">
                <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg font-semibold ${filter === 'all' ? 'bg-[#A59480] text-white' : 'bg-white text-[#75685a]'}`}>All</button>
                <button onClick={() => setFilter('unread')} className={`px-4 py-2 rounded-lg font-semibold ${filter === 'unread' ? 'bg-[#A59480] text-white' : 'bg-white text-[#75685a]'}`}>Unread</button>
                <button onClick={() => setFilter('favourite')} className={`px-4 py-2 rounded-lg font-semibold ${filter === 'favourite' ? 'bg-[#A59480] text-white' : 'bg-white text-[#75685a]'}`}>Favourite</button>
            </div>
            <div className="flex-grow overflow-y-auto mt-4">
                {Object.keys(groupedMails).length > 0 ? Object.entries(groupedMails).map(([group, mails]) => (
                    <div key={group}>
                        <h3 className="font-bold text-[#3C3633] my-2">{group}</h3>
                        {mails.map(mail => (
                            <div key={mail.id} onClick={() => navigate('MailDetail', mail)} className="w-full flex items-center py-3 border-b border-gray-200 cursor-pointer">
                                <div className={`w-10 h-10 rounded-full flex-shrink-0 mr-4 ${mail.status === 'unread' ? 'bg-[#A59480]' : 'bg-gray-200'}`}></div>
                                <div className="flex-grow text-left min-w-0">
                                    <p className="font-bold text-[#3C3633] truncate">{mail.from}</p>
                                    <p className="text-[#75685a] text-sm truncate">{mail.subject}</p>
                                </div>
                                <div className="text-right flex-shrink-0 ml-2">
                                    <p className="text-xs text-[#75685a] mb-1">{mail.date}</p>
                                    <button onClick={(e) => { e.stopPropagation(); onToggleFavourite(mail.id); }} className="p-1">
                                        <StarIcon filled={mail.flagged} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )) : <p className="text-center text-gray-500 mt-8">No mail found.</p>}
            </div>
        </div>
    );
};

const MailDetailScreen = ({ navigate, mail }) => {
    if (!mail) return <div className="p-4">Mail not found. <button onClick={() => navigate('MailManagement')}>Go Back</button></div>;

    return (
        <div className="p-4 flex flex-col h-full">
            <header className="flex items-center">
                <button onClick={() => navigate('MailManagement')}><BackIcon className="text-[#3C3633]" /></button>
                <div className="flex-grow"></div>
                <button className="mx-2"><TrashIcon className="text-red-500" /></button>
            </header>
            <div className="flex-grow overflow-y-auto py-4">
                <h1 className="text-2xl font-bold text-[#3C3633] mb-4">{mail.subject}</h1>
                 <div className="flex items-center py-4 border-b border-gray-200">
                    <div className="w-10 h-10 rounded-full bg-gray-200 mr-4"></div>
                    <div className="flex-grow">
                        <p className="text-base font-bold text-[#3C3633]">{mail.from}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[#75685a] text-sm">{mail.date}</p>
                    </div>
                </div>
                <p className="mt-5 text-[#3C3633]">{mail.body}</p>
            </div>
            <div className="py-2">
                <button className="w-full bg-[#A59480] p-4 rounded-xl text-center text-white font-bold text-base">Reply</button>
            </div>
        </div>
    );
};

const FeedbackManagementScreen = ({ navigate, feedbacks, searchQuery, onSearchChange }) => {
    const filteredFeedbacks = feedbacks.filter(
      feedback =>
        feedback.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        feedback.body.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-4 flex flex-col h-full">
            <header className="flex items-center justify-between py-2">
                <button onClick={() => navigate('Dashboard')}><BackIcon className="text-[#3C3633]" /></button>
                <h1 className="text-xl font-bold text-[#3C3633]">Feedback Management</h1>
                <div className="w-6"></div>
            </header>
            <SearchBar value={searchQuery} onChange={onSearchChange}/>
            <div className="flex-grow overflow-y-auto">
                {filteredFeedbacks.length > 0 ? (
                     filteredFeedbacks.map(item => (
                        <button key={item.id} onClick={() => navigate('FeedbackDetail', item)} className="w-full flex items-start py-4 border-b border-gray-200">
                            <div className="w-10 h-10 rounded-full bg-gray-200 mr-4 flex-shrink-0"></div>
                            <div className="flex-grow text-left min-w-0">
                                <p className="text-base font-bold text-[#3C3633] truncate">{item.subject}</p>
                                <p className="text-[#75685a] text-sm truncate">{item.body}</p>
                            </div>
                            <div className="text-right flex-shrink-0 ml-2">
                                <p className="text-[#75685a] text-xs mb-1">{item.time}</p>
                                {item.replies && item.replies.length > 0 && 
                                    <span className="px-2 py-1 bg-green-200 text-green-800 text-xs rounded-full">Replied</span>
                                }
                            </div>
                        </button>
                     ))
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-[#75685a]">No feedback found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const FeedbackDetailScreen = ({ navigate, feedback, onDelete, onReply }) => {
    const [replyText, setReplyText] = useState('');
    const scrollRef = useRef(null);
    if (!feedback) return <div className="p-4">Feedback not found. <button onClick={() => navigate('FeedbackManagement')}>Go Back</button></div>;

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [feedback.replies]);

    const handleReplyClick = () => {
        if (replyText.trim()) {
            onReply(feedback.id, replyText);
            setReplyText('');
        }
    };

    return (
        <div className="p-0 flex flex-col h-full bg-[#FFFBF5]">
            <header className="flex items-center p-4 border-b border-gray-200 flex-shrink-0">
                 <button onClick={() => navigate('FeedbackManagement')}><BackIcon className="text-[#3C3633]" /></button>
                <div className="flex-grow"></div>
                <button onClick={() => onDelete(feedback.id)} className="mx-2"><TrashIcon className="text-red-500" /></button>
            </header>
            <div ref={scrollRef} className="flex-grow overflow-y-auto overflow-x-hidden p-4">
                <h1 className="text-2xl font-bold text-[#3C3633] mb-4 break-words">{feedback.subject}</h1>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gray-200 mr-4"></div>
                        <div className="flex-grow min-w-0">
                            <p className="text-base font-bold text-[#3C3633]">User Feedback</p>
                            <p className="text-[#75685a] text-sm">{feedback.time}</p>
                        </div>
                    </div>
                    <div className="mt-4 text-[#3C3633] break-words"><p>{feedback.body}</p></div>
                </div>

                {feedback.replies && feedback.replies.map((reply, index) => (
                    <div key={index} className="bg-green-50 p-4 rounded-lg shadow-sm mt-4 ml-8">
                        <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-gray-800 text-white flex items-center justify-center mr-4 font-bold text-sm flex-shrink-0">YOU</div>
                            <div className="flex-grow min-w-0">
                                <p className="text-base font-bold text-[#3C3633]">Your Reply</p>
                                <p className="text-[#75685a] text-sm">{reply.time}</p>
                            </div>
                        </div>
                        <div className="mt-4 text-[#3C3633] break-words"><p>{reply.text}</p></div>
                    </div>
                ))}
            </div>
            <div className="p-4 bg-[#FFFBF5] border-t border-gray-200 flex-shrink-0">
                 <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A59480] bg-white"
                    rows="3"
                    placeholder="Type your reply here..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                ></textarea>
                <button onClick={handleReplyClick} className="w-full mt-2 bg-[#A59480] p-4 rounded-xl text-center text-white font-bold text-base disabled:bg-gray-400" disabled={!replyText.trim()}>
                    Send Reply
                </button>
            </div>
        </div>
    )
}


// --- Main App Component ---
export default function App() {
  const [page, setPage] = useState('Dashboard');
  const [activeTab, setActiveTab] = useState('Home');
  
  const [users, setUsers] = useState(allUsers);
  const [mails, setMails] = useState(allMails);
  const [feedbacks, setFeedbacks] = useState(allFeedbacks);

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedMail, setSelectedMail] = useState(null);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  
  const [toastMessage, setToastMessage] = useState('');
  const [feedbackSearchQuery, setFeedbackSearchQuery] = useState('');


  const navigate = (newPage, data = null) => {
    if (newPage === 'FeedbackDetail') setSelectedFeedback(data);
    if (newPage === 'UserProfile') setSelectedUser(data);
    if (newPage === 'MailDetail') setSelectedMail(data);
    if (newPage !== 'FeedbackManagement') setFeedbackSearchQuery('');
    setPage(newPage);
  };

  const handleDeleteUser = (userId) => {
      setUsers(currentUsers => currentUsers.filter(u => u.id !== userId));
      navigate('AccountManagement');
      setToastMessage("User deleted successfully!");
      setTimeout(() => setToastMessage(""), 3000);
  };

  const handleAddNewUser = (newUser) => {
      const userWithId = {
          ...newUser,
          id: Date.now(),
          favourite: false,
          color: ['bg-red-300', 'bg-green-700', 'bg-lime-400', 'bg-yellow-200', 'bg-purple-400', 'bg-blue-400', 'bg-pink-300'][users.length % 7]
      };
      setUsers(currentUsers => [...currentUsers, userWithId]);
      navigate('AccountManagement');
      setToastMessage("User added successfully!");
      setTimeout(() => setToastMessage(""), 3000);
  };

   const handleToggleMailFavourite = (mailId) => {
    setMails(currentMails =>
        currentMails.map(mail =>
            mail.id === mailId ? { ...mail, flagged: !mail.flagged } : mail
        )
    );
  };

  const handleDeleteFeedback = (id) => {
      setFeedbacks(currentFeedbacks => currentFeedbacks.filter(f => f.id !== id));
      navigate('FeedbackManagement');
  }

  const handleReplyFeedback = (feedbackId, replyText) => {
      const newReply = { text: replyText, time: 'Just now' };
      const updatedFeedbacks = feedbacks.map(fb =>
        fb.id === feedbackId ? { ...fb, replies: [...(fb.replies || []), newReply] } : fb
      );
      setFeedbacks(updatedFeedbacks);
      const updatedSelectedFeedback = { ...selectedFeedback, replies: [...(selectedFeedback.replies || []), newReply] };
      setSelectedFeedback(updatedSelectedFeedback);
      setToastMessage("Reply sent!");
      setTimeout(() => setToastMessage(""), 3000);
  }
  
  const renderPage = () => {
    switch (page) {
      case 'Dashboard':
        return <DashboardScreen navigate={navigate} />;
      case 'AccountManagement':
        return <AccountManagementScreen navigate={navigate} allUsers={users} />;
      case 'UserProfile':
        return <UserProfileScreen navigate={navigate} user={selectedUser} onDelete={handleDeleteUser} />;
      case 'AddUser':
        return <AddUserScreen navigate={navigate} onAddUser={handleAddNewUser} />;
      case 'MailManagement':
        return <MailManagementScreen navigate={navigate} allMails={mails} onToggleFavourite={handleToggleMailFavourite} />;
      case 'MailDetail':
        return <MailDetailScreen navigate={navigate} mail={selectedMail} />;
      case 'FeedbackManagement':
        return <FeedbackManagementScreen navigate={navigate} feedbacks={feedbacks} searchQuery={feedbackSearchQuery} onSearchChange={setFeedbackSearchQuery} />;
      case 'FeedbackDetail':
          return <FeedbackDetailScreen navigate={navigate} feedback={selectedFeedback} onDelete={handleDeleteFeedback} onReply={handleReplyFeedback} />;
      default:
        return <DashboardScreen navigate={navigate} />;
    }
  };

  return (
    <div className="h-screen w-full max-w-md mx-auto bg-[#FFFBF5] flex flex-col font-sans relative overflow-hidden">
      <main className="flex-grow overflow-y-auto pb-16">
        {renderPage()}
      </main>
      <footer className="absolute bottom-0 left-0 right-0 h-16 bg-transparent">
        <div className="h-16 bg-white flex items-center justify-around absolute bottom-0 left-0 right-0 border-t border-gray-200">
          <button onClick={() => {setActiveTab('Home'); navigate('Dashboard')}} className="flex-1 flex items-center justify-center h-full">
              <HomeIcon className={activeTab === 'Home' ? 'text-[#3C3633]' : 'text-[#75685a]'} />
          </button>
          <button onClick={() => {setActiveTab('Account'); navigate('AccountManagement')}} className="flex-1 flex items-center justify-center h-full">
              <UserIcon className={activeTab === 'Account' ? 'text-[#3C3633]' : 'text-[#75685a]'} />
          </button>
          <button onClick={() => {setActiveTab('Mail'); navigate('MailManagement')}} className="flex-1 flex items-center justify-center h-full">
              <MailIcon className={activeTab === 'Mail' ? 'text-[#3C3633]' : 'text-[#75685a]'} />
          </button>
          <button onClick={() => {setActiveTab('Feedback'); navigate('FeedbackManagement')}} className="flex-1 flex items-center justify-center h-full">
              <FeedbackIcon className={activeTab === 'Feedback' ? 'text-[#3C3633]' : 'text-[#75685a]'} />
          </button>
        </div>
      </footer>
      {toastMessage && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-full">
              {toastMessage}
          </div>
      )}
    </div>
  );
};

