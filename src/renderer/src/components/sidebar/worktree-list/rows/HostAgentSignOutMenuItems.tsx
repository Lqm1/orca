import { useEffect, useSyncExternalStore } from 'react'
import { LogOut } from 'lucide-react'
import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { useTranslate } from '@/i18n/use-translate'
import {
  readHostAgentSignInReport,
  refreshHostAgentSignInReport,
  subscribeHostAgentSignInReports
} from '@/runtime/provider-accounts/sign-in/host-agent-sign-in-status-client'
import { signOutAgentOnHost } from '@/lib/agent-sign-in/host-agent-sign-out'
import type { HostAgentSignInAgent } from '../../../../../../shared/host-agent-sign-in-status'

const AGENT_NAME: Record<HostAgentSignInAgent, string> = { claude: 'Claude', codex: 'Codex' }

/** "Sign out of Claude/Codex" for agents the host reports signed in; nothing otherwise. */
export function HostAgentSignOutMenuItems({
  environmentId,
  hostLabel,
  open
}: {
  environmentId: string
  hostLabel: string
  open: boolean
}): React.JSX.Element | null {
  const t = useTranslate()
  const report = useSyncExternalStore(subscribeHostAgentSignInReports, () =>
    readHostAgentSignInReport(environmentId)
  )
  useEffect(() => {
    if (open) {
      // Asked only when the menu opens; the host answers from its own one-minute cache.
      void refreshHostAgentSignInReport(environmentId)
    }
  }, [environmentId, open])
  // API-key logins live in the host's own environment, which Orca does not manage.
  const signedIn = (report?.agents ?? []).filter(
    (entry) => entry.state === 'signedIn' && entry.method !== 'apiKey'
  )
  if (signedIn.length === 0) {
    return null
  }
  return (
    <>
      <DropdownMenuSeparator />
      <DropdownMenuLabel className="truncate text-[11px] font-medium text-muted-foreground">
        {t('agentSignIn.menuLabel', 'Agents on {{host}}', { host: hostLabel })}
      </DropdownMenuLabel>
      {signedIn.map((entry) => (
        <DropdownMenuItem
          key={entry.agent}
          onSelect={() => void signOutAgentOnHost(environmentId, hostLabel, entry.agent)}
        >
          <LogOut className="size-3.5" />
          {t('agentSignIn.signOutOf', 'Sign out of {{agent}}', { agent: AGENT_NAME[entry.agent] })}
        </DropdownMenuItem>
      ))}
    </>
  )
}
