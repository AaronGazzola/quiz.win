import { auth } from "@/lib/auth";
import { getUserAdminOrganizations } from "@/lib/role.utils";
import { headers } from "next/headers";
import { PermissionGuard } from "./PermissionGuard";

export default async function ServerPermissionExample() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return <div>Please sign in to continue</div>;
  }

  const adminOrgs = await getUserAdminOrganizations(session.user.id);
  const canManageAnyUsers = adminOrgs.length > 0;

  return (
    <div className="space-y-4">
      <h2>Server-side Permission Example</h2>

      <div className="border p-4 rounded">
        <h3>Direct Server-side Check</h3>
        {canManageAnyUsers ? (
          <p className="text-green-600">You can manage users in {adminOrgs.length} organizations</p>
        ) : (
          <p className="text-red-600">You don&apos;t have user management permissions</p>
        )}
      </div>

      {adminOrgs.map(org => (
        <div key={org.id} className="border p-4 rounded">
          <h3>Organization: {org.name}</h3>

          <PermissionGuard
            organizationId={org.id}
            resource="user"
            action="view"
            fallback={<p className="text-red-600">Cannot view users</p>}
          >
            <p className="text-blue-600">✓ Can view users in this organization</p>
          </PermissionGuard>

          <PermissionGuard
            organizationId={org.id}
            resource="user"
            action="invite"
            fallback={<p className="text-red-600">Cannot invite users</p>}
          >
            <p className="text-green-600">✓ Can invite users to this organization</p>
          </PermissionGuard>

          <PermissionGuard
            organizationId={org.id}
            role="admin"
            fallback={<p className="text-red-600">Not an admin</p>}
          >
            <p className="text-purple-600">✓ Admin role confirmed</p>
          </PermissionGuard>

          <PermissionGuard
            organizationId={org.id}
            resource="quiz"
            action="create"
            fallback={<p className="text-red-600">Cannot create quizzes</p>}
          >
            <p className="text-orange-600">✓ Can create quizzes</p>
          </PermissionGuard>
        </div>
      ))}
    </div>
  );
}