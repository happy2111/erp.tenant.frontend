import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface Props {
  users: any;
  loading: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const OrganizationUserTable = ({ users, loading, onEdit, onDelete }: Props) => {
  if (loading) return <div>Loading...</div>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Full Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Position</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user: any) => (
          <TableRow key={user.id}>
            <TableCell>{user.user?.profile?.firstName} {user.user?.profile?.lastName}</TableCell>
            <TableCell>{user.user?.email}</TableCell>
            <TableCell>{user.role}</TableCell>
            <TableCell>{user.position || "-"}</TableCell>
            <TableCell className="space-x-2">
              <Button size="sm" variant="outline" onClick={() => onEdit(user.id)}>Edit</Button>
              <Button size="sm" variant="destructive" onClick={() => onDelete(user.id)}>Delete</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
