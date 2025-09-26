/**
 * @jest-environment jsdom
 */

import { isAdmin, isSuperAdmin, isOrgAdminClient, canInviteUsers } from "@/lib/client-role.utils";

describe("Role Utilities", () => {
  describe("isAdmin", () => {
    it("should return true when user has admin role in any organization", () => {
      const user = {
        id: "1",
        email: "admin@example.com",
        role: "user",
        members: [
          { role: "admin", organizationId: "org1" },
          { role: "member", organizationId: "org2" }
        ]
      };

      expect(isAdmin(user)).toBe(true);
    });

    it("should return false when user has no admin roles", () => {
      const user = {
        id: "1",
        email: "user@example.com",
        role: "user",
        members: [
          { role: "member", organizationId: "org1" }
        ]
      };

      expect(isAdmin(user)).toBe(false);
    });

    it("should return false when user is null", () => {
      expect(isAdmin(null)).toBe(false);
    });

    it("should return false when user has no members", () => {
      const user = {
        id: "1",
        email: "user@example.com",
        role: "user",
        members: undefined
      };

      expect(isAdmin(user)).toBe(false);
    });
  });

  describe("isSuperAdmin", () => {
    it("should return true when user has super-admin role", () => {
      const user = {
        id: "1",
        email: "superadmin@example.com",
        role: "super-admin",
        members: []
      };

      expect(isSuperAdmin(user)).toBe(true);
    });

    it("should return false when user does not have super-admin role", () => {
      const user = {
        id: "1",
        email: "user@example.com",
        role: "user",
        members: []
      };

      expect(isSuperAdmin(user)).toBe(false);
    });

    it("should return false when user is null", () => {
      expect(isSuperAdmin(null)).toBe(false);
    });
  });

  describe("isOrgAdminClient", () => {
    it("should return true when user is admin of specific organization", () => {
      const user = {
        id: "1",
        email: "admin@example.com",
        role: "user",
        members: [
          { role: "admin", organizationId: "org1" },
          { role: "member", organizationId: "org2" }
        ]
      };

      expect(isOrgAdminClient(user, "org1")).toBe(true);
    });

    it("should return true when user is owner of specific organization", () => {
      const user = {
        id: "1",
        email: "owner@example.com",
        role: "user",
        members: [
          { role: "owner", organizationId: "org1" }
        ]
      };

      expect(isOrgAdminClient(user, "org1")).toBe(true);
    });

    it("should return false when user is not admin of specific organization", () => {
      const user = {
        id: "1",
        email: "user@example.com",
        role: "user",
        members: [
          { role: "member", organizationId: "org1" }
        ]
      };

      expect(isOrgAdminClient(user, "org1")).toBe(false);
    });

    it("should return false when user is null", () => {
      expect(isOrgAdminClient(null, "org1")).toBe(false);
    });
  });

  describe("canInviteUsers", () => {
    it("should return true for super admin", () => {
      const user = {
        id: "1",
        email: "superadmin@example.com",
        role: "super-admin",
        members: []
      };

      expect(canInviteUsers(user)).toBe(true);
    });

    it("should return true for organization admin", () => {
      const user = {
        id: "1",
        email: "admin@example.com",
        role: "user",
        members: [
          { role: "admin", organizationId: "org1" }
        ]
      };

      expect(canInviteUsers(user)).toBe(true);
    });

    it("should return false for regular user", () => {
      const user = {
        id: "1",
        email: "user@example.com",
        role: "user",
        members: [
          { role: "member", organizationId: "org1" }
        ]
      };

      expect(canInviteUsers(user)).toBe(false);
    });

    it("should return false when user is null", () => {
      expect(canInviteUsers(null)).toBe(false);
    });
  });
});