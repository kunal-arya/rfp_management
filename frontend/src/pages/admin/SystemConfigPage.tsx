import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Settings, 
  Save,
  Database,
  Mail,
  Shield,
  FileText,
  Users,
  Bell
} from 'lucide-react';

const SystemConfigPage: React.FC = () => {
  const [config, setConfig] = useState({
    // Email Settings
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUser: 'admin@example.com',
    smtpPassword: '********',
    emailNotifications: true,
    
    // File Upload Settings
    maxFileSize: '10',
    allowedFileTypes: 'pdf,doc,docx,jpg,png',
    storageProvider: 'local',
    
    // Security Settings
    sessionTimeout: '60',
    maxLoginAttempts: '5',
    passwordMinLength: '8',
    twoFactorAuth: false,
    
    // System Settings
    maintenanceMode: false,
    debugMode: false,
    autoBackup: true,
    backupFrequency: 'daily',
    
    // Notification Settings
    pushNotifications: true,
    notificationFrequency: 'immediate',
    
    // API Settings
    rateLimit: '100',
    apiTimeout: '30',
    corsEnabled: true
  });

  const handleConfigChange = (key: string, value: string | boolean) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Saving configuration:', config);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">System Configuration</h1>
          <p className="text-muted-foreground">Manage system settings and configurations</p>
        </div>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      {/* Email Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="h-5 w-5 mr-2" />
            Email Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="smtpHost">SMTP Host</Label>
              <Input
                id="smtpHost"
                value={config.smtpHost}
                onChange={(e) => handleConfigChange('smtpHost', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="smtpPort">SMTP Port</Label>
              <Input
                id="smtpPort"
                value={config.smtpPort}
                onChange={(e) => handleConfigChange('smtpPort', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="smtpUser">SMTP Username</Label>
              <Input
                id="smtpUser"
                value={config.smtpUser}
                onChange={(e) => handleConfigChange('smtpUser', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="smtpPassword">SMTP Password</Label>
              <Input
                id="smtpPassword"
                type="password"
                value={config.smtpPassword}
                onChange={(e) => handleConfigChange('smtpPassword', e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="emailNotifications"
              checked={config.emailNotifications}
              onCheckedChange={(checked) => handleConfigChange('emailNotifications', checked)}
            />
            <Label htmlFor="emailNotifications">Enable Email Notifications</Label>
          </div>
        </CardContent>
      </Card>

      {/* File Upload Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            File Upload Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="maxFileSize">Maximum File Size (MB)</Label>
              <Input
                id="maxFileSize"
                value={config.maxFileSize}
                onChange={(e) => handleConfigChange('maxFileSize', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="allowedFileTypes">Allowed File Types</Label>
              <Input
                id="allowedFileTypes"
                value={config.allowedFileTypes}
                onChange={(e) => handleConfigChange('allowedFileTypes', e.target.value)}
                placeholder="pdf,doc,docx,jpg,png"
              />
            </div>
            <div>
              <Label htmlFor="storageProvider">Storage Provider</Label>
              <select
                id="storageProvider"
                value={config.storageProvider}
                onChange={(e) => handleConfigChange('storageProvider', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="local">Local Storage</option>
                <option value="s3">Amazon S3</option>
                <option value="gcs">Google Cloud Storage</option>
                <option value="azure">Azure Blob Storage</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Security Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
              <Input
                id="sessionTimeout"
                value={config.sessionTimeout}
                onChange={(e) => handleConfigChange('sessionTimeout', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="maxLoginAttempts">Maximum Login Attempts</Label>
              <Input
                id="maxLoginAttempts"
                value={config.maxLoginAttempts}
                onChange={(e) => handleConfigChange('maxLoginAttempts', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
              <Input
                id="passwordMinLength"
                value={config.passwordMinLength}
                onChange={(e) => handleConfigChange('passwordMinLength', e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="twoFactorAuth"
              checked={config.twoFactorAuth}
              onCheckedChange={(checked) => handleConfigChange('twoFactorAuth', checked)}
            />
            <Label htmlFor="twoFactorAuth">Enable Two-Factor Authentication</Label>
          </div>
        </CardContent>
      </Card>

      {/* System Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            System Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="backupFrequency">Backup Frequency</Label>
              <select
                id="backupFrequency"
                value={config.backupFrequency}
                onChange={(e) => handleConfigChange('backupFrequency', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <Label htmlFor="rateLimit">API Rate Limit (requests/min)</Label>
              <Input
                id="rateLimit"
                value={config.rateLimit}
                onChange={(e) => handleConfigChange('rateLimit', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="apiTimeout">API Timeout (seconds)</Label>
              <Input
                id="apiTimeout"
                value={config.apiTimeout}
                onChange={(e) => handleConfigChange('apiTimeout', e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Switch
                id="maintenanceMode"
                checked={config.maintenanceMode}
                onCheckedChange={(checked) => handleConfigChange('maintenanceMode', checked)}
              />
              <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="debugMode"
                checked={config.debugMode}
                onCheckedChange={(checked) => handleConfigChange('debugMode', checked)}
              />
              <Label htmlFor="debugMode">Debug Mode</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="autoBackup"
                checked={config.autoBackup}
                onCheckedChange={(checked) => handleConfigChange('autoBackup', checked)}
              />
              <Label htmlFor="autoBackup">Automatic Backup</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="corsEnabled"
                checked={config.corsEnabled}
                onCheckedChange={(checked) => handleConfigChange('corsEnabled', checked)}
              />
              <Label htmlFor="corsEnabled">Enable CORS</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="notificationFrequency">Notification Frequency</Label>
              <select
                id="notificationFrequency"
                value={config.notificationFrequency}
                onChange={(e) => handleConfigChange('notificationFrequency', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="immediate">Immediate</option>
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Switch
                id="pushNotifications"
                checked={config.pushNotifications}
                onCheckedChange={(checked) => handleConfigChange('pushNotifications', checked)}
              />
              <Label htmlFor="pushNotifications">Push Notifications</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Database Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="h-5 w-5 mr-2" />
            Database Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Database Type</Label>
                <div className="text-sm text-muted-foreground">PostgreSQL</div>
              </div>
              <div>
                <Label>Connection Status</Label>
                <div className="text-sm text-green-600">Connected</div>
              </div>
              <div>
                <Label>Database Size</Label>
                <div className="text-sm text-muted-foreground">2.4 GB</div>
              </div>
              <div>
                <Label>Last Backup</Label>
                <div className="text-sm text-muted-foreground">2 hours ago</div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                Test Connection
              </Button>
              <Button variant="outline" size="sm">
                Create Backup
              </Button>
              <Button variant="outline" size="sm">
                Optimize Database
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemConfigPage;
