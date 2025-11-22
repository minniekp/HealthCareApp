import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { profileService } from '../../services';
import { validateEmail, validatePhone } from '../../utils/validators';
import styles from './styles/patient.module.css';

const ProfileManagement = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');

  const [formData, setFormData] = useState({
    // Personal Information
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    dateOfBirth: user?.dateOfBirth || '',
    phone: user?.phone || '',
    gender: user?.gender || 'not-specified',
    bloodType: user?.bloodType || '',
    height: user?.height || '',
    weight: user?.weight || '',
    
    // Health Information
    allergies: user?.allergies || '',
    currentMedications: user?.currentMedications || [],
    chronicConditions: user?.chronicConditions || [],
    surgeries: user?.surgeries || '',
    familyMedicalHistory: user?.familyMedicalHistory || '',
    
    // Emergency Contact
    emergencyContactName: user?.emergencyContactName || '',
    emergencyContactPhone: user?.emergencyContactPhone || '',
    emergencyContactRelation: user?.emergencyContactRelation || '',
    
    // Preferences
    notificationPreferences: user?.notificationPreferences || {
      email: true,
      sms: false,
      push: true,
    },
    privacySettings: user?.privacySettings || {
      shareDataWithProvider: true,
      shareDataWithFamily: false,
    },
  });

  const [medicationInput, setMedicationInput] = useState('');
  const [conditionInput, setConditionInput] = useState('');

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        dateOfBirth: user.dateOfBirth || '',
        phone: user.phone || '',
      }));
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  const handleAddMedication = () => {
    if (medicationInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        currentMedications: [...prev.currentMedications, medicationInput],
      }));
      setMedicationInput('');
    }
  };

  const handleRemoveMedication = (index) => {
    setFormData((prev) => ({
      ...prev,
      currentMedications: prev.currentMedications.filter((_, i) => i !== index),
    }));
  };

  const handleAddCondition = () => {
    if (conditionInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        chronicConditions: [...prev.chronicConditions, conditionInput],
      }));
      setConditionInput('');
    }
  };

  const handleRemoveCondition = (index) => {
    setFormData((prev) => ({
      ...prev,
      chronicConditions: prev.chronicConditions.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const errors = [];

    if (!formData.firstName.trim()) errors.push('First name is required');
    if (!formData.lastName.trim()) errors.push('Last name is required');
    if (!validateEmail(formData.email)) errors.push('Valid email is required');
    if (formData.phone && !validatePhone(formData.phone)) errors.push('Valid phone is required');
    if (formData.dateOfBirth) {
      const age = new Date().getFullYear() - new Date(formData.dateOfBirth).getFullYear();
      if (age < 18) errors.push('Patient must be 18 or older');
    }

    return errors;
  };

  const handleSaveProfile = async () => {
    const validationErrors = validateForm();
    
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await profileService.updateProfile(formData);
      
      // Update context with new user data
      updateUser(formData);
      
      setSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.profileManagement}>
      <div className={styles.profileHeader}>
        <h1>My Profile</h1>
        {!isEditing && (
          <button
            className={styles.primaryBtn}
            onClick={() => setIsEditing(true)}
          >
            ✏️ Edit Profile
          </button>
        )}
      </div>

      {error && <div className={styles.errorAlert}>{error}</div>}
      {success && <div className={styles.successAlert}>Profile updated successfully!</div>}

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={activeTab === 'personal' ? styles.activeTab : ''}
          onClick={() => setActiveTab('personal')}
        >
          Personal Info
        </button>
        <button
          className={activeTab === 'health' ? styles.activeTab : ''}
          onClick={() => setActiveTab('health')}
        >
          Health Information
        </button>
        <button
          className={activeTab === 'emergency' ? styles.activeTab : ''}
          onClick={() => setActiveTab('emergency')}
        >
          Emergency Contact
        </button>
        <button
          className={activeTab === 'preferences' ? styles.activeTab : ''}
          onClick={() => setActiveTab('preferences')}
        >
          Preferences
        </button>
      </div>

      {/* Personal Information Tab */}
      {activeTab === 'personal' && (
        <div className={styles.tabContent}>
          <div className={styles.formSection}>
            <h2>Personal Information</h2>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Enter first name"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Enter last name"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Enter email"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Enter phone number"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                >
                  <option value="not-specified">Not Specified</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Height (cm)</label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="e.g., 175"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Weight (kg)</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="e.g., 70"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Blood Type</label>
                <select
                  name="bloodType"
                  value={formData.bloodType}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                >
                  <option value="">Select Blood Type</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Health Information Tab */}
      {activeTab === 'health' && (
        <div className={styles.tabContent}>
          <div className={styles.formSection}>
            <h2>Health Information</h2>

            {/* Allergies */}
            <div className={styles.formGroup}>
              <label>Allergies</label>
              <textarea
                name="allergies"
                value={formData.allergies}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="List any allergies (e.g., Peanuts, Penicillin)"
                rows={3}
              />
            </div>

            {/* Current Medications */}
            <div className={styles.formGroup}>
              <label>Current Medications</label>
              <div className={styles.listInput}>
                <div className={styles.inputRow}>
                  <input
                    type="text"
                    value={medicationInput}
                    onChange={(e) => setMedicationInput(e.target.value)}
                    disabled={!isEditing}
                    placeholder="Enter medication name and dosage"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddMedication();
                      }
                    }}
                  />
                  {isEditing && (
                    <button
                      className={styles.addBtn}
                      onClick={handleAddMedication}
                      type="button"
                    >
                      + Add
                    </button>
                  )}
                </div>
                <div className={styles.tagsList}>
                  {formData.currentMedications.map((med, idx) => (
                    <div key={idx} className={styles.tag}>
                      <span>{med}</span>
                      {isEditing && (
                        <button
                          className={styles.removeBtn}
                          onClick={() => handleRemoveMedication(idx)}
                          type="button"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Chronic Conditions */}
            <div className={styles.formGroup}>
              <label>Chronic Conditions</label>
              <div className={styles.listInput}>
                <div className={styles.inputRow}>
                  <input
                    type="text"
                    value={conditionInput}
                    onChange={(e) => setConditionInput(e.target.value)}
                    disabled={!isEditing}
                    placeholder="Enter chronic condition"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddCondition();
                      }
                    }}
                  />
                  {isEditing && (
                    <button
                      className={styles.addBtn}
                      onClick={handleAddCondition}
                      type="button"
                    >
                      + Add
                    </button>
                  )}
                </div>
                <div className={styles.tagsList}>
                  {formData.chronicConditions.map((condition, idx) => (
                    <div key={idx} className={styles.tag}>
                      <span>{condition}</span>
                      {isEditing && (
                        <button
                          className={styles.removeBtn}
                          onClick={() => handleRemoveCondition(idx)}
                          type="button"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Past Surgeries */}
            <div className={styles.formGroup}>
              <label>Past Surgeries</label>
              <textarea
                name="surgeries"
                value={formData.surgeries}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="List any past surgeries with dates"
                rows={3}
              />
            </div>

            {/* Family Medical History */}
            <div className={styles.formGroup}>
              <label>Family Medical History</label>
              <textarea
                name="familyMedicalHistory"
                value={formData.familyMedicalHistory}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Include relevant family health conditions"
                rows={3}
              />
            </div>
          </div>
        </div>
      )}

      {/* Emergency Contact Tab */}
      {activeTab === 'emergency' && (
        <div className={styles.tabContent}>
          <div className={styles.formSection}>
            <h2>Emergency Contact</h2>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>Contact Name</label>
                <input
                  type="text"
                  name="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Full name"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Relationship</label>
                <input
                  type="text"
                  name="emergencyContactRelation"
                  value={formData.emergencyContactRelation}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="e.g., Parent, Spouse"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="emergencyContactPhone"
                  value={formData.emergencyContactPhone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Emergency contact phone"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className={styles.tabContent}>
          <div className={styles.formSection}>
            <h2>Notification Preferences</h2>
            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="notificationPreferences.email"
                  checked={formData.notificationPreferences.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
                <span>Email Notifications</span>
              </label>

              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="notificationPreferences.sms"
                  checked={formData.notificationPreferences.sms}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
                <span>SMS Notifications</span>
              </label>

              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="notificationPreferences.push"
                  checked={formData.notificationPreferences.push}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
                <span>Push Notifications</span>
              </label>
            </div>

            <h2 style={{ marginTop: '2rem' }}>Privacy Settings</h2>
            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="privacySettings.shareDataWithProvider"
                  checked={formData.privacySettings.shareDataWithProvider}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
                <span>Share health data with my healthcare provider</span>
              </label>

              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="privacySettings.shareDataWithFamily"
                  checked={formData.privacySettings.shareDataWithFamily}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
                <span>Share health data with family members</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {isEditing && (
        <div className={styles.actionButtons}>
          <button
            className={styles.primaryBtn}
            onClick={handleSaveProfile}
            disabled={loading}
          >
            {loading ? 'Saving...' : '💾 Save Changes'}
          </button>
          <button
            className={styles.secondaryBtn}
            onClick={() => setIsEditing(false)}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileManagement;