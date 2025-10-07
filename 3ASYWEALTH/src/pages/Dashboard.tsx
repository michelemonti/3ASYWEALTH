// src/pages/Dashboard.tsx
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'
import { 
  User, 
  Building2, 
  Shield, 
  Clock,
  Mail,
  Briefcase,
  MapPin 
} from 'lucide-react'

export function Dashboard() {
  const { 
    user, 
    authMode, 
    getUserName, 
    getUserEmail, 
    getUserRoles 
  } = useAuth()

  const roles = getUserRoles()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {getUserName()}!
          </h1>
          <p className="text-gray-600">
            Here's your account overview and system information.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* User Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Name</label>
                <p className="text-gray-900">{getUserName()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900">{getUserEmail()}</p>
                </div>
              </div>
              {authMode === 'azure' && user?.jobTitle && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Job Title</label>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-gray-400" />
                    <p className="text-gray-900">{user.jobTitle}</p>
                  </div>
                </div>
              )}
              {authMode === 'azure' && user?.department && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Department</label>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <p className="text-gray-900">{user.department}</p>
                  </div>
                </div>
              )}
              {authMode === 'azure' && user?.officeLocation && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Office Location</label>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <p className="text-gray-900">{user.officeLocation}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Authentication Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Authentication
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Mode</label>
                <div className="flex items-center gap-2">
                  {authMode === 'azure' ? (
                    <>
                      <Building2 className="w-4 h-4 text-blue-600" />
                      <Badge className="bg-blue-100 text-blue-800">
                        Azure AD Enterprise
                      </Badge>
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 text-green-600" />
                      <Badge className="bg-green-100 text-green-800">
                        Supabase Standard
                      </Badge>
                    </>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <p className="text-gray-900">Authenticated</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Session</label>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Roles & Permissions (Azure only) */}
          {authMode === 'azure' && roles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Azure AD Groups
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {roles.map((role, index) => (
                    <Badge key={index} variant="secondary">
                      {role}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Your permissions are managed through Azure AD group membership.
                </p>
              </CardContent>
            </Card>
          )}

          {/* System Info Card */}
          <Card className={authMode === 'azure' && roles.length > 0 ? 'md:col-span-2 lg:col-span-3' : ''}>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <label className="text-gray-500">Template Version</label>
                  <p className="font-medium">v1.0.0</p>
                </div>
                <div>
                  <label className="text-gray-500">Authentication</label>
                  <p className="font-medium">{authMode === 'azure' ? 'Azure AD' : 'Supabase'}</p>
                </div>
                <div>
                  <label className="text-gray-500">Environment</label>
                  <p className="font-medium">Development</p>
                </div>
                <div>
                  <label className="text-gray-500">Last Updated</label>
                  <p className="font-medium">{new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <Building2 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-medium text-gray-900">Manage Profile</h3>
                <p className="text-sm text-gray-500">Update your account information</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-medium text-gray-900">Security Settings</h3>
                <p className="text-sm text-gray-500">Manage authentication and security</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <User className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-medium text-gray-900">View Documentation</h3>
                <p className="text-sm text-gray-500">Learn about template features</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
