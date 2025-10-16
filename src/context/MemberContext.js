import React, { createContext, useContext, useState, useEffect } from 'react';

const MemberContext = createContext();

export const useMemberContext = () => {
  const context = useContext(MemberContext);
  if (!context) {
    throw new Error('useMemberContext must be used within MemberProvider');
  }
  return context;
};

export const MemberProvider = ({ children }) => {
  // Load members from localStorage or initialize empty array
  const [members, setMembers] = useState(() => {
    const savedMembers = localStorage.getItem('hod_members');
    return savedMembers ? JSON.parse(savedMembers) : [];
  });

  // Save members to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('hod_members', JSON.stringify(members));
  }, [members]);

  const addMember = (memberData) => {
    const newMember = {
      ...memberData,
      membershipNumber: `HOD-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setMembers([...members, newMember]);
    return newMember;
  };

  const updateMember = (email, updates) => {
    setMembers(members.map(member =>
      member.email === email
        ? { ...member, ...updates }
        : member
    ));
  };

  const getMemberByCredentials = (email, idNo) => {
    return members.find(
      member => member.email === email && member.idNo === idNo
    );
  };

  const getMemberByEmail = (email) => {
    return members.find(member => member.email === email);
  };

  return (
    <MemberContext.Provider
      value={{
        members,
        addMember,
        updateMember,
        getMemberByCredentials,
        getMemberByEmail
      }}
    >
      {children}
    </MemberContext.Provider>
  );
};
