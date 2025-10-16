import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const MemberContext = createContext();

export const useMemberContext = () => {
  const context = useContext(MemberContext);
  if (!context) {
    throw new Error('useMemberContext must be used within MemberProvider');
  }
  return context;
};

export const MemberProvider = ({ children }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load members from database on mount
  useEffect(() => {
    const loadMembers = async () => {
      try {
        const response = await axios.get('/members');
        if (response.data.success) {
          const dbMembers = response.data.data;
          setMembers(dbMembers);
          // Also save to localStorage for offline access
          localStorage.setItem('hod_members', JSON.stringify(dbMembers));
        }
      } catch (error) {
        console.error('Error loading members from database:', error);
        // Fallback to localStorage if database fails
        const savedMembers = localStorage.getItem('hod_members');
        if (savedMembers) {
          setMembers(JSON.parse(savedMembers));
        }
      } finally {
        setLoading(false);
      }
    };

    loadMembers();
  }, []);

  // Save members to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('hod_members', JSON.stringify(members));
    }
  }, [members, loading]);

  const addMember = async (memberData) => {
    try {
      // Check for duplicate email in current members
      const existingEmail = members.find(m => m.email?.toLowerCase() === memberData.email?.toLowerCase());
      if (existingEmail) {
        const error = new Error('Duplicate email');
        error.field = 'email';
        error.value = memberData.email;
        toast.error(`Email "${memberData.email}" is already registered. Please use a different email.`, {
          autoClose: 5000
        });
        throw error;
      }

      // Check for duplicate phone in current members
      const existingPhone = members.find(m => m.phone === memberData.phone);
      if (existingPhone) {
        const error = new Error('Duplicate phone');
        error.field = 'phone';
        error.value = memberData.phone;
        toast.error(`Phone number "${memberData.phone}" is already registered. Please use a different phone number.`, {
          autoClose: 5000
        });
        throw error;
      }

      // Check for duplicate ID number in current members
      const existingIdNo = members.find(m => m.idNo === memberData.idNo);
      if (existingIdNo) {
        const error = new Error('Duplicate ID number');
        error.field = 'idNo';
        error.value = memberData.idNo;
        toast.error(`ID Number "${memberData.idNo}" is already registered. Please use a different ID number.`, {
          autoClose: 5000
        });
        throw error;
      }

      // Save to backend database (which will also create User account)
      const response = await axios.post('/members', memberData);

      if (response.data.success) {
        const newMember = response.data.data;
        setMembers([...members, newMember]);
        toast.success('Member registered successfully! They can now log in with their email and ID number.', {
          autoClose: 5000
        });
        return newMember;
      }
    } catch (error) {
      // Handle backend errors
      if (error.response?.data?.message) {
        const backendMsg = error.response.data.message;

        // Parse backend error to extract field
        if (backendMsg.includes('email')) {
          toast.error(`Email is already registered. Please use a different email.`, {
            autoClose: 5000
          });
        } else if (backendMsg.includes('phone')) {
          toast.error(`Phone number is already registered. Please use a different phone number.`, {
            autoClose: 5000
          });
        } else if (backendMsg.includes('ID number')) {
          toast.error(`ID number is already registered. Please use a different ID number.`, {
            autoClose: 5000
          });
        } else if (backendMsg.includes('logged in') || backendMsg.includes('Authentication required')) {
          toast.error(`Please log in as an admin before adding members.`, {
            autoClose: 7000
          });
        } else {
          toast.error(backendMsg, { autoClose: 5000 });
        }
      } else if (error.response?.status === 401) {
        toast.error('Authentication required. Please log in as an admin to add members.', {
          autoClose: 7000
        });
      } else {
        toast.error('An error occurred while adding the member. Please try again.', {
          autoClose: 5000
        });
      }
      throw error;
    }
  };

  const updateMember = async (memberId, updates) => {
    try {
      const response = await axios.put(`/members/${memberId}`, updates);
      if (response.data.success) {
        setMembers(members.map(member =>
          member._id === memberId ? response.data.data : member
        ));
        toast.success('Member updated successfully');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update member');
      throw error;
    }
  };

  const getMemberByCredentials = (email, idNo) => {
    return members.find(
      member => member.email?.toLowerCase() === email?.toLowerCase() && member.idNo === idNo
    );
  };

  const getMemberByEmail = (email) => {
    return members.find(member => member.email?.toLowerCase() === email?.toLowerCase());
  };

  return (
    <MemberContext.Provider
      value={{
        members,
        loading,
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
