
import React, { useState, useEffect, useRef } from 'react';
import { useAccount } from '@/contexts/AccountContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Mail, Upload, X, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import AnimatedSection, { AnimatedHeading } from '@/components/ui/animated-section';

const IAM_ENDPOINT = 'https://iam.hanzo.ai';

const Account = () => {
  const { user, token, updateUserProfile } = useAccount();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.name || '');
      setEmail(user.email || '');
      setBio(user.bio || '');
      setLocation(user.location || '');
      setWebsite(user.website || '');
      setPhone(user.phone || '');
      setAvatarPreview(user.avatar || '');
    }
  }, [user]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAvatarPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      // Try to upload to IAM resource upload endpoint
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', file.name);
      formData.append('createdTime', new Date().toISOString());
      formData.append('provider', 'local');
      formData.append('application', 'app-hanzo');

      const res = await fetch(`${IAM_ENDPOINT}/api/upload-resource`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        const url = data?.data || data?.url || '';
        if (url) {
          setAvatarPreview(url);
          await updateUserProfile({ avatar: url });
          toast.success('Avatar updated');
          return;
        }
      }

      // Fallback: store as base64 data URL via profile update
      const base64 = await fileToBase64(file);
      setAvatarPreview(base64);
      await updateUserProfile({ avatar: base64 });
      toast.success('Avatar updated');
    } catch (err) {
      console.error('Avatar upload error:', err);
      toast.error('Upload failed — avatar saved locally');
    } finally {
      setUploading(false);
      // Reset input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveAvatar = async () => {
    setAvatarPreview('');
    await updateUserProfile({ avatar: '' });
    toast.success('Avatar removed');
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUserProfile({ name: fullName, email, bio, location, website, phone });
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-16 text-neutral-500">
        <p className="mb-4">Not signed in</p>
        <a href="https://hanzo.id/login" className="text-white underline underline-offset-2">
          Sign in to manage your account
        </a>
      </div>
    );
  }

  const initials = user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || '?';

  // Generated default avatar — DiceBear initials style (dark monochrome)
  const defaultAvatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name || user.email || 'user')}&backgroundColor=171717&textColor=ffffff&fontSize=40&fontWeight=600`;
  const displayAvatar = avatarPreview || defaultAvatarUrl;

  return (
    <AnimatedSection>
      <div className="space-y-10">
        <AnimatedHeading>
          <h2 className="text-2xl font-medium mb-8">Profile Settings</h2>
        </AnimatedHeading>

        {/* Avatar section */}
        <div className="flex flex-col md:flex-row md:items-center gap-8">
          <div className="relative group">
            <Avatar className="h-24 w-24 ring-1 ring-neutral-800">
              <AvatarImage src={displayAvatar} alt={user.name} />
              <AvatarFallback className="text-2xl font-semibold bg-neutral-900 text-white select-none">
                {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : initials}
              </AvatarFallback>
            </Avatar>
          </div>

          <div>
            <h2 className="text-2xl font-medium mb-1">{user.name}</h2>
            <div className="flex items-center text-neutral-400 text-sm mb-5">
              <Mail className="h-3.5 w-3.5 mr-1.5" />
              {user.email}
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/gif,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="bg-transparent border-neutral-700 hover:bg-neutral-900 hover:border-neutral-600 text-neutral-300 hover:text-white"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    Uploading…
                  </>
                ) : (
                  <>
                    <Upload className="h-3.5 w-3.5 mr-1.5" />
                    Upload picture
                  </>
                )}
              </Button>

              {avatarPreview && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveAvatar}
                  className="text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900"
                >
                  <X className="h-3.5 w-3.5 mr-1.5" />
                  Remove
                </Button>
              )}
            </div>
            <p className="text-xs text-neutral-600 mt-2">PNG, JPG, GIF or WebP — max 5MB</p>
          </div>
        </div>

        {/* Profile form */}
        <div className="border-t border-neutral-800 pt-8">
          <h3 className="text-lg font-medium mb-6">Personal Information</h3>

          <form onSubmit={handleProfileSubmit} className="space-y-6 max-w-xl">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-neutral-300 text-sm">Display Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="bg-neutral-950 border-neutral-800 focus:border-neutral-600 text-white placeholder:text-neutral-600"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-neutral-300 text-sm">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-neutral-950 border-neutral-800 focus:border-neutral-600 text-white placeholder:text-neutral-600"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-neutral-300 text-sm">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="bg-neutral-950 border-neutral-800 focus:border-neutral-600 text-white placeholder:text-neutral-600 min-h-24 resize-none"
                placeholder="A short bio about yourself"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="location" className="text-neutral-300 text-sm">Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="bg-neutral-950 border-neutral-800 focus:border-neutral-600 text-white placeholder:text-neutral-600"
                  placeholder="City, Country"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-neutral-300 text-sm">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-neutral-950 border-neutral-800 focus:border-neutral-600 text-white placeholder:text-neutral-600"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website" className="text-neutral-300 text-sm">Website</Label>
              <Input
                id="website"
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="bg-neutral-950 border-neutral-800 focus:border-neutral-600 text-white placeholder:text-neutral-600"
                placeholder="https://example.com"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={saving}
                className="bg-white text-black hover:bg-neutral-200 font-medium"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    Saving…
                  </>
                ) : (
                  'Save changes'
                )}
              </Button>
              <Link to="/user-profile">
                <Button
                  type="button"
                  variant="outline"
                  className="bg-transparent border-neutral-700 hover:bg-neutral-900 hover:border-neutral-600 text-neutral-400 hover:text-white"
                >
                  View public profile
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </AnimatedSection>
  );
};

// Convert File to base64 data URL
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default Account;
