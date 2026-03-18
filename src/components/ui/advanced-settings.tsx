import { useState } from 'react';
import { Settings, Bell, Zap, Shield, Palette, Database, Code, ChevronRight, Save, RotateCcw } from 'lucide-react';
import { Button } from './button';

interface SettingsSection {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  component: React.ReactNode;
}

interface AdvancedSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: AppSettings) => Promise<void>;
  currentSettings: AppSettings;
}

export interface AppSettings {
  scanning: {
    autoScan: boolean;
    scanDepth: 'basic' | 'standard' | 'deep';
    parallelScans: number;
    scanSchedule?: {
      enabled: boolean;
      frequency: 'daily' | 'weekly' | 'monthly';
      time: string;
    };
  };
  notifications: {
    enabled: boolean;
    email: boolean;
    desktop: boolean;
    criticalOnly: boolean;
    digestFrequency: 'realtime' | 'daily' | 'weekly';
  };
  autoFix: {
    enabled: boolean;
    requireApproval: boolean;
    maxBatchSize: number;
    autoPublish: boolean;
    categories: string[];
  };
  display: {
    theme: 'light' | 'dark' | 'auto';
    compactMode: boolean;
    showTips: boolean;
    defaultView: 'grid' | 'list' | 'table';
  };
  api: {
    canvasToken?: string;
    webhookUrl?: string;
    rateLimit: number;
  };
  advanced: {
    debugMode: boolean;
    cacheEnabled: boolean;
    cacheDuration: number;
    logLevel: 'error' | 'warn' | 'info' | 'debug';
  };
}

export function AdvancedSettings({ 
  isOpen, 
  onClose, 
  onSave,
  currentSettings
}: AdvancedSettingsProps) {
  const [settings, setSettings] = useState<AppSettings>(currentSettings);
  const [activeSection, setActiveSection] = useState('scanning');
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  if (!isOpen) return null;

  const sections: SettingsSection[] = [
    {
      id: 'scanning',
      title: 'Scanning',
      description: 'Configure scan behavior',
      icon: Zap,
      component: <ScanningSettings settings={settings} onChange={(s) => {
        setSettings(s);
        setHasChanges(true);
      }} />
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Manage alerts and updates',
      icon: Bell,
      component: <NotificationSettings settings={settings} onChange={(s) => {
        setSettings(s);
        setHasChanges(true);
      }} />
    },
    {
      id: 'autofix',
      title: 'Auto-Fix',
      description: 'Automated issue resolution',
      icon: Zap,
      component: <AutoFixSettings settings={settings} onChange={(s) => {
        setSettings(s);
        setHasChanges(true);
      }} />
    },
    {
      id: 'display',
      title: 'Display',
      description: 'Appearance and layout',
      icon: Palette,
      component: <DisplaySettings settings={settings} onChange={(s) => {
        setSettings(s);
        setHasChanges(true);
      }} />
    },
    {
      id: 'api',
      title: 'API & Integrations',
      description: 'External connections',
      icon: Code,
      component: <ApiSettings settings={settings} onChange={(s) => {
        setSettings(s);
        setHasChanges(true);
      }} />
    },
    {
      id: 'advanced',
      title: 'Advanced',
      description: 'Developer options',
      icon: Database,
      component: <AdvancedOptions settings={settings} onChange={(s) => {
        setSettings(s);
        setHasChanges(true);
      }} />
    }
  ];

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(settings);
      setHasChanges(false);
      setTimeout(() => onClose(), 500);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('Reset all settings to defaults?')) {
      setSettings(currentSettings);
      setHasChanges(false);
    }
  };

  const activeContent = sections.find(s => s.id === activeSection);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[16px] w-full max-w-[1000px] h-[700px] shadow-2xl flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-[280px] border-r border-[#e5e5e7] bg-[#EEECE8] flex-shrink-0">
          <div className="p-6 border-b border-[#e5e5e7] bg-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0071e3] to-[#00d084] flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" strokeWidth={2} />
              </div>
              <div>
                <h2 className="text-[18px] font-semibold text-[#1d1d1f]">Settings</h2>
                <p className="text-[12px] text-[#636366]">Configure SIMPLIFY</p>
              </div>
            </div>
          </div>

          <nav className="p-3 space-y-1">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;

              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                    isActive
                      ? 'bg-white text-[#0071e3] shadow-sm'
                      : 'text-[#1d1d1f] hover:bg-white/50'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-[#0071e3]' : 'text-[#636366]'}`} strokeWidth={2} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-[14px] font-medium ${isActive ? 'text-[#0071e3]' : 'text-[#1d1d1f]'}`}>
                      {section.title}
                    </p>
                    <p className="text-[11px] text-[#636366] truncate">
                      {section.description}
                    </p>
                  </div>
                  {isActive && (
                    <ChevronRight className="w-4 h-4 text-[#0071e3]" strokeWidth={2} />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-[#e5e5e7]">
            <h3 className="text-[20px] font-semibold text-[#1d1d1f] mb-1">
              {activeContent?.title}
            </h3>
            <p className="text-[14px] text-[#636366]">
              {activeContent?.description}
            </p>
          </div>

          {/* Settings Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeContent?.component}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-[#e5e5e7] flex items-center justify-between bg-[#EEECE8]">
            <Button
              onClick={handleReset}
              className="h-10 px-4 rounded-lg border border-[#d2d2d7] bg-white text-[#1d1d1f] hover:bg-[#f5f5f7]"
            >
              <RotateCcw className="w-4 h-4 mr-2" strokeWidth={2} />
              Reset
            </Button>

            <div className="flex items-center gap-3">
              <Button
                onClick={onClose}
                disabled={isSaving}
                className="h-10 px-6 rounded-lg border border-[#d2d2d7] bg-white text-[#1d1d1f] hover:bg-[#f5f5f7]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                className="h-10 px-6 rounded-lg bg-[#0071e3] hover:bg-[#0077ed] text-white disabled:opacity-50"
              >
                {isSaving ? (
                  <>Saving...</>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" strokeWidth={2} />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Settings Sections
function ScanningSettings({ settings, onChange }: {
  settings: AppSettings;
  onChange: (settings: AppSettings) => void;
}) {
  return (
    <div className="space-y-6">
      <SettingToggle
        label="Auto-scan new courses"
        description="Automatically scan courses when imported"
        checked={settings.scanning.autoScan}
        onChange={(checked) => onChange({
          ...settings,
          scanning: { ...settings.scanning, autoScan: checked }
        })}
      />

      <SettingSelect
        label="Scan Depth"
        description="How thoroughly to analyze content"
        value={settings.scanning.scanDepth}
        options={[
          { value: 'basic', label: 'Basic - Quick overview' },
          { value: 'standard', label: 'Standard - Recommended' },
          { value: 'deep', label: 'Deep - Comprehensive analysis' }
        ]}
        onChange={(value) => onChange({
          ...settings,
          scanning: { ...settings.scanning, scanDepth: value as any }
        })}
      />

      <SettingNumber
        label="Parallel Scans"
        description="Maximum concurrent scans (1-5)"
        value={settings.scanning.parallelScans}
        min={1}
        max={5}
        onChange={(value) => onChange({
          ...settings,
          scanning: { ...settings.scanning, parallelScans: value }
        })}
      />
    </div>
  );
}

function NotificationSettings({ settings, onChange }: {
  settings: AppSettings;
  onChange: (settings: AppSettings) => void;
}) {
  return (
    <div className="space-y-6">
      <SettingToggle
        label="Enable Notifications"
        description="Receive alerts for scan results and issues"
        checked={settings.notifications.enabled}
        onChange={(checked) => onChange({
          ...settings,
          notifications: { ...settings.notifications, enabled: checked }
        })}
      />

      <SettingToggle
        label="Email Notifications"
        description="Send notifications to your email"
        checked={settings.notifications.email}
        disabled={!settings.notifications.enabled}
        onChange={(checked) => onChange({
          ...settings,
          notifications: { ...settings.notifications, email: checked }
        })}
      />

      <SettingToggle
        label="Desktop Notifications"
        description="Show browser notifications"
        checked={settings.notifications.desktop}
        disabled={!settings.notifications.enabled}
        onChange={(checked) => onChange({
          ...settings,
          notifications: { ...settings.notifications, desktop: checked }
        })}
      />

      <SettingToggle
        label="Critical Issues Only"
        description="Only notify for high-priority issues"
        checked={settings.notifications.criticalOnly}
        disabled={!settings.notifications.enabled}
        onChange={(checked) => onChange({
          ...settings,
          notifications: { ...settings.notifications, criticalOnly: checked }
        })}
      />
    </div>
  );
}

function AutoFixSettings({ settings, onChange }: {
  settings: AppSettings;
  onChange: (settings: AppSettings) => void;
}) {
  return (
    <div className="space-y-6">
      <SettingToggle
        label="Enable Auto-Fix"
        description="Automatically fix detected issues"
        checked={settings.autoFix.enabled}
        onChange={(checked) => onChange({
          ...settings,
          autoFix: { ...settings.autoFix, enabled: checked }
        })}
      />

      <SettingToggle
        label="Require Approval"
        description="Review fixes before applying"
        checked={settings.autoFix.requireApproval}
        disabled={!settings.autoFix.enabled}
        onChange={(checked) => onChange({
          ...settings,
          autoFix: { ...settings.autoFix, requireApproval: checked }
        })}
      />

      <SettingNumber
        label="Max Batch Size"
        description="Maximum fixes per batch (1-100)"
        value={settings.autoFix.maxBatchSize}
        min={1}
        max={100}
        disabled={!settings.autoFix.enabled}
        onChange={(value) => onChange({
          ...settings,
          autoFix: { ...settings.autoFix, maxBatchSize: value }
        })}
      />
    </div>
  );
}

function DisplaySettings({ settings, onChange }: {
  settings: AppSettings;
  onChange: (settings: AppSettings) => void;
}) {
  return (
    <div className="space-y-6">
      <SettingSelect
        label="Theme"
        description="Choose your preferred theme"
        value={settings.display.theme}
        options={[
          { value: 'light', label: 'Light' },
          { value: 'dark', label: 'Dark' },
          { value: 'auto', label: 'Auto (System)' }
        ]}
        onChange={(value) => onChange({
          ...settings,
          display: { ...settings.display, theme: value as any }
        })}
      />

      <SettingToggle
        label="Compact Mode"
        description="Use denser spacing"
        checked={settings.display.compactMode}
        onChange={(checked) => onChange({
          ...settings,
          display: { ...settings.display, compactMode: checked }
        })}
      />

      <SettingToggle
        label="Show Tips"
        description="Display helpful tooltips"
        checked={settings.display.showTips}
        onChange={(checked) => onChange({
          ...settings,
          display: { ...settings.display, showTips: checked }
        })}
      />
    </div>
  );
}

function ApiSettings({ settings, onChange }: {
  settings: AppSettings;
  onChange: (settings: AppSettings) => void;
}) {
  return (
    <div className="space-y-6">
      <SettingInput
        label="Canvas API Token"
        description="Your Canvas LMS API access token"
        value={settings.api.canvasToken || ''}
        type="password"
        placeholder="Enter API token..."
        onChange={(value) => onChange({
          ...settings,
          api: { ...settings.api, canvasToken: value }
        })}
      />

      <SettingInput
        label="Webhook URL"
        description="Receive events at this endpoint"
        value={settings.api.webhookUrl || ''}
        placeholder="https://example.com/webhook"
        onChange={(value) => onChange({
          ...settings,
          api: { ...settings.api, webhookUrl: value }
        })}
      />
    </div>
  );
}

function AdvancedOptions({ settings, onChange }: {
  settings: AppSettings;
  onChange: (settings: AppSettings) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-[13px] text-amber-800 leading-relaxed">
          ⚠️ These settings are for advanced users. Incorrect configuration may affect performance.
        </p>
      </div>

      <SettingToggle
        label="Debug Mode"
        description="Enable detailed logging"
        checked={settings.advanced.debugMode}
        onChange={(checked) => onChange({
          ...settings,
          advanced: { ...settings.advanced, debugMode: checked }
        })}
      />

      <SettingToggle
        label="Enable Caching"
        description="Cache scan results for faster loading"
        checked={settings.advanced.cacheEnabled}
        onChange={(checked) => onChange({
          ...settings,
          advanced: { ...settings.advanced, cacheEnabled: checked }
        })}
      />

      <SettingSelect
        label="Log Level"
        description="Verbosity of system logs"
        value={settings.advanced.logLevel}
        options={[
          { value: 'error', label: 'Error - Minimal' },
          { value: 'warn', label: 'Warning - Standard' },
          { value: 'info', label: 'Info - Detailed' },
          { value: 'debug', label: 'Debug - Everything' }
        ]}
        onChange={(value) => onChange({
          ...settings,
          advanced: { ...settings.advanced, logLevel: value as any }
        })}
      />
    </div>
  );
}

// Setting Components
function SettingToggle({ label, description, checked, disabled, onChange }: {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className={`flex items-start gap-4 p-4 rounded-lg hover:bg-[#f5f5f7] transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="w-5 h-5 mt-0.5 rounded border-[#d2d2d7] text-[#0071e3] focus:ring-2 focus:ring-[#0071e3] disabled:opacity-50"
      />
      <div className="flex-1">
        <p className="text-[14px] font-medium text-[#1d1d1f] mb-0.5">{label}</p>
        <p className="text-[12px] text-[#636366]">{description}</p>
      </div>
    </label>
  );
}

function SettingSelect({ label, description, value, options, disabled, onChange }: {
  label: string;
  description: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="block mb-2">
        <p className="text-[14px] font-medium text-[#1d1d1f] mb-0.5">{label}</p>
        <p className="text-[12px] text-[#636366]">{description}</p>
      </label>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-11 px-4 rounded-lg border border-[#d2d2d7] bg-white text-[14px] text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#0071e3] disabled:opacity-50"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

function SettingNumber({ label, description, value, min, max, disabled, onChange }: {
  label: string;
  description: string;
  value: number;
  min: number;
  max: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <label className="block mb-2">
        <p className="text-[14px] font-medium text-[#1d1d1f] mb-0.5">{label}</p>
        <p className="text-[12px] text-[#636366]">{description}</p>
      </label>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-11 px-4 rounded-lg border border-[#d2d2d7] bg-white text-[14px] text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#0071e3] disabled:opacity-50"
      />
    </div>
  );
}

function SettingInput({ label, description, value, type = 'text', placeholder, onChange }: {
  label: string;
  description: string;
  value: string;
  type?: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="block mb-2">
        <p className="text-[14px] font-medium text-[#1d1d1f] mb-0.5">{label}</p>
        <p className="text-[12px] text-[#636366]">{description}</p>
      </label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-11 px-4 rounded-lg border border-[#d2d2d7] bg-white text-[14px] text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
      />
    </div>
  );
}
