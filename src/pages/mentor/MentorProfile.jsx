import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Card, CardHeader } from '../../components/common/Card';
import { 
  UserCog, 
  Save, 
  Award, 
  BookOpen, 
  School, 
  CheckCircle2, 
  Loader2,
  Sparkles
} from 'lucide-react';

export function MentorProfile() {
  const { user, refreshProfile } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    institution: user?.institution || 'National Institute of Technology',
    department: user?.department || 'Computer Science & Engineering',
    bio: user?.bio || '',
    expertise: user?.expertise || '',
    skills: user?.skills || '',
    experience_years: user?.experience_years || 12,
    availability_status: user?.availability_status || 'available',
    max_capacity: user?.max_capacity || 5
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      await api.updateProfile({
        ...formData,
        experience_years: parseInt(formData.experience_years, 10),
        max_capacity: parseInt(formData.max_capacity, 10)
      });
      await refreshProfile();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-charcoal-900 tracking-tight">
          Faculty Profile & Mentorship Capacity
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-500 mt-0.5">
          Configure your research expertise, matching keywords, and maximum student intake
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Profile configuration and capacity limits saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader
            title="Academic Affiliation"
            subtitle="Your university credentials and department"
          />

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-300 text-xs outline-none font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">
                  Institution
                </label>
                <input
                  type="text"
                  required
                  name="institution"
                  value={formData.institution}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-300 text-xs outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">
                Department
              </label>
              <input
                type="text"
                required
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-300 text-xs outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">
                Faculty Bio / Academic Summary
              </label>
              <textarea
                rows={3}
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Brief summary of your academic background, laboratory, and research programs..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-300 text-xs outline-none leading-relaxed"
              />
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Matching Parameters & Technical Stack"
            subtitle="Used by the weighted matching algorithm to compute project relevance (30% domain, 25% skills)"
          />

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">
                Primary Expertise Areas (Keywords)
              </label>
              <input
                type="text"
                name="expertise"
                value={formData.expertise}
                onChange={handleChange}
                placeholder="e.g. Federated Learning, Healthcare AI, Privacy-Preserving Systems"
                className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-300 text-xs font-medium outline-none"
              />
              <p className="text-[11px] text-charcoal-400 mt-1">
                Contributes 30% to student match score calculations.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">
                Technical Skills & Frameworks (Comma separated)
              </label>
              <input
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                placeholder="e.g. PyTorch, Python, Docker, FAISS, CUDA, Distributed Systems"
                className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-300 text-xs font-mono outline-none"
              />
              <p className="text-[11px] text-charcoal-400 mt-1">
                Contributes 25% to student match score calculations.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">
                  Mentorship Exp. (Years)
                </label>
                <input
                  type="number"
                  min={0}
                  max={45}
                  name="experience_years"
                  value={formData.experience_years}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl border border-charcoal-300 text-xs outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">
                  Availability Status
                </label>
                <select
                  name="availability_status"
                  value={formData.availability_status}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl border border-charcoal-300 text-xs font-bold outline-none bg-white cursor-pointer"
                >
                  <option value="available">Available (Accepting students)</option>
                  <option value="limited">Limited Capacity</option>
                  <option value="unavailable">Unavailable (Lab Full)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">
                  Max Student Cap
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  name="max_capacity"
                  value={formData.max_capacity}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl border border-charcoal-300 text-xs outline-none font-bold"
                />
              </div>
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-accent-600 hover:bg-accent-700 text-white font-bold text-xs sm:text-sm shadow-sm shadow-accent-500/25 transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Profile & Capacity
          </button>
        </div>
      </form>
    </div>
  );
}
