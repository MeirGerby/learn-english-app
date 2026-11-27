import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  getBandLabel,
  type UserListItem,
} from '@learn-english/english-contract';
import { Badge } from '@learn-english/ui/components/ui/badge';
import { Button } from '@learn-english/ui/components/ui/button';
import { Input } from '@learn-english/ui/components/ui/input';
import { useTRPC } from '../../../lib/trpc';

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('he-IL');
}

// Every registered account. The page shows it to admins only, and the BFF
// refuses the request from anyone else.
export function UsersList() {
  const trpc = useTRPC();
  const users = useQuery(trpc.dashboard.listUsers.queryOptions());
  const [search, setSearch] = useState('');

  const all = users.data ?? [];
  const term = search.trim().toLowerCase();
  const shown = all.filter((user) =>
    `${user.email} ${user.displayName ?? ''}`.toLowerCase().includes(term),
  );

  return (
    <section className="mb-8">
      <h2 className="font-semibold text-lg mb-3">
        משתמשים{users.data ? ` (${all.length})` : ''}
      </h2>

      {users.isPending ? (
        <p className="text-sm text-muted-foreground">טוען משתמשים...</p>
      ) : users.isError ? (
        <div className="flex items-center gap-3">
          <p className="text-sm text-destructive">טעינת המשתמשים נכשלה.</p>
          <Button
            variant="outline"
            className="h-11"
            onClick={() => void users.refetch()}
          >
            נסו שוב
          </Button>
        </div>
      ) : (
        <>
          <Input
            type="search"
            aria-label="חיפוש משתמש"
            placeholder="חיפוש לפי אימייל או שם"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-3 h-11"
          />
          {shown.length === 0 ? (
            <p className="text-sm text-muted-foreground">לא נמצאו משתמשים.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {shown.map((user) => (
                <UserCard key={user.id} user={user} />
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}

function UserCard({ user }: { user: UserListItem }) {
  const answers = user.totalCorrect + user.totalIncorrect;
  const details = [
    ['רמה', user.placementBand ? getBandLabel(user.placementBand) : 'לא נבחן'],
    ['ניקוד', String(user.totalScore)],
    ['תשובות נכונות', answers ? `${user.totalCorrect} מתוך ${answers}` : '-'],
    ['רצף שיא', String(user.bestStreak)],
    ['הצטרפות', formatDate(user.createdAt)],
    ['תרגול אחרון', user.lastActiveAt ? formatDate(user.lastActiveAt) : '-'],
  ];

  return (
    <li className="bg-card border rounded-lg p-4">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="min-w-0">
          {user.displayName && (
            <p className="text-sm font-semibold m-0">{user.displayName}</p>
          )}
          <p className="text-sm break-all m-0">
            <span dir="ltr">{user.email}</span>
          </p>
        </div>
        {user.isAdmin && <Badge>ניהול</Badge>}
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1 border-t pt-2 text-xs">
        {details.map(([label, value]) => (
          <div key={label} className="flex gap-1">
            <dt className="text-muted-foreground">{label}:</dt>
            <dd className="m-0">{value}</dd>
          </div>
        ))}
      </dl>
    </li>
  );
}
