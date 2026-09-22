'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import {
  User,
  Mail,
  Phone,
  Droplet,
  MapPin,
  Briefcase,
  Lock,
  Camera,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Award,
  Save,
  ArrowLeft,
  Eye,
  EyeOff,
  HeartHandshake,
  ExternalLink,
  QrCode,
  Upload,
  UploadCloud,
  RotateCcw,
  SwitchCamera,
  Trash2,
  Check,
  X
} from 'lucide-react';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const UPAZILAS = ['ঝালকাঠি সদর', 'নলছিটি', 'রাজাপুর', 'কাঠালিয়া'];
const VOLUNTEER_INTEREST_OPTIONS = [
  'জরুরি রক্তদান ও ব্লাড ক্যাম্প',
  'ফ্রি স্বাস্থ্য ও চক্ষু ক্যাম্প',
  'বন্যা ও দুর্যোগে জরুরি ত্রাণ',
  'আইটি, ওয়েব ও ডিজিটাল কমিউনিটি',
  'পরিবেশ রক্ষা ও বৃক্ষরোপণ কর্মসূচি',
  'যুব সম্মেলন ও সমাজ সচেতনতামূলক কাজ'
];

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('personal'); // 'personal' | 'avatar' | 'volunteer' | 'security' | 'card'

  // Profile Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [blood, setBlood] = useState('');
  const [upazila, setUpazila] = useState('ঝালকাঠি সদর');
  const [district, setDistrict] = useState('ঝালকাঠি');
  const [profession, setProfession] = useState('');
  const [bio, setBio] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [volunteerInterests, setVolunteerInterests] = useState([]);

  // File Upload & Camera States
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [facingMode, setFacingMode] = useState('user');
  const [isDragging, setIsDragging] = useState(false);

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Feedback Notifications
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Image Compression Helper
  const compressImage = (file, maxWidth = 600, maxHeight = 600, quality = 0.85) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const processImageFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      flashError('Please select a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      flashError('Selected image is too large. Please select an image under 12MB.');
      return;
    }

    try {
      const compressed = await compressImage(file, 600, 600, 0.85);
      setPhotoUrl(compressed);
      flashSuccess('Photo loaded from your device! Click "Save Photo" to save.');
    } catch (err) {
      console.error('Failed to process image:', err);
      flashError('Failed to process the selected image.');
    }
  };

  const handleDeviceUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) processImageFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) processImageFile(file);
  };

  // Camera Management
  const startCamera = async (mode = facingMode) => {
    setCameraOpen(true);
    setCameraLoading(true);
    setCameraError('');
    setCapturedPhoto(null);

    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop());
      setCameraStream(null);
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera access is not supported on this browser or environment.');
      setCameraLoading(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 640 },
          height: { ideal: 640 }
        },
        audio: false
      });
      setCameraStream(stream);
      setCameraLoading(false);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch((err) => console.log('Video play caught:', err));
        }
      }, 100);
    } catch (err) {
      console.error('Camera permission/access error:', err);
      setCameraError('Camera access was denied or device is not available. Please allow camera permissions or upload an image file.');
      setCameraLoading(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop());
      setCameraStream(null);
    }
    setCameraOpen(false);
    setCapturedPhoto(null);
    setCameraError('');
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const vWidth = video.videoWidth || 640;
    const vHeight = video.videoHeight || 480;
    const size = Math.min(vWidth, vHeight);

    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const startX = (vWidth - size) / 2;
    const startY = (vHeight - size) / 2;

    if (facingMode === 'user') {
      ctx.translate(size, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, startX, startY, size, size, 0, 0, size, size);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
    setCapturedPhoto(dataUrl);
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
  };

  const confirmCapturedPhoto = () => {
    if (capturedPhoto) {
      setPhotoUrl(capturedPhoto);
      flashSuccess('Live photo captured! Click "Save Photo" to apply to your profile.');
    }
    stopCamera();
  };

  const switchCamera = () => {
    const newMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newMode);
    startCamera(newMode);
  };

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [cameraStream]);

  // 1. Fetch Profile on Mount
  useEffect(() => {
    async function loadUserProfile() {
      try {
        setLoading(true);
        const storedToken = localStorage.getItem('wcc_token');
        if (!storedToken) {
          router.push('/login');
          return;
        }

        const res = await api.getProfile();
        const profile = res.user || res;
        setUser(profile);

        // Populate form fields
        setName(profile.name || '');
        setPhone(profile.phone || '');
        setBlood(profile.blood || '');
        setUpazila(profile.upazila || 'ঝালকাঠি সদর');
        setDistrict(profile.district || 'ঝালকাঠি');
        setProfession(profile.profession || '');
        setBio(profile.bio || '');
        setPhotoUrl(profile.photoUrl || '');
        setVolunteerInterests(Array.isArray(profile.volunteerInterests) ? profile.volunteerInterests : []);
      } catch (err) {
        console.error('Failed to load profile:', err);
        setErrorMessage(err.message || 'Failed to load user profile. Please log in again.');
      } finally {
        setLoading(false);
      }
    }

    loadUserProfile();
  }, [router]);

  // Flash feedback helper
  const flashSuccess = (msg) => {
    setSuccessMessage(msg);
    setErrorMessage('');
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const flashError = (msg) => {
    setErrorMessage(msg);
    setSuccessMessage('');
    setTimeout(() => setErrorMessage(''), 6000);
  };

  // 2. Save Profile Updates
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const payload = {
        name,
        phone,
        blood,
        upazila,
        district,
        profession,
        bio,
        photoUrl,
        volunteerInterests
      };

      const res = await api.updateProfile(payload);
      const updatedUser = res.user;
      setUser(updatedUser);

      // Update localStorage cached session
      const stored = localStorage.getItem('wcc_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        localStorage.setItem('wcc_user', JSON.stringify({ ...parsed, ...updatedUser }));
      }

      flashSuccess('Profile updated successfully! Official digital ID card and registry have been synced.');
    } catch (err) {
      flashError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  // 3. Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      flashError('Current password and new password are required.');
      return;
    }

    if (newPassword.length < 6) {
      flashError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      flashError('New passwords do not match. Please verify.');
      return;
    }

    setChangingPassword(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      await api.changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      flashSuccess('Password changed successfully! Next time you sign in, use your new password.');
    } catch (err) {
      flashError(err.message || 'Failed to change password. Please check your current password.');
    } finally {
      setChangingPassword(false);
    }
  };

  // Toggle volunteer interest
  const handleToggleInterest = (interest) => {
    setVolunteerInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-3 border-[#B62A35] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold text-slate-500">Loading your profile details...</p>
      </div>
    );
  }

  const roleBadgeColors = {
    admin: 'bg-rose-50 text-rose-700 border-rose-200',
    coordinator: 'bg-purple-50 text-purple-700 border-purple-200',
    volunteer: 'bg-amber-50 text-amber-900 border-amber-200',
    finance_officer: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    member: 'bg-blue-50 text-blue-800 border-blue-200'
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              My Profile & Account Settings
            </h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase ${
                roleBadgeColors[user?.role] || roleBadgeColors.member
              }`}
            >
              {user?.role || 'Member'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 pl-7">
            Manage your personal contact details, location, profile avatar, volunteering preferences, and security settings.
          </p>
        </div>

        <div className="flex items-center gap-2 pl-7 md:pl-0">
          <Link
            href="/dashboard"
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-900 rounded-2xl text-xs flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Profile Overview Card & Quick Stats */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-100 border-3 border-[#F1AD1A] shadow-md flex items-center justify-center shrink-0">
              {photoUrl ? (
                <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-black text-[#B62A35]">
                  {name ? name.charAt(0).toUpperCase() : 'U'}
                </span>
              )}
            </div>
            <button
              onClick={() => setActiveTab('avatar')}
              className="absolute bottom-0 right-0 p-1.5 rounded-full bg-[#B62A35] text-white shadow-xs hover:bg-[#9E1F2A] transition-colors"
              title="Change Avatar"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-lg font-black text-slate-900">{name || 'User Name'}</h2>
              {user?.memberId && (
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-mono font-bold">
                  {user.memberId}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1 text-[11px] text-slate-600">
              {blood && (
                <span className="inline-flex items-center gap-1 font-semibold text-rose-700">
                  <Droplet className="w-3 h-3 text-rose-500" />
                  <span>Blood: {blood}</span>
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>{upazila}, {district}</span>
              </span>
              {profession && (
                <span className="inline-flex items-center gap-1">
                  <Briefcase className="w-3 h-3 text-slate-400" />
                  <span>{profession}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Member / Volunteer Stats */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-center">
          {user?.role === 'volunteer' && (
            <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl text-center">
              <div className="text-xl font-black text-amber-900">{user.totalHours || 0} hrs</div>
              <div className="text-[10px] uppercase font-bold text-amber-700">Service Hours</div>
            </div>
          )}
          <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-center">
            <div className="text-xs font-bold text-slate-800">
              {user?.volunteerWing || user?.assignedWing?.nameEn || 'General Wing'}
            </div>
            <div className="text-[10px] uppercase font-bold text-slate-500">Assigned Wing</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('personal')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'personal'
              ? 'bg-[#B62A35] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Personal Information</span>
        </button>

        <button
          onClick={() => setActiveTab('avatar')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'avatar'
              ? 'bg-[#B62A35] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Profile Photo</span>
        </button>

        <button
          onClick={() => setActiveTab('volunteer')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'volunteer'
              ? 'bg-[#B62A35] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Volunteering & Wing</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'security'
              ? 'bg-[#B62A35] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Account & Security</span>
        </button>

        <button
          onClick={() => setActiveTab('card')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'card'
              ? 'bg-[#B62A35] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Digital ID Card Preview</span>
        </button>
      </div>

      {/* TAB CONTENT */}

      {/* 1. Personal Information */}
      {activeTab === 'personal' && (
        <form onSubmit={handleSaveProfile} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Personal & Contact Information</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              These details are verified and reflected on your official WCC membership dossier.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full legal name"
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:border-[#B62A35] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address (Read-only)</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Mobile Phone (মোবাইল নম্বর)</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 01711223344"
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl focus:border-[#B62A35] focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Blood Group (রক্তের গ্রুপ)</label>
              <select
                value={blood}
                onChange={(e) => setBlood(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:border-[#B62A35] focus:outline-hidden font-semibold"
              >
                <option value="">Select Blood Group</option>
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Upazila (উপজেলা)</label>
              <select
                value={upazila}
                onChange={(e) => setUpazila(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:border-[#B62A35] focus:outline-hidden"
              >
                {UPAZILAS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">District (জেলা)</label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="ঝালকাঠি"
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:border-[#B62A35] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Profession / Occupation</label>
              <input
                type="text"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                placeholder="e.g. Student, Engineer, Teacher, Business"
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:border-[#B62A35] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Official Member ID</label>
              <input
                type="text"
                disabled
                value={user?.memberId || 'Pending Assignment'}
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-500 font-mono font-bold cursor-not-allowed"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="block font-semibold text-slate-700 mb-1">Bio / Statement</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell our community a little about yourself and what motivates your involvement with WCC..."
              className="w-full p-3 border border-slate-200 rounded-xl focus:border-[#B62A35] focus:outline-hidden"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-[#B62A35] hover:bg-[#9E1F2A] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving Updates...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Personal Details</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* 2. Profile Photo Avatar Tab */}
      {activeTab === 'avatar' && (
        <form onSubmit={handleSaveProfile} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Profile Photo / Avatar</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload from your device or take a live photo using your camera. This appears on your official WCC digital ID card.
              </p>
            </div>
            {photoUrl && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[11px] font-bold">
                <Check className="w-3.5 h-3.5" />
                <span>Photo Ready</span>
              </span>
            )}
          </div>

          {/* Hidden File Input for Device Upload */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleDeviceUpload}
            className="hidden"
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Current Avatar Card */}
            <div className="lg:col-span-4 bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col items-center text-center space-y-4">
              <div className="relative group">
                <div className="w-36 h-36 rounded-full overflow-hidden bg-white border-4 border-[#F1AD1A] shadow-md flex items-center justify-center">
                  {photoUrl ? (
                    <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-16 h-16 text-slate-300" />
                  )}
                </div>
                {photoUrl && (
                  <button
                    type="button"
                    onClick={() => setPhotoUrl('')}
                    className="absolute top-0 right-0 p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-md transition-colors"
                    title="Remove Photo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div>
                <span className="text-xs font-bold text-slate-800 block">ID Card Avatar</span>
                <span className="text-[11px] text-slate-500">
                  {photoUrl ? 'Custom photo selected' : 'No photo uploaded yet'}
                </span>
              </div>

              {photoUrl && (
                <button
                  type="button"
                  onClick={() => setPhotoUrl('')}
                  className="px-3 py-1.5 text-[11px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Photo</span>
                </button>
              )}
            </div>

            {/* Right: Upload Options (Device & Camera) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Device Upload Card / Dropzone */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-5 rounded-2xl border-2 border-dashed text-center flex flex-col items-center justify-center space-y-3 cursor-pointer transition-all ${
                    isDragging
                      ? 'border-[#B62A35] bg-rose-50/50 scale-[1.02]'
                      : 'border-slate-200 hover:border-[#B62A35] hover:bg-slate-50/80 bg-white'
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 text-[#B62A35] flex items-center justify-center">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-extrabold text-slate-900 block">Upload from Device</span>
                    <p className="text-[11px] text-slate-500">
                      Click to browse or drag & drop image here
                    </p>
                    <span className="inline-block text-[10px] text-slate-400 font-medium">
                      PNG, JPG, JPEG, WEBP (Auto-optimized)
                    </span>
                  </div>
                  <button
                    type="button"
                    className="px-3.5 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Choose File</span>
                  </button>
                </div>

                {/* 2. Take Live Photo with Camera Card */}
                <div
                  onClick={() => startCamera()}
                  className="p-5 rounded-2xl border-2 border-slate-200 hover:border-[#B62A35] hover:bg-slate-50/80 bg-white text-center flex flex-col items-center justify-center space-y-3 cursor-pointer transition-all group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#F1AD1A] group-hover:scale-110 flex items-center justify-center transition-transform">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-extrabold text-slate-900 block">Click Photo with Camera</span>
                    <p className="text-[11px] text-slate-500">
                      Take a snapshot using your webcam or phone camera
                    </p>
                    <span className="inline-block text-[10px] text-emerald-600 font-semibold">
                      Instant capture & preview
                    </span>
                  </div>
                  <button
                    type="button"
                    className="px-3.5 py-1.5 bg-[#B62A35] text-white rounded-xl text-xs font-bold hover:bg-[#9E1F2A] transition-colors flex items-center gap-1.5"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Open Camera</span>
                  </button>
                </div>
              </div>

              {/* Web URL & Presets Option */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-[11px] font-bold text-slate-700">Or Paste Image URL directly:</label>
                  <span className="text-[10px] text-slate-400">Public image link (e.g. from cloud storage)</span>
                </div>
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://example.com/my-photo.jpg"
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs focus:border-[#B62A35] focus:outline-hidden"
                />

                <div className="pt-1">
                  <span className="block text-[11px] font-bold text-slate-600 mb-2">Or Choose a Preset Community Avatar:</span>
                  <div className="flex flex-wrap items-center gap-2">
                    {[
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
                      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
                      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
                      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
                    ].map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPhotoUrl(preset)}
                        className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                          photoUrl === preset ? 'border-[#B62A35] scale-110 shadow-md' : 'border-slate-200 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={preset} alt="preset" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-[#B62A35] hover:bg-[#9E1F2A] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Photo & Sync ID Card</span>
            </button>
          </div>
        </form>
      )}

      {/* 3. Volunteering & Wing Tab */}
      {activeTab === 'volunteer' && (
        <form onSubmit={handleSaveProfile} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Volunteering & Wing Participation</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select the social causes and field operations you are passionate about contributing to.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <span className="block text-xs font-semibold text-slate-700 mb-2">
                Volunteer Focus Areas & Interests:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {VOLUNTEER_INTEREST_OPTIONS.map((interest) => {
                  const isChecked = volunteerInterests.includes(interest);
                  return (
                    <label
                      key={interest}
                      onClick={() => handleToggleInterest(interest)}
                      className={`p-3 rounded-2xl border text-xs font-medium flex items-center gap-3 cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-rose-50/60 border-[#B62A35] text-slate-900 font-bold shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="w-4 h-4 text-[#B62A35] rounded focus:ring-0"
                      />
                      <span>{interest}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <HeartHandshake className="w-4 h-4 text-[#F1AD1A]" />
                <span>Wing Transfer or Volunteer Escalation</span>
              </div>
              <p className="text-slate-600">
                Want to formally request a transfer to a different wing or apply for coordinator duties? You can submit an official request directly to our administrators via your dashboard:
              </p>
              <Link
                href="/dashboard?tab=requests"
                className="inline-flex items-center gap-1.5 text-[#B62A35] font-bold hover:underline"
              >
                <span>Submit Wing Request in Dashboard</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-[#B62A35] hover:bg-[#9E1F2A] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Volunteering Interests</span>
            </button>
          </div>
        </form>
      )}

      {/* 4. Account & Security Tab */}
      {activeTab === 'security' && (
        <form onSubmit={handleChangePassword} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Change Password & Account Security</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Keep your account secure by maintaining a strong, unique password.
            </p>
          </div>

          <div className="space-y-4 max-w-md text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Current Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full pl-9 pr-10 py-2.5 border border-slate-200 rounded-xl focus:border-[#B62A35] focus:outline-hidden text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl focus:border-[#B62A35] focus:outline-hidden text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Confirm New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl focus:border-[#B62A35] focus:outline-hidden text-slate-900"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={changingPassword}
              className="px-5 py-2.5 bg-[#B62A35] hover:bg-[#9E1F2A] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {changingPassword ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Update Password</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* 5. Digital ID Card Live Preview */}
      {activeTab === 'card' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Official WCC Digital Identity Card</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time preview of your verified digital credential.
              </p>
            </div>
            {user?.memberId && (
              <Link
                href={`/verify/${encodeURIComponent(user.memberId)}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
              >
                <QrCode className="w-3.5 h-3.5 text-[#B62A35]" />
                <span>Public Verification</span>
              </Link>
            )}
          </div>

          <div className="flex justify-center py-4">
            <div className="w-full max-w-sm rounded-3xl overflow-hidden shadow-xl border border-slate-800 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white p-6 space-y-5 relative">
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#B62A35]/20 rounded-full blur-2xl pointer-events-none"></div>

              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-white p-1 border border-[#F1AD1A]">
                    <img src="/landing/wcc.png" alt="WCC" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <div className="text-xs font-black tracking-tight text-white">WE CAN CHANGE</div>
                    <div className="text-[9px] text-[#F1AD1A] font-bold uppercase tracking-wider">
                      Official Membership Card
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  VERIFIED
                </span>
              </div>

              {/* Card Body */}
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-800 border-2 border-[#F1AD1A] shrink-0 shadow-md">
                  {photoUrl ? (
                    <img src={photoUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-black text-xl text-[#F1AD1A]">
                      {name ? name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                </div>

                <div className="space-y-0.5 truncate">
                  <div className="text-sm font-black text-white truncate">{name || 'Member Name'}</div>
                  <div className="text-[11px] text-slate-400 font-mono font-bold">
                    {user?.memberId || 'WCC-PENDING'}
                  </div>
                  <div className="text-[10px] text-[#F1AD1A] font-semibold">
                    {user?.volunteerWing || user?.assignedWing?.nameEn || 'General Wing'}
                  </div>
                </div>
              </div>

              {/* Card Meta Grid */}
              <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-900/80 p-3 rounded-2xl border border-slate-800 relative z-10">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">Blood Group</span>
                  <span className="font-bold text-rose-400">{blood || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">Location</span>
                  <span className="font-bold text-slate-200 truncate block">{upazila || 'ঝালকাঠি'}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">Role</span>
                  <span className="font-bold text-slate-200 capitalize">{user?.role || 'Member'}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">Status</span>
                  <span className="font-bold text-emerald-400">Active</span>
                </div>
              </div>

              {/* Card Footer */}
              <div className="text-center text-[9px] text-slate-500 pt-1 border-t border-slate-800/80">
                আমরাই আনব পরিবর্তন — We Can Change Registry
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Camera Viewfinder Modal */}
      {cameraOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-white relative">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#B62A35]/20 text-[#B62A35] rounded-xl border border-[#B62A35]/30">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white">Click Photo</h3>
                  <p className="text-[11px] text-slate-400">Position your face within the frame</p>
                </div>
              </div>
              <button
                type="button"
                onClick={stopCamera}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error state */}
            {cameraError && (
              <div className="p-4 bg-rose-900/40 border border-rose-800 text-rose-200 rounded-2xl text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-rose-300">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Camera Access Failed</span>
                </div>
                <p className="text-[11px] leading-relaxed text-rose-200/90">{cameraError}</p>
                <button
                  type="button"
                  onClick={() => startCamera()}
                  className="px-3 py-1.5 bg-rose-800 hover:bg-rose-700 text-white rounded-lg text-[11px] font-bold transition-colors"
                >
                  Retry Camera
                </button>
              </div>
            )}

            {/* Viewfinder Video / Captured Snapshot */}
            <div className="relative aspect-square max-h-[340px] mx-auto bg-black rounded-2xl overflow-hidden border-2 border-slate-700 flex items-center justify-center shadow-inner">
              {cameraLoading ? (
                <div className="flex flex-col items-center space-y-2 text-slate-400">
                  <RefreshCw className="w-8 h-8 animate-spin text-[#B62A35]" />
                  <span className="text-xs font-semibold">Starting camera...</span>
                </div>
              ) : capturedPhoto ? (
                <img
                  src={capturedPhoto}
                  alt="Captured snapshot"
                  className="w-full h-full object-cover animate-in fade-in duration-150"
                />
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                  />
                  {/* Subtle face centering guide */}
                  <div className="absolute inset-8 rounded-full border-2 border-dashed border-white/30 pointer-events-none flex items-center justify-center">
                    <span className="text-[10px] text-white/40 font-mono tracking-widest uppercase">Center Face</span>
                  </div>
                </>
              )}
            </div>

            {/* Hidden Offscreen Canvas */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Modal Controls */}
            <div className="pt-2 flex items-center justify-between gap-3">
              {capturedPhoto ? (
                <>
                  <button
                    type="button"
                    onClick={retakePhoto}
                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Retake</span>
                  </button>
                  <button
                    type="button"
                    onClick={confirmCapturedPhoto}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Use This Photo</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={switchCamera}
                    title="Flip camera"
                    className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors flex items-center gap-1 text-xs font-semibold"
                  >
                    <SwitchCamera className="w-4 h-4" />
                    <span className="hidden sm:inline">Flip</span>
                  </button>

                  {/* Circular Shutter Button */}
                  <div className="flex-1 flex justify-center">
                    <button
                      type="button"
                      disabled={cameraLoading || Boolean(cameraError)}
                      onClick={capturePhoto}
                      className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed group"
                      title="Click Photo"
                    >
                      <div className="w-12 h-12 rounded-full bg-[#B62A35] group-hover:bg-[#9E1F2A] transition-colors"></div>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={stopCamera}
                    className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors text-xs font-semibold"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
