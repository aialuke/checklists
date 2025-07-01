import { requireAuth } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { logoutAction } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'

export default async function ProfilePage() {
  const session = await requireAuth()
  const { staff, department } = session

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile</h1>
      
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Staff Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <div className="mt-1 text-gray-900">{staff.name}</div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Staff Number</label>
            <div className="mt-1 text-gray-900">{staff.staff_number}</div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <div className="mt-1 text-gray-900">
              {staff.role === 'MANAGER' ? 'Manager' : 'Team Member'}
            </div>
          </div>
          
          {department && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Department</label>
              <div className="mt-1 text-gray-900">{department}</div>
            </div>
          )}
          
          <div className="pt-4">
            <form action={logoutAction}>
              <Button type="submit" variant="secondary" className="w-full">
                Sign Out
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
