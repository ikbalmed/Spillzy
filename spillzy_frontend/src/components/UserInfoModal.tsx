
import React, { useState } from 'react';

interface UserInfo {
  name: string;
  gender: string;
  age: string;
}

interface UserInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userInfo: UserInfo | null) => void;
}

const UserInfoModal: React.FC<UserInfoModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: name.trim(),
      gender,
      age: age.trim()
    });
    onClose();
  };

  const handleSkip = () => {
    onSubmit(null);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Welcome to Spillzy</h2>
          <p>Help us personalize your experience (optional)</p>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
            />
          </div>

          <div className="form-group">
            <label>Gender</label>
            <div className="gender-options">
              <label className="radio-option">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={gender === 'male'}
                  onChange={(e) => setGender(e.target.value)}
                />
                <span>Male</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={gender === 'female'}
                  onChange={(e) => setGender(e.target.value)}
                />
                <span>Female</span>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="age">Age</label>
            <input
              type="number"
              id="age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Enter your age"
              min="10"
              max="90"
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={handleSkip} className="btn-skip">
              Skip
            </button>
            <button type="submit" className="btn-submit">
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserInfoModal;
